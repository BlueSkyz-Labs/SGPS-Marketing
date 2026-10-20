import { JOURNAL_COPY } from "../data/journal-copy.ts";
import type { Language } from "../data/site.ts";

/**
 * Journal navigation gate (Owner 2026-10-20, TRU-15).
 *
 * The Journal is not offered in the header, the mobile menu or the command
 * navigator until its collection holds at least one published entry; it then
 * appears with no further edit. The Journal route itself is untouched. The
 * label is the section's own existing title (`JOURNAL_COPY`), so no copy is
 * authored here. Fail closed: no entries, or only drafts, yields no item.
 */
export interface JournalNavItem {
  label: string;
  href: string;
}

interface PublishedProbe {
  data: { draft?: boolean };
}

export function hasPublishedJournalEntry(
  entries: readonly PublishedProbe[],
): boolean {
  return entries.some((entry) => entry.data.draft !== true);
}

/** Zero or one nav item for this language, from the journal collection. */
export function journalNavItems(
  lang: Language,
  entries: readonly PublishedProbe[],
): JournalNavItem[] {
  if (!hasPublishedJournalEntry(entries)) return [];
  return [{ label: JOURNAL_COPY[lang].title, href: `/${lang}/journal/` }];
}
