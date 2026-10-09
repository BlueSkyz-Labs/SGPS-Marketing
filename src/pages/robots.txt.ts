import type { APIRoute } from "astro";
import { SITE } from "@/data/site";
import { absoluteUrl } from "@/lib/seo";
import { isNonProductionSiteUrl } from "@/lib/truth";

export const prerender = true;

// AI crawlers are explicitly welcomed on production for GEO/AI discoverability
// (2026-10-07 geo-ai-visibility bundle). Named stanzas sit alongside the
// wildcard so AI systems and auditors can read the intent without ambiguity.
// Non-production keeps the fail-closed Disallow variant byte-identical.
const AI_CRAWLERS = [
  "GPTBot",
  "ChatGPT-User",
  "ClaudeBot",
  "anthropic-ai",
  "PerplexityBot",
  "Google-Extended",
  "Applebot-Extended",
  "Bytespider",
  "Diffbot",
  "cohere-ai",
];

export const GET: APIRoute = () => {
  const disallowIndexing = isNonProductionSiteUrl(SITE.url);
  const sitemap = absoluteUrl(SITE.url, "/sitemap.xml");
  const body = disallowIndexing
    ? ["User-agent: *", "Disallow: /", ""].join("\n")
    : [
        "User-agent: *",
        "Allow: /",
        "",
        ...AI_CRAWLERS.flatMap((bot) => [`User-agent: ${bot}`, "Allow: /", ""]),
        `Sitemap: ${sitemap}`,
        "",
      ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
};
