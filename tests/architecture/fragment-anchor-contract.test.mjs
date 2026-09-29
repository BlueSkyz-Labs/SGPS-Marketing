/**
 * Fragment-anchor contract — Firefox can restore the previous document's scroll
 * position over a same-tab fragment navigation, so the deep-link target needs a
 * post-load re-assert. The native scroll stays the authority and the module must
 * stay inert without a fragment, without a target and when the target is visible.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const SOURCE = "src/scripts/fragment-anchor.ts";
const LAYOUT = "src/layouts/BaseLayout.astro";

test("the fragment anchor only re-asserts an out-of-view fragment target", () => {
  const source = readFileSync(SOURCE, "utf8");
  assert.match(source, /export function initFragmentAnchor/);
  assert.match(source, /window\.location\.hash\.slice\(1\)/);
  assert.match(source, /document\.getElementById\(id\)/);
  assert.match(source, /rect\.top >= 0 && rect\.bottom <= window\.innerHeight/);
  assert.match(source, /scrollMarginTop/);
  assert.match(source, /behavior: "instant"/);
  // Never mutate the URL or reach the network.
  assert.doesNotMatch(source, /location\.(?:hash|href|assign|replace)\s*=/);
  assert.doesNotMatch(
    source,
    /fetch\(|XMLHttpRequest|localStorage|sessionStorage/,
  );
});

test("the layout loads the fragment anchor after the document scripts", () => {
  const layout = readFileSync(LAYOUT, "utf8");
  assert.match(
    layout,
    /import \{ initFragmentAnchor \} from "@\/scripts\/fragment-anchor"/,
  );
  assert.match(layout, /initFragmentAnchor\(\);/);
});
