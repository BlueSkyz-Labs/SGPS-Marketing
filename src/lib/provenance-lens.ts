import {
  BOUNDARY_INDEX,
  CLAIMS,
  EVIDENCE_INDEX,
  INTEGRITY_ENTRY_INDEX,
} from "../data/claims.ts";

/**
 * C4-D G5 — public provenance lens.
 *
 * Resolves a published subject to the sources that actually stand behind it.
 * The lens never creates a source, never upgrades a reference into proof, and
 * never manufactures freshness. Anything it cannot resolve from canonical
 * public truth is returned as `unknown` rather than rendered as a convincing
 * chain — a subject that cites only itself is refused, because a page pointing
 * at itself is not evidence.
 */

export type Language = "en" | "vi" | "zh";

export interface ProvenanceSourceRef {
  id: string;
  label: string;
  href: string;
}

export interface PublicProvenance {
  subject: string;
  /** Localized statement taken verbatim from the canonical source. */
  statement: string;
  /** Canonical public evidence only; never a self-reference. */
  sourceRefs: ProvenanceSourceRef[];
  boundary: { claim: string; doesNotImply: string } | null;
  /** Authored review date only — never generated at runtime. */
  freshness: string | null;
  /** True when the subject does not resolve to published truth. */
  unknown: boolean;
}

/** Structural shape shared by LocalizedText and LocalizedStatement. */
interface LocalizedLike {
  en: string;
  vi: string;
  zh: string;
}

/** Assurance vocabulary no provenance chain may ever imply. */
const FORBIDDEN_ASSURANCE = [
  "certified",
  "audited",
  "accredited",
  "attested",
  "guaranteed",
  "compliant",
  "verified-by-us",
  "iso 27001",
  "soc 2",
];

const LANGUAGE_KEYS: readonly Language[] = ["en", "vi", "zh"];

function pick(localized: LocalizedLike, lang: Language): string {
  return localized[lang] ?? localized.en;
}

/**
 * Public source destinations are validated as URLs, not by string prefix alone.
 * Browsers normalize backslashes and encoded traversal; fail closed on ambiguous
 * authored input rather than letting a malformed source become a public link.
 * This is a destination guard, not a second evidence or route authority.
 */
export function isPublicDestination(value: unknown): value is string {
  if (typeof value !== "string" || value.length === 0) return false;
  if (/[\\\\\u0000-\u0020\u007f]/.test(value)) return false;

  if (value.startsWith("/") && !value.startsWith("//")) {
    if (value.includes("..") || /%(?:2e|2f|5c|25)/i.test(value)) return false;
    try {
      const parsed = new URL(value, "https://public.invalid");
      return parsed.origin === "https://public.invalid";
    } catch {
      return false;
    }
  }

  try {
    const parsed = new URL(value);
    return (
      parsed.protocol === "https:" &&
      value.startsWith("https://") &&
      parsed.hostname.length > 0 &&
      parsed.username.length === 0 &&
      parsed.password.length === 0
    );
  } catch {
    return false;
  }
}

function carriesAssurance(value: string): boolean {
  const lowered = value.toLowerCase();
  return FORBIDDEN_ASSURANCE.some((term) => lowered.includes(term));
}

function localizedText(
  value: LocalizedLike | undefined,
  lang: Language,
): string | null {
  if (!value) return null;
  const text = pick(value, lang);
  if (text.length === 0) return null;
  if (carriesAssurance(text)) return null;
  return text;
}

function resolveEvidence(
  evidenceIds: readonly string[],
  lang: Language,
): ProvenanceSourceRef[] {
  const refs: ProvenanceSourceRef[] = [];
  for (const id of evidenceIds) {
    const reference = EVIDENCE_INDEX.get(id);
    if (!reference) continue;
    const href = pick(reference.href, lang);
    if (!isPublicDestination(href)) continue;
    const label = localizedText(reference.label, lang);
    if (!label) continue;
    refs.push({ id: reference.id, label, href });
  }
  return refs;
}

/**
 * A chain is only credible when at least one source is not the subject itself.
 * Exported so the refusal rule is directly testable with synthetic inputs.
 */
export function isSelfOnlyChain(
  refs: readonly ProvenanceSourceRef[],
  surface: string | undefined,
): boolean {
  if (refs.length === 0) return false;
  if (typeof surface !== "string" || surface.length === 0) return false;
  return refs.every((ref) => ref.href === surface);
}

export function getPublicProvenance(
  subjectId: string,
  lang: Language,
): PublicProvenance | null {
  if (typeof subjectId !== "string" || subjectId.length === 0) return null;
  const language: Language = LANGUAGE_KEYS.includes(lang) ? lang : "en";

  const claim = CLAIMS.find((entry) => entry.id === subjectId);
  if (claim) {
    const statement = localizedText(claim.statement, language);
    if (!statement) return null;
    const refs = resolveEvidence(claim.evidenceIds, language);
    // Fail closed: a subject that only cites its own surface proves nothing.
    if (isSelfOnlyChain(refs, claim.surface)) {
      return {
        subject: claim.id,
        statement,
        sourceRefs: [],
        boundary: null,
        freshness: null,
        unknown: true,
      };
    }
    const boundaryEntry = claim.boundaryId
      ? BOUNDARY_INDEX.get(claim.boundaryId)
      : undefined;
    const boundary = boundaryEntry
      ? {
          claim: localizedText(boundaryEntry.claim, language) ?? "",
          doesNotImply:
            localizedText(boundaryEntry.doesNotImply, language) ?? "",
        }
      : null;
    const integrity = claim.reviewId
      ? INTEGRITY_ENTRY_INDEX.get(claim.reviewId)
      : undefined;
    const freshness = integrity?.review?.reviewedOn ?? null;
    return {
      subject: claim.id,
      statement,
      sourceRefs: refs,
      boundary: boundary && boundary.claim.length > 0 ? boundary : null,
      freshness:
        freshness && /^\d{4}-\d{2}-\d{2}$/.test(freshness) ? freshness : null,
      unknown: refs.length === 0,
    };
  }

  const evidence = EVIDENCE_INDEX.get(subjectId);
  if (evidence) {
    const label = localizedText(evidence.label, language);
    const href = pick(evidence.href, language);
    if (!label || !isPublicDestination(href)) return null;
    return {
      subject: evidence.id,
      statement: label,
      sourceRefs: [{ id: evidence.id, label, href }],
      boundary: null,
      freshness: null,
      unknown: false,
    };
  }

  const boundaryEntry = BOUNDARY_INDEX.get(subjectId);
  if (boundaryEntry) {
    const statement = localizedText(boundaryEntry.claim, language);
    const doesNotImply = localizedText(boundaryEntry.doesNotImply, language);
    if (!statement) return null;
    return {
      subject: boundaryEntry.id,
      statement,
      sourceRefs: [],
      boundary: doesNotImply ? { claim: statement, doesNotImply } : null,
      freshness: null,
      unknown: true,
    };
  }

  return null;
}
