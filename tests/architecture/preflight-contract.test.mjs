import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  isProtected,
  PROTECTED_PATHS,
} from "../../scripts/check-merge-policy.mjs";

/**
 * WP-09 (DEC-034 R1/R8): preflight contract guards.
 *
 * R1: the pre-commit hook must run all 7 gates with `set -eu` and must
 * not swallow failures with `|| true` or `; true`.
 * R8: PROTECTED_PATHS must still include the key paths.
 *
 * Every check is a pure function over text. Fixtures prove the guard
 * fails when the invariant is broken (negative proof).
 */

const HOOK_PATH = new URL("../../.githooks/pre-commit", import.meta.url);
const REQUIRED_GATES = [
  "pnpm test:architecture",
  "pnpm typecheck",
  "pnpm lint",
  "pnpm format:check",
  "pnpm build",
  "pnpm check:client-budget",
  "pnpm check:static-links",
];

/** Pure function: check a hook text against the contract. Returns issues. */
function checkHookContract(hookText) {
  const issues = [];
  if (!hookText.includes("set -eu")) {
    issues.push("missing set -eu");
  }
  for (const gate of REQUIRED_GATES) {
    if (!hookText.includes(gate)) {
      issues.push(`missing gate: ${gate}`);
    }
  }
  if (hookText.includes("|| true")) {
    issues.push("contains || true (swallows failures)");
  }
  if (hookText.includes("; true")) {
    issues.push("contains ; true (swallows failures)");
  }
  return issues;
}

test("R1: pre-commit hook has set -eu and all 7 gates", () => {
  const hook = readFileSync(HOOK_PATH, "utf8");
  const issues = checkHookContract(hook);
  assert.deepEqual(
    issues,
    [],
    `hook contract violations: ${issues.join("; ")}`,
  );
});

test("R1 negative proof: hook with one gate removed fails", () => {
  const hook = readFileSync(HOOK_PATH, "utf8");
  const broken = hook.replace("pnpm typecheck\n", "");
  const issues = checkHookContract(broken);
  assert.ok(
    issues.some((i) => i.includes("pnpm typecheck")),
    "removing a gate must be detected",
  );
});

test("R1 negative proof: hook with || true fails", () => {
  const hook = readFileSync(HOOK_PATH, "utf8");
  const broken = hook.replace("pnpm build", "pnpm build || true");
  const issues = checkHookContract(broken);
  assert.ok(
    issues.some((i) => i.includes("|| true")),
    "|| true must be detected",
  );
});

const R8_REQUIRED = [
  "AGENTS.md",
  ".claude/",
  "scripts/",
  ".github/",
  ".githooks/",
  "tests/architecture/",
];

/** Pure function: the required entries a protected-path list is missing. */
function missingRequired(list, required) {
  return required.filter((entry) => !list.includes(entry));
}

test("R8: PROTECTED_PATHS still includes key paths", () => {
  assert.deepEqual(missingRequired(PROTECTED_PATHS, R8_REQUIRED), []);
  for (const path of R8_REQUIRED) {
    assert.equal(isProtected(path), true, `${path} must be protected`);
  }
});

test("R8 negative proof: a list with scripts/ removed is caught", () => {
  const broken = PROTECTED_PATHS.filter((entry) => entry !== "scripts/");
  assert.deepEqual(missingRequired(broken, R8_REQUIRED), ["scripts/"]);
});
