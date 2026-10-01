import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const COMPONENT = "src/components/product/ProductLadder.astro";
const COPY = "src/lib/product-copy.ts";
const SCHEMA = "src/lib/product-schema.ts";
const EMPTY_COPY = "src/data/empty-state-copy.ts";
const ROUTES = ["en", "vi", "zh", "zh-hant"].map((lang) => ({
  lang,
  path: `src/pages/${lang}/products/[slug].astro`,
}));

function readComponent() {
  assert.ok(existsSync(COMPONENT), "the public profile stage must exist");
  return readFileSync(COMPONENT, "utf8");
}

/**
 * v7 D-13: the visitor sees the recorded stage only. A "next" stage or the full
 * internal ladder reads as a roadmap commitment that no dated fact backs.
 */
const showsOnlyCurrentStage = (component, emptyCopy) =>
  /lifecycleLabel\(lifecycle, lang\)/.test(component) &&
  !/LIFECYCLE_LADDER/.test(component) &&
  !/ladderNext|ladderAll/.test(component) &&
  !/<details|<ol|<li/.test(component) &&
  !/ladderNext|ladderAll/.test(emptyCopy);

test("every schema-valid lifecycle stage stays representable and localized", () => {
  const copy = readFileSync(COPY, "utf8");
  const schema = readFileSync(SCHEMA, "utf8");
  const lifecycleEnum = schema.match(
    /const lifecycle = z\.enum\(\[([\s\S]*?)\]\);/,
  )?.[1];
  const ladder = copy.match(
    /LIFECYCLE_LADDER:[\s\S]*?=\s*\[([\s\S]*?)\];/,
  )?.[1];
  assert.ok(lifecycleEnum, "product schema must declare lifecycle values");
  assert.ok(ladder, "product copy must declare the lifecycle stage labels");
  assert.deepEqual(
    [...ladder.matchAll(/"([a-z]+)"/g)].map((match) => match[1]),
    [...lifecycleEnum.matchAll(/"([a-z]+)"/g)].map((match) => match[1]),
  );
});

test("the product page states the current stage only, in every locale", () => {
  const component = readComponent();
  const emptyCopy = readFileSync(EMPTY_COPY, "utf8");
  assert.ok(
    showsOnlyCurrentStage(component, emptyCopy),
    "no next-stage line and no stage list on the visitor surface",
  );
  assert.doesNotMatch(component, /\b(?:animation|transition)\s*:/);
  for (const { lang, path } of ROUTES) {
    const source = readFileSync(path, "utf8");
    assert.match(
      source,
      /import ProductLadder from "@\/components\/product\/ProductLadder\.astro"/,
    );
    assert.match(
      source,
      new RegExp(
        `<ProductLadder lifecycle=\\{data\\.lifecycle\\} lang="${lang}" \/>`,
      ),
    );
  }
});

test("negative proof: a next-stage line or stage list fails the guard", () => {
  const component = readComponent();
  const emptyCopy = readFileSync(EMPTY_COPY, "utf8");
  assert.equal(
    showsOnlyCurrentStage(
      `${component}\n{labelFor(EMPTY_STATE_COPY.ladderNext, lang)}`,
      emptyCopy,
    ),
    false,
    "a 'next in the ladder' line must be rejected",
  );
  assert.equal(
    showsOnlyCurrentStage(
      `${component}\n{LIFECYCLE_LADDER.map((stage) => <li>{stage}</li>)}`,
      emptyCopy,
    ),
    false,
    "the full stage list must be rejected",
  );
  assert.equal(
    showsOnlyCurrentStage(component, `${emptyCopy}\nladderAll: {}`),
    false,
    "the retired copy keys must stay removed",
  );
});
