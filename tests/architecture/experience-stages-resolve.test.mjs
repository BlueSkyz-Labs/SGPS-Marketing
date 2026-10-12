/**
 * Every EXPERIENCE_STAGES entry (src/data/experience.ts) must open an existing
 * page and, when it names a heading id, an element with that id on that page.
 * Checked against the built site (dist/) in every locale ExperienceSpine can
 * render. The spine is currently not rendered on any page (C2 demoted it);
 * the data is still kept resolvable so re-using it cannot ship dead anchors.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const LANGS = ["en", "vi", "zh", "zh-hant"];
const SRC = readFileSync("src/data/experience.ts", "utf8");

/** Parse stage heads (path, optional id) out of the source, any field order. */
export function parseStages(source) {
  const block = source.match(
    /export const EXPERIENCE_STAGES[^=]*=\s*\[([\s\S]*?)\n\];/,
  )?.[1];
  assert.ok(block, "EXPERIENCE_STAGES block not found");
  return block
    .split(/\n  \{\n/)
    .slice(1)
    .map((chunk) => {
      const head = chunk.split(/\n\s*label:/)[0];
      return {
        path: head.match(/\bpath:\s*"([^"]+)"/)?.[1],
        id: head.match(/\bid:\s*"([^"]+)"/)?.[1],
      };
    });
}

/** Source mode (always runs, no build needed): page file + id literal in src. */
export function unresolvedInSource(stages, exists, srcTexts) {
  const bad = [];
  for (const lang of LANGS) {
    for (const { path, id } of stages) {
      const base = `src/pages/${lang}${path.replace(/\/$/, "")}`;
      const candidates =
        path === "/"
          ? [`src/pages/${lang}/index.astro`]
          : [`${base}.astro`, `${base}/index.astro`];
      if (!candidates.some(exists)) bad.push(`${lang}${path}: page missing`);
      if (id && !srcTexts.some((t) => t.includes(`id="${id}"`)))
        bad.push(`${lang}${path}#${id}: id missing in src`);
    }
  }
  return bad;
}

export function unresolved(stages, read) {
  const bad = [];
  for (const lang of LANGS) {
    for (const { path, id } of stages) {
      const file = `dist/${lang}${path}index.html`;
      const html = read(file);
      if (html === null) {
        bad.push(`${lang}${path}: page missing`);
      } else if (id && !new RegExp(`\\sid="${id}"`).test(html)) {
        bad.push(`${lang}${path}#${id}: id missing`);
      }
    }
  }
  return bad;
}

const readDist = (file) =>
  existsSync(file) ? readFileSync(file, "utf8") : null;

test("EXPERIENCE_STAGES declares the four stages", () => {
  assert.equal(parseStages(SRC).length, 4);
});

test(
  "every stage href resolves to an existing page and id in dist",
  {
    skip: existsSync("dist/en/index.html") ? false : "dist/ not built",
  },
  () => {
    assert.deepEqual(unresolved(parseStages(SRC), readDist), []);
  },
);

test("negative proof: a stale id and a missing page are rejected", () => {
  const stale = [{ path: "/", id: "house-title" }, { path: "/no-such-page/" }];
  const read = (file) =>
    file.endsWith("/no-such-page/index.html")
      ? null
      : '<h2 id="product-house-title">';
  const bad = unresolved(stale, read);
  assert.equal(bad.length, LANGS.length * 2);
  assert.ok(bad.some((b) => b.includes("id missing")));
  assert.ok(bad.some((b) => b.includes("page missing")));
});

const walk = (d) =>
  readdirSync(d).flatMap((n) =>
    statSync(join(d, n)).isDirectory() ? walk(join(d, n)) : [join(d, n)],
  );
const SRC_TEXTS = () =>
  walk("src")
    .filter((f) => f.endsWith(".astro"))
    .map((f) => readFileSync(f, "utf8"));

test("source mode: every stage page and id exists in src (runs without dist)", () => {
  assert.deepEqual(
    unresolvedInSource(parseStages(SRC), existsSync, SRC_TEXTS()),
    [],
  );
});

test("negative proof (source mode): stale id and missing page are rejected", () => {
  const bad = unresolvedInSource(
    [{ path: "/", id: "house-title" }, { path: "/no-such-page/" }],
    existsSync,
    SRC_TEXTS(),
  );
  assert.ok(bad.some((b) => b.includes("id missing in src")));
  assert.ok(bad.some((b) => b.includes("page missing")));
});

test("parseStages is independent of field order", () => {
  const src = `export const EXPERIENCE_STAGES: X[] = [\n  {\n    id: "a",\n    path: "/p/",\n    label: {},\n  },\n];`;
  assert.deepEqual(parseStages(src), [{ path: "/p/", id: "a" }]);
});
