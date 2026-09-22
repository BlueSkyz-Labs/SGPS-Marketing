import { CLAIMS, EVIDENCE_INDEX } from "../data/claims.ts";
import type { Language } from "../data/site.ts";

/**
 * C4-B G6 — Collected edition schema.
 *
 * An edition is a curated selection of ALREADY-PUBLIC canonical items. This
 * module owns no product, claim, evidence or route truth: every source
 * reference is looked up in the canonical indexes and anything that does not
 * resolve publicly is dropped, so an edition can never publish a private or
 * unpublished item and never invents a destination.
 */

export type EditionSourceKind = "claim" | "evidence";

export interface EditionSourceRef {
  kind: EditionSourceKind;
  id: string;
}

export interface EditionRecord {
  id: string;
  title: Record<Language, string>;
  deck: Record<Language, string>;
  sources: readonly EditionSourceRef[];
  note?: Record<Language, string>;
  /** Authored publication date (ISO yyyy-mm-dd). */
  published: string;
}

export interface ResolvedEditionSource extends EditionSourceRef {
  label: string;
  href: string;
}

export interface ResolvedEdition {
  id: string;
  title: string;
  deck: string;
  note?: string;
  published: string;
  sources: ResolvedEditionSource[];
  /** References dropped because they do not resolve publicly (fail closed). */
  unresolved: EditionSourceRef[];
}

/** Shape shared by the canonical LocalizedText / LocalizedStatement records. */
interface LocalizedLike {
  en: string;
  vi: string;
  zh?: string;
}

function pick(text: LocalizedLike, lang: string): string {
  const values = text as unknown as Record<string, string | undefined>;
  return values[lang] ?? text.en ?? "";
}

/** Resolve one edition for one language; unresolvable sources are excluded. */
export function resolveEdition(
  edition: EditionRecord,
  lang: Language,
): ResolvedEdition {
  const sources: ResolvedEditionSource[] = [];
  const unresolved: EditionSourceRef[] = [];

  for (const ref of edition.sources) {
    if (ref.kind === "evidence") {
      const evidence = EVIDENCE_INDEX.get(ref.id);
      if (!evidence) {
        unresolved.push(ref);
        continue;
      }
      sources.push({
        ...ref,
        label: pick(evidence.label, lang),
        href: pick(evidence.href, lang),
      });
      continue;
    }

    const claim = CLAIMS.find((entry) => entry.id === ref.id);
    // A claim is only public here when one of its evidence ids resolves.
    const evidence = claim?.evidenceIds
      .map((id) => EVIDENCE_INDEX.get(id))
      .find((entry) => entry !== undefined);
    if (!claim || !evidence) {
      unresolved.push(ref);
      continue;
    }
    sources.push({
      ...ref,
      label: pick(claim.statement, lang),
      href: pick(evidence.href, lang),
    });
  }

  return {
    id: edition.id,
    title: pick(edition.title, lang),
    deck: pick(edition.deck, lang),
    ...(edition.note ? { note: pick(edition.note, lang) } : {}),
    published: edition.published,
    sources,
    unresolved,
  };
}

/** Counters for evidence and routing docs. */
export function describeEdition(edition: EditionRecord, lang: Language) {
  const resolved = resolveEdition(edition, lang);
  return {
    id: edition.id,
    resolvedSources: resolved.sources.length,
    unresolvedSources: resolved.unresolved.length,
    sourceKinds: [
      ...new Set(resolved.sources.map((source) => source.kind)),
    ].sort(),
  };
}
