/**
 * Truth-safe integrity contract (S+ v2 Task 0.4).
 *
 * Fail-closed by design: no speculative public entries exist until real,
 * reviewable evidence is published. This module intentionally contains no
 * scoring, no blanket verification, and no runtime-generated dates.
 */

export type TruthState =
  "source-linked" | "reviewed" | "changed" | "not-published" | "unavailable";

export interface LocalizedText {
  en: string;
  vi: string;
}

export interface EvidenceReference {
  kind: "route" | "artifact" | "private-reporting";
  href: { en: string; vi: string };
  label: LocalizedText;
}

export interface ReviewMetadata {
  /** Authored ISO date (YYYY-MM-DD). Never generated at runtime. */
  reviewedOn: string;
  source: "content-review" | "evidence-update";
}

export interface BoundaryStatement {
  claim: LocalizedText;
  doesNotImply: LocalizedText;
}

export interface IntegrityEntry {
  id: string;
  surface: string;
  state: TruthState;
  summary: LocalizedText;
  evidence: EvidenceReference[];
  review?: ReviewMetadata;
  boundary?: BoundaryStatement;
}

/** Fail-closed: empty until real, reviewable public evidence exists. */
export const INTEGRITY_ENTRIES =
  [] as const satisfies readonly IntegrityEntry[];
