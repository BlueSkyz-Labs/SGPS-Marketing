import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

/**
 * Wave G2: the one implementation of the rendered-HTML date scan, shared by
 * tests/architecture/wg-dateline-dist.test.mjs (explicit skip without dist/)
 * and tests/e2e/wg-dateline-dist.spec.ts (fails without dist/, runs in the
 * Browser Assurance job after the build). `formatDate` is injected so this
 * plain .mjs never imports TypeScript.
 */
const LANGS = new Set(["en", "vi", "zh", "zh-hant"]);

export function* htmlFiles(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) yield* htmlFiles(full);
    else if (name.endsWith(".html")) yield full;
  }
}

/** Route language from the URL path; the bare root and 404 are English. */
export function routeLang(path) {
  const first = path.split("/").filter(Boolean)[0];
  return LANGS.has(first) ? first : "en";
}

export function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ");
}

export function datelineProblems(path, html, formatDate) {
  const problems = [];
  const iso = visibleText(html).match(/\b\d{4}-\d{2}-\d{2}\b/g) ?? [];
  for (const hit of iso) problems.push(`${path}: visible ISO date ${hit}`);
  const lang = routeLang(path);
  const re =
    /<time\b[^>]*class="[^"]*\bdateline\b[^"]*"[^>]*>([\s\S]*?)<\/time>/g;
  for (const m of html.matchAll(re)) {
    const attr = /datetime="([^"]*)"/.exec(m[0])?.[1] ?? "";
    const text = m[1].replace(/<[^>]+>/g, "").trim();
    if (text !== formatDate(lang, attr)) {
      problems.push(
        `${path}: dateline "${text}" != formatDate(${lang}, ${attr})`,
      );
    }
  }
  return problems;
}

/** Scan every page under `dist`; the caller decides what a missing dist means. */
export function scanDist(dist, formatDate) {
  if (!existsSync(dist)) return null;
  const problems = [];
  let pages = 0;
  let datelines = 0;
  for (const full of htmlFiles(dist)) {
    const path = "/" + relative(dist, full).split(sep).join("/");
    const html = readFileSync(full, "utf8");
    pages += 1;
    datelines += (html.match(/class="[^"]*\bdateline\b/g) ?? []).length;
    problems.push(...datelineProblems(path, html, formatDate));
  }
  return { pages, datelines, problems };
}

/** Shared negative-proof fixtures: each must produce exactly one problem. */
export const NEGATIVE_FIXTURES = {
  visibleIso: {
    path: "/en/x/index.html",
    html: "<main><p>Captured 2026-09-30 with sample data</p></main>",
  },
  wrongLocale: {
    path: "/vi/x/index.html",
    html: '<time class="dateline" datetime="2026-09-12">September 12, 2026</time>',
  },
};
export const QUIET_FIXTURE =
  '<script>var d="2026-09-30"</script><p data-capture-date="2026-09-30">x</p>';
