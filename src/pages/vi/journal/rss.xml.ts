import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { SITE } from "@/data/site";
import { JOURNAL_COPY } from "@/data/journal-copy";
import { buildJournalRss } from "@/lib/journal-posts";

export const prerender = true;

// Journey P1-A: RSS 2.0, published posts of this language only. An empty feed
// is valid RSS and is what ships until the first post is published.
export const GET: APIRoute = async () => {
  const copy = JOURNAL_COPY["vi"];
  const body = buildJournalRss({
    siteUrl: SITE.url,
    lang: "vi",
    title: `${copy.title} | ${SITE.name}`,
    description: copy.lede,
    entries: await getCollection("journal"),
  });
  return new Response(body, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
};
