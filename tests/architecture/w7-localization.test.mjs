/**
 * v8 W7 localization contract. Each guard is a pure predicate run on the real
 * source and then on an intentionally broken copy (negative proof).
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

import { formatDate } from "../../src/lib/i18n.ts";

const read = (path) => readFileSync(path, "utf8");
function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (/\.(astro|ts|mjs|yaml|json|md)$/.test(name)) out.push(path);
  }
  return out;
}
const SRC_FILES = walk("src");

/* OG-10: zh and zh-hant both use 你. Allow-list is empty; add a file here only with an Owner decision. */
const POLITE_YOU_ALLOW = new Set([]);
const politeYouHits = (files, readFile) =>
  files.filter((f) => !POLITE_YOU_ALLOW.has(f) && readFile(f).includes("您"));

test("W7: no 您 in src zh/zh-hant strings unless allow-listed", () => {
  assert.deepEqual(politeYouHits(SRC_FILES, read), []);
});
test("W7 negative proof: the 您 guard catches a broken copy", () => {
  const fake = () => "您可以核實";
  assert.deepEqual(politeYouHits(["src/x.ts"], fake), ["src/x.ts"]);
  assert.deepEqual(
    politeYouHits(["src/x.ts"], fake).filter(() =>
      POLITE_YOU_ALLOW.has("src/x.ts"),
    ),
    [],
  );
});

/* Glossary: Vietnamese copy says "trang web", never the standalone English word "site". */
const VI_CHARS = /[ăâđêôơưàáạảãèéẹẻẽìíịỉĩòóọỏõùúụủũỳýỵỷỹ]/i;
const STANDALONE_SITE = /(?<![\w/.@#:$-])[Ss]ite(?![\w/.(#:-])/;
const siteInVi = (files, readFile) =>
  files.flatMap((f) =>
    readFile(f)
      .split("\n")
      .map((line, i) => ({ f, i: i + 1, line }))
      .filter(({ line }) => VI_CHARS.test(line) && STANDALONE_SITE.test(line))
      .map(({ f: file, i }) => `${file}:${i}`),
  );

test("W7: Vietnamese strings never use the standalone word site", () => {
  assert.deepEqual(siteInVi(SRC_FILES, read), []);
});
test("W7 negative proof: the site guard catches a broken Vietnamese line", () => {
  const fake = () => 'vi: "Site này tĩnh trước, rời khỏi site và nói rõ"';
  assert.deepEqual(siteInVi(["src/x.ts"], fake), ["src/x.ts:1"]);
  const benign = () =>
    'import { SITE } from "@/data/site"; vi: "Trang web này"';
  assert.deepEqual(siteInVi(["src/x.ts"], benign), []);
});

/* One date helper, Intl-backed, per locale. */
test("W7: formatDate(locale, iso) renders per locale", () => {
  assert.equal(formatDate("en", "2026-09-12"), "September 12, 2026");
  assert.equal(formatDate("vi", "2026-09-12"), "12 tháng 9, 2026");
  assert.equal(formatDate("zh", "2026-09-12"), "2026年9月12日");
  assert.equal(formatDate("zh-hant", "2026-09-12"), "2026年9月12日");
  assert.equal(formatDate("vi", "soon"), "soon");
  assert.equal(formatDate("en", "2026-02-31"), "2026-02-31");
});
test("W7 negative proof: formatDate is not the identity or locale-blind", () => {
  assert.notEqual(formatDate("vi", "2026-09-12"), "2026-09-12");
  assert.notEqual(
    formatDate("vi", "2026-09-12"),
    formatDate("en", "2026-09-12"),
  );
  assert.notEqual(
    formatDate("zh", "2026-09-12"),
    formatDate("en", "2026-09-12"),
  );
});

/* Palette: at least two keywords per locale for every route item. */
const aliasLocaleLists = (src) => {
  const block = src.slice(
    src.indexOf("const ROUTE_ALIASES"),
    src.indexOf("const DECISION_ROOM_LABEL"),
  );
  return [...block.matchAll(/^\s+(?:en|vi|zh|"zh-hant"): \[(.*)\],$/gm)].map(
    (m) => (m[1].match(/"[^"]+"/g) ?? []).length,
  );
};
const shortLists = (counts) => counts.filter((n) => n < 2);

test("W7: every palette route has at least 2 keywords per locale", () => {
  const counts = aliasLocaleLists(read("src/lib/navigator.ts"));
  assert.ok(counts.length >= 40, `parsed ${counts.length} locale lists`);
  assert.deepEqual(shortLists(counts), []);
});
test("W7: evidence-passport palette items carry the keyword list", () => {
  const src = read("src/lib/navigator.ts");
  assert.match(
    src,
    /kind: "evidence",\s*aliases: \[\.\.\.EVIDENCE_PASSPORT_ALIASES\[lang\]\]/,
  );
  assert.ok(src.includes('vi: ["bằng chứng", "tuyên bố"]'));
});
test("W7: zh and zh-hant verify synonyms are present", () => {
  const src = read("src/lib/navigator.ts");
  for (const t of ["核实", "核验", "验证", "核實", "核驗", "驗證", "查證"]) {
    assert.ok(src.includes(`"${t}"`), t);
  }
});
test("W7 negative proof: the keyword guard catches a one-keyword locale", () => {
  const broken = read("src/lib/navigator.ts").replace(
    'vi: ["liên hệ", "liên lạc"],',
    'vi: ["liên hệ"],',
  );
  assert.deepEqual(shortLists(aliasLocaleLists(broken)), [1]);
});

/* OG-2 option A: tagline stays English with lang="en" outside vi. */
const taglineLangOk = (src) =>
  /<p\s+lang=\{isVi \? undefined : "en"\}\s+class="footer-tagline/.test(src);
test("W7: footer tagline carries lang=en outside Vietnamese", () => {
  assert.ok(taglineLangOk(read("src/components/layout/Footer.astro")));
  assert.ok(!taglineLangOk('<p class="footer-tagline'));
});
