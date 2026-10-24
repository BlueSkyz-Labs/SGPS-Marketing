import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import test from "node:test";
import { formatDate } from "../../src/lib/i18n.ts";

/**
 * Wave G2 dist-level backstop for wg-dateline-single-role.test.mjs: checks the
 * rendered HTML, so it also catches what the source heuristic cannot (a rename,
 * a cross-file value). Runs against `dist/` when a build exists; otherwise it
 * reports an explicit skip (never a silent pass).
 */
const ROOT = new URL("../../", import.meta.url).pathname;
const DIST = join(ROOT, "dist");
const LANGS = new Set(["en", "vi", "zh", "zh-hant"]);

function* htmlFiles(dir) {
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

export function datelineProblems(path, html) {
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

test("WG-02 dist: no visible ISO date and every dateline matches its route language", (t) => {
  if (!existsSync(DIST)) {
    t.skip("SKIPPED: dist/ is absent; run `pnpm build` first (not a PASS)");
    return;
  }
  const problems = [];
  let pages = 0;
  let datelines = 0;
  for (const full of htmlFiles(DIST)) {
    const path = "/" + relative(DIST, full).split(sep).join("/");
    const html = readFileSync(full, "utf8");
    pages += 1;
    datelines += (html.match(/class="[^"]*\bdateline\b/g) ?? []).length;
    problems.push(...datelineProblems(path, html));
  }
  assert.ok(pages > 50, `scanned ${pages} pages`);
  assert.ok(datelines > 0, "at least one rendered dateline");
  assert.deepEqual(problems, []);
});

test("WG-02 dist negative proof: a visible ISO date or a wrong-locale dateline fails", () => {
  const bad = "<main><p>Captured 2026-09-30 with sample data</p></main>";
  const a = datelineProblems("/en/x/index.html", bad);
  console.log(`NEGATIVE PROOF (dist visible ISO): FAIL -> ${a.join(" | ")}`);
  assert.equal(a.length, 1);
  // Scripts, styles and attributes are not visible text.
  const quiet =
    '<script>var d="2026-09-30"</script><p data-capture-date="2026-09-30">x</p>';
  assert.deepEqual(datelineProblems("/en/x/index.html", quiet), []);
  const wrong =
    '<time class="dateline" datetime="2026-09-12">September 12, 2026</time>';
  const b = datelineProblems("/vi/x/index.html", wrong);
  console.log(`NEGATIVE PROOF (dist wrong locale): FAIL -> ${b.join(" | ")}`);
  assert.equal(b.length, 1);
  assert.deepEqual(datelineProblems("/en/x/index.html", wrong), []);
  assert.equal(routeLang("/index.html"), "en");
  assert.equal(routeLang("/zh-hant/about/index.html"), "zh-hant");
});
