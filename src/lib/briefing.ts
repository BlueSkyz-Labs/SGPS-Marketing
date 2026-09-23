import { CLAIMS } from "../data/claims.ts";
import { type Language, compilePublicDossier } from "./dossier.ts";
import {
  type ProvenanceSourceRef,
  getPublicProvenance,
} from "./provenance-lens.ts";

/**
 * C4-G Task 1 — deterministic public briefing compiler.
 *
 * A briefing is a *composition* of published truth, never a new statement of
 * it. Every factual line is taken verbatim from the same canonical adapters the
 * dossier and the provenance lens already use, so this module cannot introduce
 * a product, claim, evidence, architecture or release fact of its own.
 *
 * There is no model here, no network, no storage, no clock and no randomness:
 * the same input produces the same briefing, and the template baseline keeps
 * working if a model runtime is absent, down or disabled.
 */

export const BRIEFING_PURPOSES = [
  "executive",
  "technical",
  "trust",
  "release",
] as const;

export type BriefingPurpose = (typeof BRIEFING_PURPOSES)[number];

/**
 * What each purpose does: it decides which parts of the briefing scaffold are
 * emphasized. It never decides what a section says — the wording stays the
 * product's, and non-factual framing is declared as such.
 */
export const BRIEFING_SCAFFOLD: Record<BriefingPurpose, readonly string[]> = {
  executive: ["statement", "source", "boundary", "freshness"],
  technical: ["statement", "source", "freshness", "boundary"],
  trust: ["boundary", "source", "statement", "freshness"],
  release: ["freshness", "statement", "source", "boundary"],
};

export interface BriefingInput {
  /** Validated against the allowlist; anything else fails closed. */
  purpose: string;
  /** Public claim ids the visitor asked for. */
  claimIds?: readonly string[];
}

export interface BriefingSection {
  /** The canonical public subject id — the section's identity, not a title. */
  subject: string;
  /** Verbatim from the canonical source. */
  statement: string;
  /** The adapter's own source identities, in its own order. */
  sourceRefs: ProvenanceSourceRef[];
  /** Carried with the statement it qualifies; null when the source declares none. */
  boundary: { claim: string; doesNotImply: string } | null;
  /** Authored review date only — never generated at runtime. */
  freshness: string | null;
}

export type BriefingMissingReason = "unusable" | "not-public";

export interface BriefingMissing {
  id: string;
  reason: BriefingMissingReason;
}

export interface Briefing {
  /** Null when the requested purpose is not allowlisted — the briefing fails closed. */
  purpose: BriefingPurpose | null;
  /** The declared emphasis order for this purpose; framing only, never a fact. */
  scaffold: readonly string[];
  sections: BriefingSection[];
  missing: BriefingMissing[];
  /** Repeats that were composed once, reported rather than silently dropped. */
  duplicates: string[];
  /** False whenever anything requested was rejected — the surface must say so. */
  complete: boolean;
}

/** A public id is a bounded slug; anything else is refused before it is looked up. */
const PUBLIC_ID = /^[a-z0-9][a-z0-9-]{0,63}$/i;

const MAX_REFS = 64;

/**
 * Canonical rank of a claim in the published catalog. The dossier compiler keeps
 * the order it was asked in, so the briefing imposes the catalog's own order:
 * the document must not depend on the order the visitor happened to select.
 */
const CLAIM_RANK = new Map(CLAIMS.map((claim, index) => [claim.id, index]));

function isUsableId(value: unknown): value is string {
  return typeof value === "string" && PUBLIC_ID.test(value);
}

function emptyBriefing(purpose: BriefingPurpose | null): Briefing {
  return {
    purpose,
    scaffold: purpose ? BRIEFING_SCAFFOLD[purpose] : [],
    sections: [],
    missing: [],
    duplicates: [],
    complete: true,
  };
}

/**
 * Compile a briefing from allowlisted public ids.
 *
 * Ids that are malformed, unpublished or repeated are reported and left out.
 * Nothing is substituted for them and nothing is inferred about them.
 */
export function compilePublicBriefing(
  input: BriefingInput,
  lang: Language,
): Briefing {
  const purpose = BRIEFING_PURPOSES.includes(input?.purpose as BriefingPurpose)
    ? (input.purpose as BriefingPurpose)
    : null;
  if (purpose === null) return emptyBriefing(null);

  const requested = Array.isArray(input.claimIds)
    ? input.claimIds.slice(0, MAX_REFS)
    : [];
  if (requested.length === 0) return emptyBriefing(purpose);

  const missing: BriefingMissing[] = [];
  const duplicates: string[] = [];
  const candidates: string[] = [];
  const seen = new Set<string>();

  for (const raw of requested) {
    if (!isUsableId(raw)) {
      missing.push({
        id: typeof raw === "string" ? raw : String(raw),
        reason: "unusable",
      });
      continue;
    }
    if (seen.has(raw)) {
      duplicates.push(raw);
      continue;
    }
    seen.add(raw);
    candidates.push(raw);
  }

  // The dossier compiler is the shared authority for what is publicly composable.
  const dossier = compilePublicDossier({ lang, claimIds: candidates });
  for (const rejection of dossier.rejected) {
    missing.push({ id: rejection.id, reason: "not-public" });
  }

  const ordered = [...dossier.entries].sort(
    (a, b) =>
      (CLAIM_RANK.get(a.id) ?? Number.MAX_SAFE_INTEGER) -
      (CLAIM_RANK.get(b.id) ?? Number.MAX_SAFE_INTEGER),
  );

  const sections: BriefingSection[] = [];
  for (const entry of ordered) {
    const provenance = getPublicProvenance(entry.id, lang);
    // Fail closed: a subject with no published provenance is reported, not shown.
    if (provenance === null || provenance.unknown) {
      missing.push({ id: entry.id, reason: "not-public" });
      continue;
    }
    sections.push({
      subject: entry.id,
      statement: provenance.statement,
      sourceRefs: provenance.sourceRefs.map((ref) => ({ ...ref })),
      boundary:
        provenance.boundary === null ? null : { ...provenance.boundary },
      freshness: provenance.freshness,
    });
  }

  // Non-vacuity guard for the catalog this module reads: it must not be empty.
  if (CLAIMS.length === 0) return emptyBriefing(purpose);

  return {
    purpose,
    scaffold: BRIEFING_SCAFFOLD[purpose],
    sections,
    missing,
    duplicates,
    complete: missing.length === 0,
  };
}
