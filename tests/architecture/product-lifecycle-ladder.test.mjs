import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const COMPONENT = "src/components/product/ProductLadder.astro";
const COPY = "src/lib/product-copy.ts";
const SCHEMA = "src/lib/product-schema.ts";
const ROUTES = ["en", "vi", "zh", "zh-hant"].map((lang) => ({
  lang,
  path: `src/pages/${lang}/products/[slug].astro`,
}));

function readComponent() {
  assert.ok(existsSync(COMPONENT), "the public profile ladder must exist");
  return readFileSync(COMPONENT, "utf8");
}

test("public profile ladder marks only the recorded stage and localizes every stage", () => {
  const component = readComponent();
  const copy = readFileSync(COPY, "utf8");
  const schema = readFileSync(SCHEMA, "utf8");
  const lifecycleEnum = schema.match(
    /const lifecycle = z\.enum\(\[([\s\S]*?)\]\);/,
  )?.[1];
  const ladder = copy.match(
    /LIFECYCLE_LADDER:[\s\S]*?=\s*\[([\s\S]*?)\];/,
  )?.[1];
  assert.ok(lifecycleEnum, "product schema must declare lifecycle values");
  assert.ok(ladder, "product copy must declare the rendered lifecycle ladder");
  assert.deepEqual(
    [...ladder.matchAll(/"([a-z]+)"/g)].map((match) => match[1]),
    [...lifecycleEnum.matchAll(/"([a-z]+)"/g)].map((match) => match[1]),
    "every schema-valid lifecycle stage must be representable",
  );
  assert.match(component, /LIFECYCLE_LADDER\.map\(/);
  assert.match(component, /lifecycleLabel\(stage, lang\)/);
  assert.match(
    component,
    /aria-current=\{stage === lifecycle \? "step" : undefined\}/,
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

test("every ladder stage remains distinguishable in forced-colors mode", () => {
  const component = readComponent();
  assert.match(component, /@media\s*\(forced-colors:\s*active\)/);
  assert.match(
    component,
    /\.product-ladder__stage\s*\{[^}]*color:\s*CanvasText/,
  );
  assert.match(
    component,
    /\.product-ladder__stage\s*\{[^}]*border-color:\s*CanvasText/,
  );
  assert.match(
    component,
    /\.product-ladder__stage\[aria-current="step"\][^{]*\{[^}]*border-color:\s*Highlight/,
  );
});

test("stage labels keep a readable minimum width on narrow screens", () => {
  const component = readComponent();
  assert.match(
    component,
    /grid-template-columns:\s*repeat\(auto-fit,\s*minmax\(min\(100%,\s*8rem\),\s*1fr\)\)/,
  );
});
