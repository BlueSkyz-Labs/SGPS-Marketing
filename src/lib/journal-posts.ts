import { AUTHORS } from "../data/authors.ts";
import {
  JOURNAL_LANGUAGES,
  journalPairProblems,
  type JournalEntry,
  type JournalLanguage,
} from "./journal-schema.ts";
import { HOME_LABELS } from "./breadcrumbs.ts";
import { isHttpsUrl } from "./https-url.ts";
import { CANONICAL_PUBLIC_SITE_ORIGIN } from "./truth.ts";
import { absoluteUrl, canonicalForPath, publisherRef } from "./seo.ts";

/**
 * Journey P1-A: pure helpers for journal post pages, the RSS feeds and the
 * BlogPosting JSON-LD. No Astro imports so the architecture tests exercise
 * exactly what the routes run.
 */

/** A content-collection entry reduced to what these helpers read. */
export interface JournalCollectionEntry {
  data: JournalEntry;
}

export const journalPostPath = (lang: JournalLanguage, id: string): string =>
  `/${lang}/journal/${id}/`;

export const journalIndexPath = (lang: JournalLanguage): string =>
  `/${lang}/journal/`;

export const journalFeedPath = (lang: JournalLanguage): string =>
  `/${lang}/journal/rss.xml`;

/**
 * Published posts of one language, newest first. A draft never appears, and a
 * language without post pages (zh, zh-Hant) yields nothing: fail closed.
 */
export function publishedJournalPosts<T extends JournalCollectionEntry>(
  entries: readonly T[],
  lang: string,
): T[] {
  if (!(JOURNAL_LANGUAGES as readonly string[]).includes(lang)) return [];
  return entries
    .filter((entry) => !entry.data.draft && entry.data.lang === lang)
    .sort(
      (a, b) =>
        b.data.datePublished.localeCompare(a.data.datePublished) ||
        a.data.id.localeCompare(b.data.id),
    );
}

/**
 * Published posts of one language that cite this product's own profile page
 * (`<canonical origin>/<lang>/products/<slug>/`) among their sources. Derived from
 * the collection, so no URL is hardcoded; a language with no matching post
 * yields nothing: fail closed.
 */
export function journalPostsForProduct<T extends JournalCollectionEntry>(
  entries: readonly T[],
  lang: string,
  slug: string,
): T[] {
  const profile = canonicalForPath(
    `/${lang}/products/${slug}/`,
    CANONICAL_PUBLIC_SITE_ORIGIN,
  );
  return publishedJournalPosts(entries, lang).filter((entry) =>
    entry.data.sources.includes(profile),
  );
}

/**
 * `getStaticPaths` result for `/<lang>/journal/<slug>/`. Throws when the
 * published set breaks the VI + EN pairing contract, so an unpaired post
 * fails the build instead of shipping a dead hreflang alternate.
 */
export function journalPostStaticPaths<T extends JournalCollectionEntry>(
  entries: readonly T[],
  lang: string,
): { params: { slug: string }; props: { entry: T } }[] {
  const problems = journalPairProblems(entries.map((entry) => entry.data));
  if (problems.length > 0) {
    throw new Error(`journal pairing: ${problems.join("; ")}`);
  }
  return publishedJournalPosts(entries, lang).map((entry) => ({
    params: { slug: entry.data.id },
    props: { entry },
  }));
}

/** Frontmatter filename contract: `<id>.<lang>.md`. */
export function journalFileProblems(
  filename: string,
  entry: Pick<JournalEntry, "id" | "lang">,
): string[] {
  const expected = `${entry.id}.${entry.lang}.md`;
  return filename === expected
    ? []
    : [`${filename}: must be named ${expected} to match its id and lang`];
}

/** https sources become external links; `ev-*` ids stay text (no anchor route). */
export function partitionSources(sources: readonly string[]): {
  links: string[];
  evidenceIds: string[];
} {
  return {
    links: sources.filter(isHttpsUrl),
    evidenceIds: sources.filter((source) => !isHttpsUrl(source)),
  };
}

