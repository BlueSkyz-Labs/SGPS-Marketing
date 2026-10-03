import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { isProtected } from "../../scripts/check-merge-policy.mjs";

const seo = JSON.parse(readFileSync("lighthouserc.seo.json", "utf8")).ci;
const launcher = readFileSync("scripts/run-lighthouse-seo.mjs", "utf8");
const workflow = readFileSync(".github/workflows/quality-gates.yml", "utf8");
const gateRoutes = JSON.parse(readFileSync("lighthouserc.mobile.json", "utf8"))
  .ci.collect.url;

test("SEO lane builds against the canonical production origin", () => {
  assert.match(launcher, /PUBLIC_SITE_URL: "https:\/\/blueskyzlabs\.com"/);
  assert.match(launcher, /"--config=\.\/lighthouserc\.seo\.json"/);
  // CI runs the launcher with plain `node`: the binary must resolve through
  // `pnpm exec`, never a bare `lhci` spawn (ENOENT on the runner).
  assert.match(launcher, /run\("pnpm", \["exec", "lhci"/);
  assert.doesNotMatch(launcher, /run\("lhci"/);
  assert.match(launcher, /run\("pnpm", \["build"\]\)/);
});

test("SEO lane collects SEO only, on every mobile gate route", () => {
  assert.deepEqual(seo.collect.settings.onlyCategories, ["seo"]);
  assert.deepEqual(seo.collect.url, gateRoutes);
  assert.ok(seo.collect.numberOfRuns >= 3);
});

test("SEO category and crawl audits are errors, not warnings", () => {
  const a = seo.assert.assertions;
  assert.deepEqual(a["categories:seo"], ["error", { minScore: 0.95 }]);
  for (const id of [
    "is-crawlable",
    "canonical",
    "hreflang",
    "meta-description",
    "document-title",
    "http-status-code",
  ]) {
    assert.equal(a[id], "error", `${id} must be asserted as an error`);
  }
});

test("SEO reports stay out of the performance report directory", () => {
  assert.equal(seo.upload.outputDir, ".lighthouseci-seo");
});

test("CI runs the SEO lane after both performance lanes", () => {
  const mobile = workflow.indexOf("lighthouserc.mobile.json");
  const lane = workflow.indexOf("node scripts/run-lighthouse-seo.mjs");
  assert.ok(mobile > 0 && lane > mobile, "SEO lane must run after mobile");
});

test("Lighthouse configs are Owner-protected paths", () => {
  for (const path of [
    "lighthouserc.json",
    "lighthouserc.mobile.json",
    "lighthouserc.seo.json",
    "scripts/run-lighthouse-seo.mjs",
  ]) {
    assert.ok(isProtected(path), `${path} must be protected`);
  }
});
