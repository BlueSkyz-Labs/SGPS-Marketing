import { EVIDENCE_INDEX } from "../data/claims.ts";
import type { Language } from "../data/site.ts";

/**
 * C4-B G9 — Craft provenance story contract.
 *
 * A craft story explains why a thing was built the way it was. It may only
 * narrate authored fields plus references that resolve in the canonical public
 * evidence index: it never copies evidence text, never invents customer
 * outcomes, never hides limitations and never implies assurance the repository
 * does not actually hold. Anything that fails validation is not renderable.
 */

export interface LocalizedText {
  en: string;
  vi: string;
  zh?: string;
}

export type CraftStorySection =
  "problem" | "designChoice" | "constraint" | "implementation" | "limitations";

export interface CraftStoryDraft {
  id: string;
  sections: Partial<Record<CraftStorySection, LocalizedText>>;
  /** Canonical public evidence ids backing the narrative. */
  evidenceRefs: readonly string[];
}

export interface CraftStoryView {
  id: string;
  sections: Array<{ section: CraftStorySection; text: string }>;
  evidence: Array<{ id: string; label: string; href: string }>;
}

export type CraftStoryViolation =
  | "unknown-evidence"
  | "cites-only-itself"
  | "hides-limitations"
  | "invented-outcome"
  | "unsupported-assurance";

export interface CraftStoryValidation {
  ok: boolean;
  violations: CraftStoryViolation[];
}

/**
 * Language that fabricates outcome, social proof or assurance. Kept small and
 * explicit: a story that needs these words is not source-backed yet.
 */
const FORBIDDEN: ReadonlyArray<{
  pattern: RegExp;
  violation: CraftStoryViolation;
}> = [
  {
    pattern:
      /\b\d+(\.\d+)?\s?%\s?(increase|improvement|reduction|faster|growth)/i,
    violation: "invented-outcome",
  },
  {
    pattern: /\bcustomers?\s+(saw|reported|achieved|said)\b/i,
    violation: "invented-outcome",
  },
  {
    pattern:
      /\b(guaranteed?|proven\s+results?|world[- ]class|best[- ]in[- ]class)\b/i,
    violation: "invented-outcome",
  },
  {
    pattern: /\b(iso\s?\d{4,5}|soc\s?2|hipaa|gdpr[- ]certified|pci[- ]dss)\b/i,
    violation: "unsupported-assurance",
  },
  {
    pattern: /\b(certified|accredited|audited|attested)\b/i,
    violation: "unsupported-assurance",
  },
];

function pick(text: LocalizedText, lang: Language): string {
  const values = text as unknown as Record<string, string | undefined>;
  return values[lang] ?? text.en ?? "";
}

/** Validate a draft without rendering it. Never mutates the draft. */
export function validateCraftStory(
  draft: CraftStoryDraft,
): CraftStoryValidation {
  const violations = new Set<CraftStoryViolation>();

  const resolvable = draft.evidenceRefs.filter((id) => EVIDENCE_INDEX.has(id));
  if (resolvable.length === 0) {
    violations.add(
      draft.evidenceRefs.length > 0 ? "unknown-evidence" : "cites-only-itself",
    );
  }
  if (draft.evidenceRefs.length > resolvable.length) {
    violations.add("unknown-evidence");
  }
  if (!draft.sections.limitations) {
    violations.add("hides-limitations");
  }

  for (const [section, text] of Object.entries(draft.sections)) {
    if (!text || section === "limitations") continue;
    const prose = `${text.en}\n${text.vi}`;
    for (const rule of FORBIDDEN) {
      if (rule.pattern.test(prose)) violations.add(rule.violation);
    }
  }

  return { ok: violations.size === 0, violations: [...violations].sort() };
}

/**
 * Build the render model. Returns null when the draft is not valid, so an
 * invalid story is omitted rather than published.
 */
export function renderCraftStory(
  draft: CraftStoryDraft,
  lang: Language,
): CraftStoryView | null {
  if (!validateCraftStory(draft).ok) return null;

  const sections: CraftStoryView["sections"] = [];
  for (const section of [
    "problem",
    "designChoice",
    "constraint",
    "implementation",
    "limitations",
  ] as const) {
    const text = draft.sections[section];
    if (text) sections.push({ section, text: pick(text, lang) });
  }

  return {
    id: draft.id,
    sections,
    evidence: draft.evidenceRefs.map((id) => {
      const entry = EVIDENCE_INDEX.get(id);
      return {
        id,
        label: entry ? pick(entry.label, lang) : "",
        href: entry ? pick(entry.href, lang) : "",
      };
    }),
  };
}
