import type { APIRoute } from "astro";
import { SITE } from "@/data/site";
import { getPublicProducts } from "@/lib/products";
import { getGuideProducts, getShowcase } from "@/lib/showcases";
import { absoluteUrl, isNoindexPath, PUBLIC_STATIC_PATHS } from "@/lib/seo";
import { getEvidencePassportIds } from "@/lib/claims";
import { EDITIONS } from "@/data/editions";
import { SUPPORTED_LANGUAGES } from "@/lib/i18n";
import { getCollection } from "astro:content";
import {
  JOURNAL_LANGUAGES,
  journalIsIndexable,
  type JournalEntry,
} from "@/lib/journal-schema";
import {
  journalIndexPath,
  journalPostPath,
  publishedJournalPosts,
} from "@/lib/journal-posts";
import { isNonProductionSiteUrl } from "@/lib/truth";
import { lastmodForPath } from "@/lib/git-lastmod";

export const prerender = true;

/** `lastmod` comes from git per route and is omitted when not accurate
 * (shallow clone, no history); it is never the build time. */
function xmlEscape(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Absolute image URLs attached to a page URL (product pages only). */
type Locs = { loc: string; images?: readonly string[] };

function urlEntry({ loc, images = [] }: Locs): string {
  const path = new URL(loc).pathname;
  const lastmod = lastmodForPath(path);
  return [
    "  <url>",
    `    <loc>${xmlEscape(loc)}</loc>`,
    ...(lastmod ? [`    <lastmod>${lastmod}</lastmod>`] : []),
    ...images.map(
      (image) =>
        `    <image:image><image:loc>${xmlEscape(image)}</image:loc></image:image>`,
    ),
    "  </url>",
  ].join("\n");
}

export const GET: APIRoute = async () => {
  const products = (await getPublicProducts()).map((product) => ({
    slug: product.data.slug,
    name: product.data.name,
    mediaSrc: product.data.proof.media?.src,
  }));
  // Identity art plus showcase screens, from the records only (loc only: the
  // caption/title/license image-sitemap tags are deprecated by Google).
  const productImages = new Map<string, string[]>();
  for (const product of products) {
    const showcase = (await getShowcase(product.slug))?.data ?? null;
    const srcs = [
      ...(product.mediaSrc ? [product.mediaSrc] : []),
      ...(showcase?.screens.map((screen: { src: string }) => screen.src) ?? []),
    ];
    productImages.set(
      product.slug,
      [...new Set(srcs)].map((src) => absoluteUrl(SITE.url, src)),
    );
  }
  const guideSlugs = (await getGuideProducts()).map(
    ({ product }) => product.data.slug,
  );
  const evidenceIds = getEvidencePassportIds(products);
  // Journey P1-A: journal URLs come only from published entries (a draft has
  // no route). The index joins once it is indexable, like its noindex tag.
  const journal = await getCollection("journal");
  const journalLocs = journalIsIndexable(
    journal.map((entry: { data: JournalEntry }) => entry.data),
  )
    ? JOURNAL_LANGUAGES.flatMap((lang) => [
        absoluteUrl(SITE.url, journalIndexPath(lang)),
        ...publishedJournalPosts(journal, lang).map((entry) =>
          absoluteUrl(SITE.url, journalPostPath(lang, entry.data.id)),
        ),
      ])
    : [];
  const plain = (loc: string): Locs => ({ loc });
  const locs: Locs[] = isNonProductionSiteUrl(SITE.url)
    ? []
    : [
        // Language gateway (Owner decision F16, 2026-10-01): indexable.
        plain(absoluteUrl(SITE.url, "/")),
        ...PUBLIC_STATIC_PATHS.filter((path) => !isNoindexPath(path)).map(
          (path) => plain(absoluteUrl(SITE.url, path)),
        ),
        ...SUPPORTED_LANGUAGES.flatMap((lang) =>
          products.map((product) => ({
            loc: absoluteUrl(SITE.url, `/${lang}/products/${product.slug}/`),
            images: productImages.get(product.slug) ?? [],
          })),
        ),
        ...SUPPORTED_LANGUAGES.flatMap((lang) =>
          guideSlugs.map((slug) =>
            plain(absoluteUrl(SITE.url, `/${lang}/products/${slug}/guide/`)),
          ),
        ),
        ...SUPPORTED_LANGUAGES.flatMap((lang) =>
          evidenceIds.map((id) =>
            plain(absoluteUrl(SITE.url, `/${lang}/evidence/${id}/`)),
          ),
        ),
        ...SUPPORTED_LANGUAGES.flatMap((lang) =>
          EDITIONS.map((edition) =>
            plain(absoluteUrl(SITE.url, `/${lang}/editions/${edition.id}/`)),
          ),
        ),
        ...journalLocs.map(plain),
      ];

  const body = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ...locs.map(urlEntry),
    "</urlset>",
    "",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
    },
  });
};
