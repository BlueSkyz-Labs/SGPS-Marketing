import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const readIfPresent = (path) =>
  existsSync(path) ? readFileSync(path, "utf8") : "";

test("pnpm supply-chain policy is explicit and fail closed", () => {
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  const workspace = readIfPresent("pnpm-workspace.yaml");
  const npmrc = readIfPresent(".npmrc");

  assert.equal(
    pkg.packageManager,
    "pnpm@11.25.0+sha512.5cde925b4f075f725eb71fbae18a42ffe784524789f19b61c731cb8721ec28aaee160e01a8d5af4fedb2a42cdbf300efe23db356b0d4a17b4d63e11f8ab7c956",
  );
  assert.equal(pkg.engines?.pnpm, ">=11.25.0 <12");

  assert.match(workspace, /minimumReleaseAge:\s*1440/);
  assert.match(workspace, /minimumReleaseAgeStrict:\s*true/);
  assert.match(workspace, /minimumReleaseAgeIgnoreMissingTime:\s*false/);
  assert.match(workspace, /blockExoticSubdeps:\s*true/);
  assert.match(workspace, /strictDepBuilds:\s*true/);
  assert.match(workspace, /allowBuilds:\s*(?:\{\}|\n)/);
  assert.doesNotMatch(workspace, /dangerouslyAllowAllBuilds/);

  assert.doesNotMatch(
    npmrc,
    /minimum-release-age|minimumReleaseAge|dangerouslyAllowAllBuilds|ignore-scripts|ignoreScripts/,
  );
});

test("GitHub source assurance is pinned and least privilege", () => {
  const workflow = readIfPresent(".github/workflows/quality-gates.yml");

  assert.match(workflow, /^name:\s*Source Assurance/m);
  assert.match(workflow, /permissions:\s*\n\s+contents:\s*read/);
  assert.match(workflow, /name:\s*Quality Gates/);
  assert.match(workflow, /name:\s*Browser Assurance/);
  assert.match(workflow, /run:\s*pnpm audit --audit-level=moderate/);

  const runnerLabels = [...workflow.matchAll(/runs-on:\s*([^\s#]+)/g)].map(
    ([, label]) => label,
  );
  assert.deepEqual(
    runnerLabels,
    // Quality Gates, Browser shard (matrix), Lighthouse CI, Browser Assurance.
    ["ubuntu-24.04", "ubuntu-24.04", "ubuntu-24.04", "ubuntu-24.04"],
    "source-assurance jobs must pin an explicit Ubuntu major/minor runner label instead of mutable ubuntu-latest",
  );
  assert.doesNotMatch(workflow, /runs-on:\s*ubuntu-latest/);

  const actionRefs = [...workflow.matchAll(/uses:\s*[^@\s]+@([^\s#]+)/g)].map(
    ([, ref]) => ref,
  );
  assert.ok(
    actionRefs.length >= 2,
    "expected pinned checkout/setup-node actions",
  );
  for (const ref of actionRefs) {
    assert.match(
      ref,
      /^[0-9a-f]{40}$/,
      `action ref must be a full SHA: ${ref}`,
    );
  }

  const exactHeadRefs = [
    ...workflow.matchAll(
      /ref:\s*\$\{\{\s*github\.event\.pull_request\.head\.sha\s*\|\|\s*github\.sha\s*\}\}/g,
    ),
  ];
  assert.equal(
    exactHeadRefs.length,
    3,
    "every job that checks out code (Quality Gates, the browser shards, Lighthouse) must use the exact PR head or push SHA",
  );
  assert.equal(
    [...workflow.matchAll(/persist-credentials:\s*false/g)].length,
    3,
    "source-assurance checkout must not persist GitHub credentials",
  );

  // Browser assurance is sharded per engine. Each shard must build, install
  // its own runtime and then run the repository Playwright matrix slice; the
  // shard list itself is locked to E2E_PROJECTS by browser-assurance-matrix.
  const browserJob = (workflow.split("\n  browser-shards:")[1] ?? "").split(
    "\n  lighthouse:",
  )[0];
  const buildIndex = browserJob.indexOf("run: pnpm build");
  const installIndex = browserJob.indexOf(
    'pnpm exec playwright install --with-deps "$SHARD_BROWSER"',
  );
  const playwrightIndex = browserJob.indexOf("run: pnpm test:e2e");
  assert.ok(
    buildIndex >= 0,
    "browser assurance must build the static artifact",
  );
  assert.ok(
    installIndex > buildIndex,
    "each browser shard must install its Playwright runtime after the build",
  );
  assert.ok(
    playwrightIndex > installIndex,
    "browser assurance must enforce the repository cross-browser Playwright matrix",
  );
  assert.doesNotMatch(
    browserJob,
    /run:\s*pnpm exec playwright test --project=chromium\s*$/m,
    "protected Browser Assurance must not silently narrow the E4 matrix to Chromium-only",
  );

  assert.doesNotMatch(workflow, /secrets\./);
  assert.doesNotMatch(workflow, /CLOUDFLARE|wrangler|deploy:workers/);
  assert.doesNotMatch(workflow, /permissions:\s*write-all|contents:\s*write/);
});

test("base merge-policy precedes candidate package-manager execution (#376)", () => {
  const workflow = readIfPresent(".github/workflows/quality-gates.yml");
  // Scope to the Quality Gates job: later jobs (browser shards, Lighthouse)
  // legitimately install their own runtimes after Quality Gates passes.
  const job = (workflow.split("\n  quality-gates:")[1] ?? "").split(
    /\n  [a-z-]+:/,
  )[0];
  assert.ok(job.length > 0, "quality-gates job must exist");

  const policyIndex = job.indexOf("name: Merge policy");
  assert.ok(policyIndex >= 0, "merge-policy step must exist");

  const activations = [
    "corepack enable",
    "pnpm --version",
    "pnpm install --frozen-lockfile",
  ];
  for (const activation of activations) {
    const at = job.indexOf(activation);
    assert.ok(at >= 0, `${activation} must exist in the Quality Gates job`);
    assert.ok(
      policyIndex < at,
      `merge-policy must precede ${activation} (#376 trust ordering)`,
    );
  }
});

test("negative proof: package-manager activation before policy fails the guard", () => {
  const reordered = [
    "  quality-gates:",
    "      - name: Activate project package manager",
    "        run: |",
    "          corepack enable",
    "      - name: Merge policy",
  ].join("\n");
  const policyIndex = reordered.indexOf("name: Merge policy");
  const activationIndex = reordered.indexOf("corepack enable");
  assert.equal(
    policyIndex < activationIndex,
    false,
    "pre-policy package-manager execution must be rejected",
  );
});
