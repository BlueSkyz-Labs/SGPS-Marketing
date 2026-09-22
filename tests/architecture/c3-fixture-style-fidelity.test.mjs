import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const RUNTIME_LAYOUT = "src/layouts/BaseLayout.astro";
const HARNESS = "tests/e2e/helpers/parity-fixture.ts";
const FIXTURE_PAGES = [
  "tests/e2e/fixtures/parity-app/src/pages/product-acts.astro",
  "tests/e2e/fixtures/parity-app/src/pages/product-acts-vi.astro",
];

const GLOBAL_STYLE = 'import "@/styles/global.css";';
const CRAFT_STYLE = 'import "@/styles/c3-craft.css";';

function source(path) {
  return readFileSync(path, "utf8");
}

test("product-present fixture pages load the runtime style entry in authoritative order", () => {
  const runtime = source(RUNTIME_LAYOUT);
  const runtimeGlobal = runtime.indexOf(GLOBAL_STYLE);
  const runtimeCraft = runtime.indexOf(CRAFT_STYLE);

  assert.ok(runtimeGlobal >= 0, "BaseLayout must load global.css");
  assert.ok(
    runtimeCraft > runtimeGlobal,
    "BaseLayout must load c3-craft.css after global.css",
  );

  for (const path of FIXTURE_PAGES) {
    const fixture = source(path);
    const fixtureGlobal = fixture.indexOf(GLOBAL_STYLE);
    const fixtureCraft = fixture.indexOf(CRAFT_STYLE);

    assert.ok(
      fixtureGlobal >= 0,
      `${path} must load the production global style entry`,
    );
    assert.ok(
      fixtureCraft > fixtureGlobal,
      `${path} must load c3-craft.css after global.css like BaseLayout`,
    );
  }
});

test("the fixture harness serves the real build with truthful content types", () => {
  // A parity app that links hashed stylesheets but receives them under a
  // generic content type renders unstyled: the browser refuses the sheet under
  // strict MIME checking, and every layout assertion then measures the wrong
  // page without failing loudly. Guard the harness's own fidelity.
  const harness = source(HARNESS);
  assert.match(
    harness,
    /"\.css":\s*"text\/css; charset=utf-8"/,
    "the fixture harness must serve .css as text/css",
  );
  assert.match(
    harness,
    /CONTENT_TYPES\[extname\(filePath\)\]/,
    "the fixture harness must resolve the content type from the file extension",
  );
});