/** XML 1.0 text escaping; also drops characters XML 1.0 cannot carry. */
export function escapeXml(value: string): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const rfc822 = (isoDate: string): string =>
  new Date(`${isoDate}T00:00:00Z`).toUTCString();

const FEED_LANGUAGE: Record<JournalLanguage, string> = {
  vi: "vi",
  en: "en",
};

/**
 * RSS 2.0 for one language. Only the entries passed in are listed, so the
 * caller filters with `publishedJournalPosts`; an empty feed is valid RSS.
 * Deterministic: dates come from frontmatter, never the build clock.
 */
export function buildJournalRss(input: {
  siteUrl: string;
  lang: JournalLanguage;
  title: string;
  description: string;
  entries: readonly JournalCollectionEntry[];
}): string {
  const { siteUrl, lang, title, description } = input;
  const entries = publishedJournalPosts(input.entries, lang);
  const channelLink = canonicalForPath(journalIndexPath(lang), siteUrl);
  const selfLink = canonicalForPath(journalFeedPath(lang), siteUrl);
  const newest = entries
    .map((entry) => entry.data.dateModified ?? entry.data.datePublished)
    .sort()
    .at(-1);
  const items = entries.map(({ data }) => {
    const link = canonicalForPath(journalPostPath(lang, data.id), siteUrl);
    return [
      "    <item>",
      `      <title>${escapeXml(data.title)}</title>`,
      `      <link>${escapeXml(link)}</link>`,
      `      <guid isPermaLink="true">${escapeXml(link)}</guid>`,
      `      <pubDate>${rfc822(data.datePublished)}</pubDate>`,
      `      <dc:creator>${escapeXml(AUTHORS[data.author].name)}</dc:creator>`,
      `      <description>${escapeXml(data.description)}</description>`,
      "    </item>",
    ].join("\n");
  });
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">',
    "  <channel>",
    `    <title>${escapeXml(title)}</title>`,
    `    <link>${escapeXml(channelLink)}</link>`,
    `    <description>${escapeXml(description)}</description>`,
    `    <language>${FEED_LANGUAGE[lang]}</language>`,
    `    <atom:link href="${escapeXml(selfLink)}" rel="self" type="application/rss+xml" />`,
    ...(newest ? [`    <lastBuildDate>${rfc822(newest)}</lastBuildDate>`] : []),
    ...items,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");
}

/**
 * BlogPosting node. `publisher` is the site-wide Organization (same `@id`);
 * the author is a Person built from the registry. No `image`: the author
 * portrait is not the article image, and no post-specific card exists.
 */
export function blogPostingJsonLd(entry: JournalEntry, siteUrl: string) {
  const lang = entry.lang;
  const author = AUTHORS[entry.author];
  const url = canonicalForPath(journalPostPath(lang, entry.id), siteUrl);
  const citation = partitionSources(entry.sources).links;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: entry.title,
    description: entry.description,
    datePublished: entry.datePublished,
    dateModified: entry.dateModified ?? entry.datePublished,
    inLanguage: lang,
    url,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: {
      "@type": "Person",
      name: author.name,
      url: absoluteUrl(siteUrl, author.aboutPath[lang]),
      image: absoluteUrl(siteUrl, author.avatarLarge),
    },
    publisher: publisherRef(siteUrl),
    ...(citation.length > 0 ? { citation } : {}),
  };
}

/** Home > Journal > post, with the section's own label (no invented name). */
export function journalPostBreadcrumbJsonLd(input: {
  lang: JournalLanguage;
  id: string;
  title: string;
  journalLabel: string;
  siteUrl: string;
}) {
  const { lang, siteUrl } = input;
  const trail = [
    { name: HOME_LABELS[lang], path: canonicalForPath(`/${lang}/`, siteUrl) },
    {
      name: input.journalLabel,
      path: canonicalForPath(journalIndexPath(lang), siteUrl),
    },
    {
      name: input.title,
      path: canonicalForPath(journalPostPath(lang, input.id), siteUrl),
    },
  ];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: crumb.path,
    })),
  };
}
