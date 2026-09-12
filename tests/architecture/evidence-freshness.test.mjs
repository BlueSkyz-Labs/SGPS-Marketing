import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const read = (path) =>
  readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

const data = read("src/data/integrity.ts");
const details = read("src/components/integrity/EvidenceDetails.astro");

test("review dates are authored data, never generated", () => {
  assert.doesNotMatch(data, /new Date\(\)|Date\.now\(\)/);
  assert.doesNotMatch(details, /new Date\(\)|Date\.now\(\)/);
  const dates = [...data.matchAll(/reviewedOn: "([^"]+)"/g)].map((m) => m[1]);
  assert.ok(dates.length > 0, "expected at least one authored review date");
  for (const date of dates) {
    assert.match(
      date,
      /^\d{4}-\d{2}-\d{2}$/,
      `authored ISO date required: ${date}`,
    );
  }
});

test("freshness renders only when explicit review metadata exists", () => {
  assert.match(
    details,
    /review\s*\?/,
    "the review row must be conditional on authored metadata",
  );
  assert.match(details, /data-evidence-review/);
  assert.doesNotMatch(details, /mtime|git log|build time|timestamp/i);
});

test("truth states receive no perpetual animation hooks", () => {
  const truthState = read("src/components/integrity/TruthState.astro");
  assert.doesNotMatch(truthState, /animation/);
  const css = read("src/styles/global.css");
  assert.doesNotMatch(
    css,
    /pulse/,
    "no pulse keyframes or classes may exist for evidence surfaces",
  );
});
