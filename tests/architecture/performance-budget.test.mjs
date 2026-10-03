import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { evaluate } from "../../scripts/check-performance-budget.mjs";
import { PROTECTED_PATHS } from "../../scripts/check-merge-policy.mjs";

/*
 * SGPS-DEC-2026-025 web adapter: the budget is declared, covers every gate
 * route, cannot exceed the decision's defaults, is protected, and is wired
 * into the Lighthouse job. Each guard has a negative proof below.
 */

const read = (path) => readFileSync(path, "utf8");
const budget = JSON.parse(read("performance-budget.json"));
const lhciRoutes = JSON.parse(
  read("lighthouserc.mobile.json"),
).ci.collect.url.map((url) => new URL(url).pathname);

test("budget routes equal the mobile Lighthouse gate routes (no silent omission)", () => {
  assert.deepEqual([...budget.routes].sort(), [...lhciRoutes].sort());
  assert.ok(budget.minRuns >= 3, "median of at least 3 runs");
});

test("budget ceilings never exceed the DEC-025 web defaults", () => {
  assert.ok(budget.timing["largest-contentful-paint"] <= 2500);
  assert.ok(budget.timing["total-blocking-time"] <= 200);
  assert.ok(budget.timing["cumulative-layout-shift"] <= 0.1);
  assert.ok(budget.warnRatio <= 0.85);
  assert.equal(budget.zeroCounts["third-party"], 0);
});

test("budget and gate config are protected paths", () => {
  for (const path of [
    "performance-budget.json",
    "lighthouserc.mobile.json",
    "scripts/",
  ]) {
    assert.ok(PROTECTED_PATHS.includes(path), `${path} must be protected`);
  }
});

test("the Lighthouse job runs the budget check after the mobile collection", () => {
  const workflow = read(".github/workflows/quality-gates.yml");
  const collect = workflow.indexOf(
    "lhci autorun --config=./lighthouserc.mobile.json",
  );
  const check = workflow.indexOf(
    "node scripts/check-performance-budget.mjs .lighthouseci",
  );
  assert.ok(collect > 0 && check > collect);
  const tbt = JSON.parse(read("lighthouserc.mobile.json")).ci.assert.assertions[
    "total-blocking-time"
  ];
  assert.equal(tbt[0], "error", "TBT is a blocking lab proxy (DEC-025 4.1)");
});

const run = (route, overrides = {}) => ({
  route,
  timing: {
    "largest-contentful-paint": 1900,
    "cumulative-layout-shift": 0,
    "total-blocking-time": 10,
    ...overrides.timing,
  },
  resourceBytes: {
    document: 9000,
    script: 12000,
    stylesheet: 24000,
    font: 56000,
    image: 55000,
    total: 165000,
    ...overrides.resourceBytes,
  },
  zeroCounts: {
    "third-party": 0,
    "render-blocking": 0,
    ...overrides.zeroCounts,
  },
});
const allRoutes = (overrides) =>
  budget.routes.flatMap((route) => [
    run(route, overrides),
    run(route, overrides),
    run(route, overrides),
  ]);

test("evaluate passes the measured baseline", () => {
  const { errors } = evaluate(allRoutes(), budget);
  assert.deepEqual(errors, []);
});

test("negative proof 1: a resource/performance regression fails", () => {
  const { errors } = evaluate(
    allRoutes({ resourceBytes: { image: 400000, total: 510000 } }),
    budget,
  );
  assert.ok(errors.some((e) => e.includes("resourceBytes.image")));
  const slow = evaluate(
    allRoutes({ timing: { "largest-contentful-paint": 2600 } }),
    budget,
  );
  assert.ok(slow.errors.some((e) => e.includes("largest-contentful-paint")));
  const thirdParty = evaluate(
    allRoutes({ zeroCounts: { "third-party": 1 } }),
    budget,
  );
  assert.ok(thirdParty.errors.some((e) => e.includes("third-party")));
});

test("negative proof 2: a dropped route or missing runs fails", () => {
  const summaries = allRoutes().filter(
    (s) => s.route !== "/vi/products/sotro/",
  );
  const { errors } = evaluate(summaries, budget);
  assert.ok(errors.some((e) => e.startsWith("/vi/products/sotro/:")));
  const routes = [...budget.routes];
  routes.pop();
  assert.notDeepEqual(
    routes.sort(),
    [...lhciRoutes].sort(),
    "omission breaks the coverage test",
  );
});

test("warning fires at 85 % of a ceiling without failing", () => {
  const { errors, warnings } = evaluate(
    allRoutes({ timing: { "largest-contentful-paint": 2200 } }),
    budget,
  );
  assert.deepEqual(errors, []);
  assert.ok(warnings.some((w) => w.includes("largest-contentful-paint")));
});
