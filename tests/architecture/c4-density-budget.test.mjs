import assert from "node:assert/strict";
import test from "node:test";
import {
  DENSITY_CEILINGS,
  describeDensity,
  evaluateDensity,
  measureDensity,
} from "../../src/lib/quiet-density.ts";

test("C4 density: a quiet scene passes", () => {
  const report = evaluateDensity({
    primaryActions: 1,
    chips: 3,
    focalMedia: 1,
    cardGroups: 1,
  });
  assert.equal(report.ok, true);
  assert.deepEqual(report.violations, []);
  assert.equal(describeDensity(report), "density budget: within ceilings");
});

test("C4 density: competing primary CTAs are caught", () => {
  const report = evaluateDensity({ primaryActions: 2 });
  assert.equal(report.ok, false);
  assert.deepEqual(report.violations, [
    {
      key: "primaryActions",
      count: 2,
      ceiling: DENSITY_CEILINGS.primaryActions,
    },
  ]);
});

test("C4 density: excessive chips are caught", () => {
  const report = evaluateDensity({ chips: DENSITY_CEILINGS.chips + 1 });
  assert.equal(report.ok, false);
  assert.equal(report.violations[0]?.key, "chips");
});

test("C4 density: too many simultaneous focal media are caught", () => {
  const report = evaluateDensity({ focalMedia: 2 });
  assert.equal(report.ok, false);
  assert.equal(report.violations[0]?.key, "focalMedia");
});

test("C4 density: hostile values never count as density", () => {
  assert.deepEqual(
    measureDensity({ chips: Number.NaN, primaryActions: -3, cardGroups: 2.7 }),
    {
      primaryActions: 0,
      chips: 0,
      focalMedia: 0,
      cardGroups: 2,
      motionHooks: 0,
    },
  );
});

test("C4 density: verdict is deterministic", () => {
  const scene = { primaryActions: 3, chips: 9, focalMedia: 2 };
  assert.deepEqual(evaluateDensity(scene), evaluateDensity(scene));
});

test("C4 density: no luxury score is ever produced", () => {
  const report = evaluateDensity({ primaryActions: 2 });
  assert.deepEqual(Object.keys(report).sort(), ["ok", "scene", "violations"]);
  assert.doesNotMatch(JSON.stringify(report), /score/i);
});
