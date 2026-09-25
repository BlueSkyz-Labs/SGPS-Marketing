import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const ROOT = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const WORKFLOW = readFileSync(
  resolve(ROOT, ".github/workflows/quality-gates.yml"),
  "utf8",
);

function postMergeStep(source) {
  const start = source.indexOf("- name: Post-merge landing verification (fail-closed)");
  const end = source.indexOf("\n  browser-assurance:", start);
  assert.notEqual(start, -1, "post-merge verification step must exist");
  assert.notEqual(end, -1, "post-merge verification step must end before browser-assurance");
  return source.slice(start, end);
}

test("post-merge workflow is wired to the closed PR event", () => {
  assert.match(WORKFLOW, /types:\s*\[[^\]]*\bclosed\b[^\]]*\]/);
  assert.match(
    postMergeStep(WORKFLOW),
    /github\.event\.pull_request\.merged\s*==\s*true/,
  );
});

test("missing merge SHA fails the mandatory post-merge gate", () => {
  const step = postMergeStep(WORKFLOW);
  assert.match(step, /POST_MERGE_MERGE_COMMIT/);
  assert.match(
    step,
    /else[\s\S]*missing evidence cannot be treated as SKIPPED\/PASS[\s\S]*exit 1/,
  );
});

test("post-merge guard receives the event merge SHA and target ref", () => {
  const step = postMergeStep(WORKFLOW);
  assert.match(
    step,
    /POST_MERGE_MERGE_COMMIT:\s*\$\{\{ github\.event\.pull_request\.merge_commit_sha \|\| '' \}\}/,
  );
  assert.match(step, /--merge-commit "\$\{POST_MERGE_MERGE_COMMIT:-\}"/);
  assert.match(step, /--ref origin\/main/);
});
