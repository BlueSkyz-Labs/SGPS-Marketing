import { z } from "astro/zod";
import { isHttpsUrl } from "./https-url.ts";

/**
 * v11 Journal (plan `docs/superpowers/plans/2026-10-03-v11-journal-news-and-product-updates.md`).
 * Frontmatter contract for `src/content/journal/<id>.<lang>.md`.
 *
 * - Every post is a VI + EN pair (v11 §7.5); zh / zh-Hant are not produced.
 * - `datePublished` is the merge date; `dateModified` only moves on a
 *   substantive, visibly noted edit (v11 §7.6).
 * - Every factual post cites sources and the Owner approval PR (§7.1, §7.3).
 * - A `product` post must reference an approved public release record (§7.2).
 */
export const JOURNAL_LANGUAGES = ["vi", "en"] as const;
export type JournalLanguage = (typeof JOURNAL_LANGUAGES)[number];
export const JOURNAL_BRANCHES = ["news", "product"] as const;
export type JournalBranch = (typeof JOURNAL_BRANCHES)[number];

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const IDENTIFIER = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const EVIDENCE_ID = /^ev-[a-z0-9-]+$/;
const APPROVAL_PR =
  /^https:\/\/github\.com\/BlueSkyz-Labs\/SGPS-Marketing\/pull\/\d+$/;

const source = z.union([
  z.string().refine(isHttpsUrl, "source must be an https URL"),
  z.string().regex(EVIDENCE_ID, "source must be an https URL or evidence id"),
]);

export const journalEntrySchema = z
  .object({
    id: z.string().regex(IDENTIFIER),
    lang: z.enum(JOURNAL_LANGUAGES),
    branch: z.enum(JOURNAL_BRANCHES),
    title: z.string().min(1).max(110),
    description: z.string().min(50).max(160),
    datePublished: z.string().regex(ISO_DATE),
    dateModified: z.string().regex(ISO_DATE).optional(),
    updateNote: z.string().min(1).optional(),
    sources: z.array(source).min(1),
    ownerApproval: z.string().regex(APPROVAL_PR),
    releaseRecord: z.string().regex(IDENTIFIER).optional(),
    draft: z.boolean().default(false),
  })
  .strict()
  .superRefine((entry, ctx) => {
    if (entry.dateModified !== undefined) {
      if (entry.dateModified < entry.datePublished) {
        ctx.addIssue({
          code: "custom",
          message: "dateModified cannot precede datePublished",
        });
      }
      if (entry.dateModified !== entry.datePublished && !entry.updateNote) {
        ctx.addIssue({
          code: "custom",
          message: "a modified post needs a visible updateNote",
        });
      }
    }
    if (entry.branch === "product" && !entry.releaseRecord) {
      ctx.addIssue({
        code: "custom",
        message: "a product post must reference a public release record",
      });
    }
    if (entry.branch === "news" && entry.releaseRecord) {
      ctx.addIssue({
        code: "custom",
        message: "only product posts reference a release record",
      });
    }
  });

export type JournalEntry = z.infer<typeof journalEntrySchema>;

/**
 * Pairing guard (v11 §7.5): every published id exists in both languages with
 * the same branch, dates and release record.
 */
export function journalPairProblems(
  entries: readonly JournalEntry[],
): string[] {
  const published = entries.filter((entry) => !entry.draft);
  const byId = new Map<string, JournalEntry[]>();
  for (const entry of published) {
    byId.set(entry.id, [...(byId.get(entry.id) ?? []), entry]);
  }
  const problems: string[] = [];
  for (const [id, group] of byId) {
    const langs = group.map((entry) => entry.lang).sort();
    if (langs.join(",") !== [...JOURNAL_LANGUAGES].sort().join(",")) {
      problems.push(`${id}: needs exactly one vi and one en version`);
      continue;
    }
    const [a, b] = group;
    for (const key of [
      "branch",
      "datePublished",
      "dateModified",
      "releaseRecord",
      "ownerApproval",
    ] as const) {
      if (a![key] !== b![key])
        problems.push(`${id}: ${key} differs between vi and en`);
    }
  }
  return problems;
}

/** The index is indexable only once it lists at least one published post. */
export function journalIsIndexable(entries: readonly JournalEntry[]): boolean {
  return entries.some((entry) => !entry.draft);
}
