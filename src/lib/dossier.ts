import {
  BOUNDARY_INDEX,
  CLAIMS,
  EVIDENCE_INDEX,
  INTEGRITY_ENTRY_INDEX,
} from "../data/claims.ts";

/**
 * C4-C G2 — Deterministic public dossier compiler.
 *
 * A dossier is a derived view over already-published truth. It never creates a
 * claim, evidence reference or boundary, and it never invents a destination:
 * every requested id is resolved against the canonical public selectors, and
 * anything that does not resolve is rejected and reported instead of rendered.
 *
 * The compiler is pure and deterministic: no clock, no randomness, no network,
 * no storage. The same request always compiles to the same dossier.
 */

export type Language = "en" | "vi" | "zh";

export const DOSSIER_SECTIONS = ["claims", "evidence", "boundaries"] as const;

export type DossierSection = (typeof DOSSIER_SECTIONS)[number];

export interface DossierRequest {
  lang: Language;
  /** Requested sections, in presentation order. Unknown names are ignored. */
  sections?: readonly string[];
  claimIds?: readonly string[];
  evidenceIds?: readonly string[];
  boundaryIds?: readonly string[];
}

export interface DossierEntry {
  id: string;
  section: DossierSection;
  /** Localized label or statement taken verbatim from the canonical source. */
  label: string;
  /** Localized second line (claim statement, boundary non-implication) or null. */
  detail: string | null;
  /** Canonical public destination, or null when the source defines none. */
  href: string | null;
  /** Authored review date only — never generated at runtime. */
  freshness: string | null;
  /** Evidence ids the source itself declares. Empty when it declares none. */
  evidenceIds: string[];
}

export type DossierRejectionReason = "not-public" | "duplicate";

export interface DossierRejection {
  id: string;
  section: DossierSection;
  reason: DossierRejectionReason;
}

export interface CompiledDossier {
  lang: Language;
  sections: DossierSection[];
  entries: DossierEntry[];
  rejected: DossierRejection[];
  /** False whenever anything requested was rejected — the surface must say so. */
  complete: boolean;
}

const LANGUAGE_KEYS: readonly Language[] = ["en", "vi", "zh"];

const REQUEST_KEYS: Record<DossierSection, keyof DossierRequest> = {
  claims: "claimIds",
  evidence: "evidenceIds",
  boundaries: "boundaryIds",
};

/** Structural shape shared by LocalizedText and LocalizedStatement. */
interface LocalizedLike {
  en: string;
  vi: string;
  zh: string;
}

function pick(localized: LocalizedLike, lang: Language): string {
  return localized[lang] ?? localized.en;
}

/** A public route is one this repository actually serves; anything else is null. */
function publicRoute(surface: string | undefined): string | null {
  if (typeof surface !== "string") return null;
  if (!surface.startsWith("/")) return null;
  if (surface.includes("//")) return null;
  return surface;
}

function resolveSection(
  section: DossierSection,
  id: string,
  lang: Language,
): DossierEntry | null {
  if (section === "claims") {
    const claim = CLAIMS.find((entry) => entry.id === id);
    if (!claim) return null;
    const integrity = claim.reviewId
      ? INTEGRITY_ENTRY_INDEX.get(claim.reviewId)
      : undefined;
    return {
      id: claim.id,
      section,
      label: pick(claim.statement, lang),
      detail: null,
      href: publicRoute(claim.surface),
      freshness: integrity?.review?.reviewedOn ?? null,
      evidenceIds: [...claim.evidenceIds],
    };
  }
  if (section === "evidence") {
    const reference = EVIDENCE_INDEX.get(id);
    if (!reference) return null;
    return {
      id: reference.id,
      section,
      label: pick(reference.label, lang),
      detail: null,
      href: pick(reference.href, lang) || null,
      freshness: null,
      evidenceIds: [],
    };
  }
  const boundary = BOUNDARY_INDEX.get(id);
  if (!boundary) return null;
  return {
    id: boundary.id,
    section,
    label: pick(boundary.claim, lang),
    detail: pick(boundary.doesNotImply, lang),
    href: null,
    freshness: null,
    evidenceIds: [],
  };
}

export function compilePublicDossier(request: DossierRequest): CompiledDossier {
  const lang: Language = LANGUAGE_KEYS.includes(request.lang)
    ? request.lang
    : "en";
  const requested = Array.isArray(request.sections)
    ? request.sections
    : DOSSIER_SECTIONS;
  const sections = DOSSIER_SECTIONS.filter((section) =>
    requested.includes(section),
  );

  const entries: DossierEntry[] = [];
  const rejected: DossierRejection[] = [];

  for (const section of sections) {
    const ids = request[REQUEST_KEYS[section]] ?? [];
    const seen = new Set<string>();
    for (const id of ids) {
      if (typeof id !== "string" || id.length === 0) continue;
      if (seen.has(id)) {
        rejected.push({ id, section, reason: "duplicate" });
        continue;
      }
      seen.add(id);
      const entry = resolveSection(section, id, lang);
      if (!entry) {
        // Fail closed: an unresolvable id is reported, never rendered.
        rejected.push({ id, section, reason: "not-public" });
        continue;
      }
      entries.push(entry);
    }
  }

  return {
    lang,
    sections,
    entries,
    rejected,
    complete: rejected.length === 0,
  };
}
