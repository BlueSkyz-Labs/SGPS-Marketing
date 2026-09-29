import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  APPROVAL_LABEL,
  evaluateMergePolicy,
  isProtected,
  packageJsonRisks,
} from "../../scripts/check-merge-policy.mjs";

test("ordinary source, test and content changes merge without the label", () => {
  const result = evaluateMergePolicy({
    changedFiles: [
      "src/components/layout/Footer.astro",
      "tests/e2e/accessibility.spec.ts",
      "docs/evidence/2026-09-29-note.md",
      "public/brand/blueskyz/v4/products/sotro.svg",
    ],
    labels: [],
  });
  assert.deepEqual(result, { ok: true, approved: false, protectedFiles: [] });
});

test("negative proof: a protected change without the label is blocked", () => {
  const result = evaluateMergePolicy({
    changedFiles: [
      "src/pages/en/index.astro",
      ".github/workflows/quality-gates.yml",
      "scripts/check-merge-policy.mjs",
    ],
    labels: ["documentation"],
  });
  assert.equal(result.ok, false);
  assert.deepEqual(result.protectedFiles, [
    ".github/workflows/quality-gates.yml",
    "scripts/check-merge-policy.mjs",
  ]);
});

test("the Owner label admits a protected change", () => {
  const result = evaluateMergePolicy({
    changedFiles: ["wrangler.toml"],
    labels: [APPROVAL_LABEL],
  });
  assert.equal(result.ok, true);
  assert.equal(result.approved, true);
});

test("prefix rules match whole path segments, not look-alike names", () => {
  assert.equal(isProtected(".github/CODEOWNERS"), true);
  assert.equal(isProtected("docs/decisions/0013-new.md"), true);
  assert.equal(
    isProtected("brand/blueskyz-production-v4/07_DESIGN_TOKENS/tokens.css"),
    true,
  );
  assert.equal(isProtected("public/_headers"), true);
  assert.equal(isProtected("src/package.json"), false);
  assert.equal(isProtected("docs/decisions-archive.md"), false);
  assert.equal(
    isProtected("public/brand/blueskyz/v4/tokens/tokens.css"),
    false,
  );
});

test("Quality Gates runs the policy from the base commit and reruns on label changes", () => {
  const workflow = readFileSync(".github/workflows/quality-gates.yml", "utf8");
  assert.match(
    workflow,
    /types: \[opened, synchronize, reopened, labeled, unlabeled, closed\]/,
  );
  assert.match(
    workflow,
    /git show "\$\{BASE_SHA\}:scripts\/check-merge-policy\.mjs"/,
  );
  assert.match(
    workflow,
    /PR_LABELS: \$\{\{ toJSON\(github\.event\.pull_request\.labels\.\*\.name\) \}\}/,
  );
  // Label names reach the script only through the environment, never
  // interpolated into shell source.
  assert.doesNotMatch(
    workflow,
    /run:[^\n]*github\.event\.pull_request\.labels/,
  );
});

const PKG = {
  scripts: { "test:architecture": "node --test tests/architecture/*.test.mjs" },
  dependencies: { astro: "^7.1.0", zero: "^0.4.2" },
  devDependencies: { eslint: "^10.2.0" },
};
const pkg = (patch) => JSON.stringify({ ...PKG, ...patch });

test("lockfile and routine dependency bumps flow without the label", () => {
  assert.equal(isProtected("pnpm-lock.yaml"), false);
  assert.equal(isProtected("package.json"), false);
  assert.deepEqual(
    packageJsonRisks(
      pkg({}),
      pkg({
        dependencies: { astro: "^7.3.1", zero: "^0.4.9" },
        devDependencies: { eslint: "^10.4.0" },
      }),
    ),
    [],
  );
});

test("negative proof: gate-weakening or supply-chain package.json changes are held", () => {
  assert.deepEqual(
    packageJsonRisks(
      pkg({}),
      pkg({
        scripts: { "test:architecture": "echo skipped" },
        dependencies: {
          astro: "^8.0.0",
          zero: "^0.5.0",
          "left-pad": "^1.3.0",
        },
        devDependencies: { eslint: "github:someone/eslint" },
      }),
    ),
    [
      "package.json dependencies: astro ^7.1.0 -> ^8.0.0",
      "package.json dependencies: new dependency left-pad",
      "package.json dependencies: zero ^0.4.2 -> ^0.5.0",
      "package.json devDependencies: eslint ^10.2.0 -> github:someone/eslint",
      "package.json scripts changed",
    ],
  );
  const held = evaluateMergePolicy({
    changedFiles: ["package.json", "pnpm-lock.yaml"],
    labels: [],
    packageJsonRisks: ["package.json scripts changed"],
  });
  assert.equal(held.ok, false);
  assert.deepEqual(packageJsonRisks(pkg({}), "{not json"), [
    "package.json is not valid JSON",
  ]);
});
