import { BOUNDARY_INDEX, CLAIMS } from "../data/claims.ts";
import { getPublicProvenance } from "./provenance-lens.ts";

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
    // One provenance authority: the dossier projects the adapter's result instead
    // of assembling its own source list, so a refused chain refuses here too.
    const provenance = getPublicProvenance(claim.id, lang);
    // A registered claim is not publishable if its canonical source chain is
    // withdrawn or self-only. Refuse the entire claim, not only its sources.
    if (!provenance || provenance.unknown) return null;
    // The surface's published destination comes from the same provenance the
    // claim's sources do: asking the logical id for a path could only ever
    // answer null, which is how every source link disappeared. When the chain
    // exposes no genuine route, the link stays null rather than guessed.
    const route = provenance.sourceRefs.find(
      (source) => source.id === `ev-${claim.surface}-route`,
    );
    return {
      id: claim.id,
      section,
      label: pick(claim.statement, lang),
      detail: null,
      href: publicRoute(route?.href),
      freshness: provenance?.freshness ?? null,
      evidenceIds:
        provenance && !provenance.unknown
          ? provenance.sourceRefs.map((reference) => reference.id)
          : [],
    };
  }
  if (section === "evidence") {
    const provenance = getPublicProvenance(id, lang);
    const reference = provenance?.sourceRefs.find((source) => source.id === id);
    if (!provenance || provenance.unknown || !reference) return null;
    return {
      id: reference.id,
      section,
      label: reference.label,
      detail: null,
      href: reference.href,
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
