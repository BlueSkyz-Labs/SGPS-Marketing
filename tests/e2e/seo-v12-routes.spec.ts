import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "@playwright/test";
import {
  builtPageProblems,
  isRealPage,
  pageFacts,
  registryFacts,
} from "../architecture/lib/seo-html.mjs";

/**
 * v12 S2 — the served-page half of tests/architecture/seo-v12-structured-data.
 * CI runs architecture contracts before the build, so this spec repeats the
 * built-HTML scan on the preview: it crawls every same-origin page linked from
 * the four locale homes and checks one h1, valid registry-bound JSON-LD (no
 * rating, review or price keys) and per-locale unique titles/descriptions.
 * The check reads raw HTML, so it is engine-independent and runs once, on the
 * chromium project; the negative proofs live with the shared predicates in the
 * architecture test.
 */
const PRODUCTS_DIR = "src/content/products";
const records = readdirSync(PRODUCTS_DIR)
  .filter((file) => file.endsWith(".yaml"))
  .map((file) => readFileSync(join(PRODUCTS_DIR, file), "utf8"))
  .filter((yaml) => /^public: true$/m.test(yaml))
  .map((yaml) => ({ facts: registryFacts(yaml) }));

const SEEDS = ["/en/", "/vi/", "/zh/", "/zh-hant/"];
const PAGE_LIMIT = 200;

test("every linked page has one h1, registry-bound JSON-LD and unique metadata", async ({
  request,
  baseURL,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "raw-HTML scan: engine-independent, runs on chromium only",
  );
  test.setTimeout(120_000);
  const origin = new URL(baseURL ?? "http://127.0.0.1:3000").origin;
  const queue = [...SEEDS];
  const seen = new Set<string>(queue);
  const pages: Array<ReturnType<typeof pageFacts> & { route: string }> = [];

  while (queue.length > 0 && seen.size <= PAGE_LIMIT) {
    const route = queue.shift()!;
    const response = await request.get(route);
    expect(response.status(), route).toBe(200);
    const html = await response.text();
    pages.push({ route, ...pageFacts(html) });
    for (const [, href] of html.matchAll(/<a\b[^>]*\shref="([^"#?]+)/g)) {
      const url = new URL(href!, `${origin}${route}`);
      if (url.origin !== origin) continue;
      if (!/^\/(en|vi|zh|zh-hant)\/(?:[a-z0-9-]+\/)*$/.test(url.pathname)) {
        continue;
      }
      if (!seen.has(url.pathname)) {
        seen.add(url.pathname);
        queue.push(url.pathname);
      }
    }
  }

  expect(pages.filter(isRealPage).length).toBeGreaterThanOrEqual(40);
  for (const route of ["/en/products/sotro/", "/vi/products/sotro/"]) {
    expect(seen.has(route), `${route} reached`).toBe(true);
  }
  expect(builtPageProblems(pages, records)).toEqual([]);
});
