import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import test from "node:test";

const ROOT = resolve(import.meta.dirname, "../..");
const EVIDENCE = resolve(
  ROOT,
  "docs/evidence/2026-09-22-sgps-experience-adoption.md",
);

test("SGPS Experience adoption evidence keeps governance and convergence separate", () => {
  const source = readFileSync(EVIDENCE, "utf8");
  const requiredSources = [
    "SGPS-DEC-2026-004",
    "SGPS-DEC-2026-006",
    "SGPS-DEC-2026-007",
    "SGPS-DEC-2026-008",
    "SGPS-DEC-2026-012",
    "GUX master",
    "bilingual → trilingual profile",
  ];

  for (const requiredSource of requiredSources) {
    assert.equal(
      source.split(requiredSource).length - 1,
      1,
      `${requiredSource} must have exactly one matrix row`,
    );
  }

  assert.match(
    source,
    /`sgps-core` tree `a850e5cc7f277c4c04c446aee35e7516f798ba53`/,
  );
  assert.match(
    source,
    /published SGPS v1\.13\.0 release pin remains unchanged/,
  );
  assert.match(source, /Governance state/);
  assert.match(source, /Experience state/);
  assert.match(source, /PENDING_EXTERNAL/);
  assert.match(source, /NOT_VERIFIED/);
  assert.doesNotMatch(source, /SGPS adopted(?! through)/i);
  assert.doesNotMatch(source, /SGPS:Experience FULL COMPLETE/i);
});

test("SGPS Experience adoption evidence names durable project guards", () => {
  const source = readFileSync(EVIDENCE, "utf8");
  for (const projectGuard of [
    "tests/architecture/current-work-router.test.mjs",
    "tests/architecture/public-truth-gate.test.mjs",
    "tests/architecture/c3-program-boundary.test.mjs",
    "tests/e2e/c3-trilingual-parity.spec.ts",
    "tests/e2e/accessibility.spec.ts",
    "tests/e2e/text-zoom.spec.ts",
  ]) {
    assert.match(source, new RegExp(projectGuard.replaceAll(".", "\\.")));
  }
});
