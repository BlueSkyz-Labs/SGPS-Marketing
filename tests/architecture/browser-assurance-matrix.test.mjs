/**
 * Browser Assurance sharding guard.
 *
 * Browser Assurance runs as parallel per-engine shards plus one aggregator
 * that keeps the required check name. Sharding may only change wall-clock
 * time: the shard list must equal the repository E2E matrix, the aggregator
 * must fail closed, and Lighthouse must stay behind the same required check.
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import test from "node:test";
import { E2E_PROJECTS, selectProjects } from "../../scripts/run-e2e.mjs";

const WORKFLOW = readFileSync(".github/workflows/quality-gates.yml", "utf8");
const PLAYWRIGHT_CONFIG = readFileSync("playwright.config.ts", "utf8");

const PLAYWRIGHT_IMAGE =
  "mcr.microsoft.com/playwright:v1.63.0-noble@sha256:eff16c30e6f3f4af0a03fa4b706120d5e9b0891c344a27d64559aff5900a4a27";
const PLAYWRIGHT_DOWNLOAD_HOST_VARS = [
  "PLAYWRIGHT_DOWNLOAD_HOST",
  "PLAYWRIGHT_CHROMIUM_DOWNLOAD_HOST",
  "PLAYWRIGHT_FIREFOX_DOWNLOAD_HOST",
  "PLAYWRIGHT_WEBKIT_DOWNLOAD_HOST",
];

// The text of one top-level job, from its key to the next job key.
function jobBlock(workflow, id) {
  const start = workflow.indexOf(`\n  ${id}:\n`);
  if (start === -1) return "";
  const rest = workflow.slice(start + 1);
  const next = rest.slice(1).search(/\n {2}[a-z][a-z0-9-]*:\n/);
  return next === -1 ? rest : rest.slice(0, next + 1);
}

// Every way the sharded Browser Assurance stops being equivalent to the
// unsharded E2E matrix.
function auditBrowserAssurance(workflow) {
  const problems = [];
  const shards = jobBlock(workflow, "browser-shards");
  const lighthouse = jobBlock(workflow, "lighthouse");
  const aggregator = jobBlock(workflow, "browser-assurance");

  const shardProjects = [...shards.matchAll(/-\s*project:\s*([\w-]+)/g)].map(
    ([, project]) => project,
  );
  for (const project of E2E_PROJECTS) {
    if (!shardProjects.includes(project)) {
      problems.push(`no shard runs the ${project} project`);
    }
  }
  for (const project of shardProjects) {
    if (!E2E_PROJECTS.includes(project)) {
      problems.push(`shard ${project} is not in E2E_PROJECTS`);
    }
  }
  if (new Set(shardProjects).size !== shardProjects.length) {
    problems.push("a project appears in more than one shard");
  }
  for (const project of E2E_PROJECTS) {
    if (!PLAYWRIGHT_CONFIG.includes(`name: "${project}"`)) {
      problems.push(`playwright.config.ts has no ${project} project`);
    }
  }
  if (!/E2E_PROJECT:\s*\$\{\{\s*matrix\.project\s*\}\}/.test(shards)) {
    problems.push("shards must pass matrix.project as E2E_PROJECT");
  }
  if (!/run:\s*pnpm test:e2e\s*$/m.test(shards)) {
    problems.push("shards must run pnpm test:e2e");
  }

  if (!shards.includes(`image: ${PLAYWRIGHT_IMAGE}`)) {
    problems.push(
      "browser shards must use the approved digest-pinned Playwright image",
    );
  }
  if (!shards.includes("options: --user 1001")) {
    problems.push("browser shards must not run the Playwright image as root");
  }
  if (!shards.includes("PLAYWRIGHT_BROWSERS_PATH: /ms-playwright")) {
    problems.push(
      "browser shards must use the browsers bundled in the pinned image",
    );
  }
  if (/playwright\s+install(?:\s|$)/m.test(shards)) {
    problems.push(
      "browser shards must not download Playwright browsers at runtime",
    );
  }
  for (const variable of PLAYWRIGHT_DOWNLOAD_HOST_VARS) {
    if (workflow.includes(variable)) {
      problems.push(`workflow must not set ${variable}`);
    }
  }
  if (!shards.includes("Verify digest-pinned Playwright runtime")) {
    problems.push(
      "browser shards must launch-test the bundled runtime before E2E",
    );
  }
  // Every shard runs on every event (pull_request and push). No per-event or
  // per-entry gating may skip an engine, and no step may be conditional.
  if (/pr_lane|RUN_SHARD|github\.event_name\s*[!=]=/.test(shards)) {
    problems.push(
      "shards must not gate any engine on the event or a lane flag",
    );
  }
  if (/^\s*if:/m.test(shards)) {
    problems.push(
      "shard steps must not be conditional: every engine runs on every event",
    );
  }

  if (!/run:\s*pnpm lighthouse\s*$/m.test(lighthouse)) {
    problems.push("the lighthouse job must run pnpm lighthouse");
  }

  if (!/^\s+name:\s*Browser Assurance\s*$/m.test(aggregator)) {
    problems.push("the aggregator must be named Browser Assurance");
  }
  const claimants = [
    ...workflow.matchAll(/^\s+name:\s*Browser Assurance\s*$/gm),
  ];
  if (claimants.length !== 1) {
    problems.push(
      `exactly one job may be named Browser Assurance, found ${claimants.length}`,
    );
  }
  const needs = aggregator.match(/needs:\s*\[([^\]]*)\]/)?.[1] ?? "";
  for (const job of ["browser-shards", "lighthouse"]) {
    if (!needs.split(",").some((entry) => entry.trim() === job)) {
      problems.push(`the aggregator must need ${job}`);
    }
  }
  if (!/if:\s*\$\{\{\s*always\(\)\s*\}\}/.test(aggregator)) {
    problems.push(
      "the aggregator must run with always() so it can fail closed",
    );
  }
  if (!aggregator.includes('select(.result != "success")')) {
    problems.push("the aggregator must reject every non-success result");
  }
  return problems;
}

test("Browser Assurance shards cover exactly the repository E2E matrix", () => {
  assert.deepEqual(auditBrowserAssurance(WORKFLOW), []);
});

test("negative proof: narrowing the shard list is caught", () => {
  const mutated = WORKFLOW.replace(
    /\n {10}- project: webkit\n {12}browser: webkit/,
    "",
  );
  assert.notEqual(mutated, WORKFLOW, "mutation must change the workflow");
  assert.ok(
    auditBrowserAssurance(mutated).some((problem) =>
      problem.includes("webkit"),
    ),
  );
});

test("negative proof: unpinned Playwright runtime or download-host override is caught", () => {
  const tagOnly = WORKFLOW.replace(
    PLAYWRIGHT_IMAGE,
    "mcr.microsoft.com/playwright:v1.63.0-noble",
  );
  assert.notEqual(tagOnly, WORKFLOW);
  assert.ok(
    auditBrowserAssurance(tagOnly).some((problem) =>
      problem.includes("digest-pinned Playwright image"),
    ),
  );

  const redirected = WORKFLOW.replace(
    "      PLAYWRIGHT_BROWSERS_PATH: /ms-playwright",
    [
      "      PLAYWRIGHT_BROWSERS_PATH: /ms-playwright",
      "      PLAYWRIGHT_DOWNLOAD_HOST: https://evil.invalid",
    ].join("\n"),
  );
  assert.notEqual(redirected, WORKFLOW);
  assert.ok(
    auditBrowserAssurance(redirected).some((problem) =>
      problem.includes("PLAYWRIGHT_DOWNLOAD_HOST"),
    ),
  );

  const runtimeDownload = WORKFLOW.replace(
    "      - name: Verify digest-pinned Playwright runtime",
    [
      "      - name: Unapproved runtime download",
      "        run: pnpm exec playwright install chromium",
      "      - name: Verify digest-pinned Playwright runtime",
    ].join("\n"),
  );
  assert.notEqual(runtimeDownload, WORKFLOW);
  assert.ok(
    auditBrowserAssurance(runtimeDownload).some((problem) =>
      problem.includes("must not download Playwright browsers"),
    ),
  );
});

test("negative proof: a matrix that skips any engine on pull_request is caught", () => {
  const lane = WORKFLOW.replace(
    "            browser: chromium\n    steps:\n",
    "            browser: chromium\n    env:\n      RUN_SHARD: ${{ github.event_name != 'pull_request' || matrix.pr_lane }}\n    steps:\n",
  );
  assert.notEqual(lane, WORKFLOW);
  assert.ok(
    auditBrowserAssurance(lane).some((problem) =>
      problem.includes("must not gate any engine"),
    ),
  );
  for (const project of ["chromium", "firefox", "webkit", "mobile-chromium"]) {
    const flagged = WORKFLOW.replace(
      new RegExp(`(- project: ${project}\\n {12}browser: \\w+)`),
      "$1\n            pr_lane: false",
    );
    assert.notEqual(flagged, WORKFLOW, project);
    assert.ok(
      auditBrowserAssurance(flagged).some((problem) =>
        problem.includes("must not gate any engine"),
      ),
      `${project} lane flag must fail`,
    );
  }
  const skipped = WORKFLOW.replace(
    "      - name: Build browser test artifact\n",
    "      - name: Build browser test artifact\n        if: ${{ github.event_name != 'pull_request' }}\n",
  );
  assert.notEqual(skipped, WORKFLOW);
  assert.ok(
    auditBrowserAssurance(skipped).some((problem) =>
      problem.includes("must not be conditional"),
    ),
  );
});

test("negative proof: an aggregator that cannot fail closed is caught", () => {
  const withoutAlways = WORKFLOW.replace("    if: ${{ always() }}\n", "");
  assert.notEqual(withoutAlways, WORKFLOW);
  assert.ok(
    auditBrowserAssurance(withoutAlways).some((problem) =>
      problem.includes("always()"),
    ),
  );

  const withoutLighthouse = WORKFLOW.replace(
    "needs: [browser-shards, lighthouse]",
    "needs: [browser-shards]",
  );
  assert.notEqual(withoutLighthouse, WORKFLOW);
  assert.ok(
    auditBrowserAssurance(withoutLighthouse).some((problem) =>
      problem.includes("need lighthouse"),
    ),
  );

  const failureOnly = WORKFLOW.replace(
    'select(.result != "success")',
    'select(.result == "failure")',
  );
  assert.notEqual(failureOnly, WORKFLOW);
  assert.ok(
    auditBrowserAssurance(failureOnly).some((problem) =>
      problem.includes("non-success"),
    ),
  );
});

test("the E2E runner selects one project or the whole matrix", () => {
  assert.deepEqual(selectProjects(undefined), E2E_PROJECTS);
  assert.deepEqual(selectProjects(""), E2E_PROJECTS);
  assert.deepEqual(selectProjects("webkit"), ["webkit"]);
  assert.throws(() => selectProjects("edge-ua"), /not one of/);
  assert.throws(() => selectProjects("chromium,firefox"), /not one of/);
});

// The aggregator's own script, run with real needs payloads.
const jqAvailable = spawnSync("jq", ["--version"]).status === 0;

function aggregatorScript() {
  const block = jobBlock(WORKFLOW, "browser-assurance");
  const after = block.split("        run: |\n")[1] ?? "";
  return after
    .split("\n")
    .map((line) => line.replace(/^ {10}/, ""))
    .join("\n");
}

function runAggregator(results) {
  const needs = Object.fromEntries(
    Object.entries(results).map(([job, result]) => [job, { result }]),
  );
  return spawnSync("bash", ["-c", aggregatorScript()], {
    env: { PATH: process.env.PATH, NEEDS_JSON: JSON.stringify(needs) },
    encoding: "utf8",
  });
}

test(
  "aggregator step: passes only when every required job succeeded",
  { skip: jqAvailable ? false : "jq is not installed: NOT VERIFIED" },
  () => {
    assert.equal(
      runAggregator({ "browser-shards": "success", lighthouse: "success" })
        .status,
      0,
    );
    for (const bad of ["failure", "cancelled", "skipped"]) {
      const shardBad = runAggregator({
        "browser-shards": bad,
        lighthouse: "success",
      });
      assert.notEqual(shardBad.status, 0, `shards ${bad} must fail`);
      const lighthouseBad = runAggregator({
        "browser-shards": "success",
        lighthouse: bad,
      });
      assert.notEqual(lighthouseBad.status, 0, `lighthouse ${bad} must fail`);
    }
  },
);

test("run-e2e main-module guard is cross-platform (pathToFileURL, F-06)", () => {
  const src = readFileSync("scripts/run-e2e.mjs", "utf8");
  assert.match(src, /pathToFileURL\(process\.argv\[1\]\)\.href/);
  assert.doesNotMatch(src, /file:\/\/\$\{process\.argv\[1\]\}/);
  // negative proof: the legacy Windows-broken guard is rejected
  const legacy = "import.meta.url === `file://${process.argv[1]}`";
  assert.match(legacy, /file:\/\/\$\{process\.argv\[1\]\}/);
});
