/**
 * Every EXPERIENCE_STAGES entry (src/data/experience.ts) must open an existing
 * page and, when it names a heading id, an element with that id on that page.
 * Checked against the built site (dist/) in every locale ExperienceSpine can
 * render. The spine is currently not rendered on any page (C2 demoted it);
 * the data is still kept resolvable so re-using it cannot ship dead anchors.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const LANGS = ["en", "vi", "zh", "zh-hant"];
const SRC = readFileSync("src/data/experience.ts", "utf8");

/** Parse `{ path: "...", id?: "..." }` stage heads out of the source. */
export function parseStages(source) {
  const block = source.match(
    /export const EXPERIENCE_STAGES[^=]*=\s*\[([\s\S]*?)\n\];/,
  )?.[1];
  assert.ok(block, "EXPERIENCE_STAGES block not found");
  return [
    ...block.matchAll(/\{\s*path:\s*"([^"]+)"(?:,\s*id:\s*"([^"]+)")?/g),
  ].map((m) => ({ path: m[1], id: m[2] }));
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
