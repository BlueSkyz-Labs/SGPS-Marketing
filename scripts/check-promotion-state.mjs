#!/usr/bin/env node
/**
 * Promotion assurance state - offline, deterministic, read-only.
 *
 * Models three independent assurance stages so a PASS in one stage can never
 * be read as a PASS in another (plan Task 4):
 *
 *   source       package.json scripts plus the CI Quality Gates workflow
 *                actually enforce the offline source gates.
 *   deployment   scripts/deploy-workers.mjs runs validate:public-truth
 *                before build and carries no plaintext secret material.
 *   public-truth scripts/validate-public-truth.mjs exists and
 *                src/data/site.ts holds no fabricated owner facts.
 *
 * Status vocabulary:
 *   PASS                every requirement of that stage holds.
 *   FAIL                a requirement is broken or a fact is fabricated.
 *   BLOCKED_OWNER_FACT  a required owner-supplied fact is absent. Never
 *                       FAIL (nothing is broken) and never PASS (nothing
 *                       is proven): the owner must supply the fact.
 *
 * Stage authority:
 *   source        repository source + .github/workflows/quality-gates.yml
 *   deployment    scripts/deploy-workers.mjs (the supported deploy path)
 *   public-truth  scripts/validate-public-truth.mjs + src/data/site.ts
 *
 * Two requirement shapes need a note:
 *   - `install` is satisfied by a frozen-lockfile install step in CI or by
 *     a package.json "install" script; this repository installs through
 *     `pnpm install --frozen-lockfile` in CI, not through a script.
 *   - `validate:public-truth` depends on owner-supplied facts, so it is
 *     required on a promotion path (the deploy script) rather than as a
 *     source-assurance CI step. The deploy ordering is asserted by the
 *     deployment stage below.
 *
 * Usage: node scripts/check-promotion-state.mjs [--root <path>]
 * Exit:  1 only when a stage reports FAIL; otherwise 0.
 */
import { existsSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const STATUS = {
  PASS: "PASS",
  FAIL: "FAIL",
  BLOCKED_OWNER_FACT: "BLOCKED_OWNER_FACT",
};

export const STAGES = ["source", "deployment", "public-truth"];

/** Offline source gates that CI must run on every candidate. */
export const CI_ENFORCED_SCRIPTS = [
  "test:architecture",
  "typecheck",
  "lint",
  "format:check",
  "build",
  "check:client-budget",
  "check:static-links",
  "check:publishability",
  "check:integrity-firewall",
];

/** Promotion-only gates: required in package.json and on a promotion path. */
export const PROMOTION_SCRIPTS = ["validate:public-truth"];

export const REQUIRED_SCRIPTS = [...CI_ENFORCED_SCRIPTS, ...PROMOTION_SCRIPTS];

export const CI_WORKFLOW = ".github/workflows/quality-gates.yml";
export const DEPLOY_SCRIPT = "scripts/deploy-workers.mjs";
export const TRUTH_SCRIPT = "scripts/validate-public-truth.mjs";
export const SITE_DATA = "src/data/site.ts";

const INSTALL_COMMAND = /pnpm install --frozen-lockfile/;
const TRUTH_INVOCATION = /\[\s*"validate:public-truth"\s*\]/;
const BUILD_INVOCATION = /\[\s*"build"\s*\]/;

/** Owner facts that must exist as verified owner input, never invented. */
const OWNER_FACTS = [
  { name: "contactEmail", env: "PUBLIC_CONTACT_EMAIL" },
  { name: "securityEmail", env: "PUBLIC_SECURITY_EMAIL" },
];

const FABRICATED_HOSTS = [
  "example.com",
  "example.org",
  "example.net",
  "example",
  "test.com",
  "localhost",
  "yourcompany.com",
  "acme.com",
];

const SECRET_PATTERNS = [
  {
    kind: "quoted api token or secret",
    pattern:
      /\b(?:api[_-]?token|api[_-]?key|access[_-]?key|secret|password)\s*[:=]\s*["'][^"']{8,}["']/i,
  },
  { kind: "bearer token", pattern: /\bBearer\s+[A-Za-z0-9._-]{20,}/ },
  { kind: "signed jwt", pattern: /\beyJ[A-Za-z0-9._-]{20,}/ },
];

function finding(status, stage, subject, detail, fix) {
  return { status, stage, subject, detail, fix };
}

function fail(stage, subject, detail, fix) {
  return finding(STATUS.FAIL, stage, subject, detail, fix);
}

function blockedOwnerFact(stage, subject, detail, fix) {
  return finding(STATUS.BLOCKED_OWNER_FACT, stage, subject, detail, fix);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** True when the workflow runs `pnpm <script>` as its own gate step. */
function invokesScript(workflow, name) {
  return new RegExp(`pnpm\\s+${escapeRegExp(name)}(?![\\w:-])`).test(workflow);
}

/** FAIL wins over BLOCKED_OWNER_FACT; PASS only when nothing is reported. */
export function stageResult(stage, findings) {
  const failed = findings.some((item) => item.status === STATUS.FAIL);
  const blocked = findings.some(
    (item) => item.status === STATUS.BLOCKED_OWNER_FACT,
  );
  let status = STATUS.PASS;
  if (failed) {
    status = STATUS.FAIL;
  } else if (blocked) {
    status = STATUS.BLOCKED_OWNER_FACT;
  }
  return { stage, status, findings };
}

export function evaluateSource({ scripts = {}, workflow = "" } = {}) {
  const findings = [];

  for (const name of REQUIRED_SCRIPTS) {
    const command = scripts[name];
    if (typeof command !== "string" || command.trim() === "") {
      findings.push(
        fail(
          "source",
          `package.json#scripts:${name}`,
          `required script "${name}" is missing`,
          `add "${name}" to package.json scripts`,
        ),
      );
    }
  }

  const installWired =
    INSTALL_COMMAND.test(workflow) || typeof scripts.install === "string";
  if (!installWired) {
    findings.push(
      fail(
        "source",
        "ci:install",
        "CI has no frozen-lockfile install step",
        "run `pnpm install --frozen-lockfile` in the Quality Gates job",
      ),
    );
  }

  for (const name of CI_ENFORCED_SCRIPTS) {
    if (!invokesScript(workflow, name)) {
      findings.push(
        fail(
          "source",
          `${CI_WORKFLOW}:${name}`,
          `CI does not run \`pnpm ${name}\``,
          `add a "pnpm ${name}" step to the Quality Gates job`,
        ),
      );
    }
  }

  return stageResult("source", findings);
}

export function evaluateDeployment({ deployScript = "" } = {}) {
  const findings = [];

  if (deployScript.trim() === "") {
    findings.push(
      fail(
        "deployment",
        DEPLOY_SCRIPT,
        "deploy script is missing or empty",
        "restore scripts/deploy-workers.mjs",
      ),
    );
    return stageResult("deployment", findings);
  }

  const truthIndex = deployScript.search(TRUTH_INVOCATION);
  const buildIndex = deployScript.search(BUILD_INVOCATION);

  if (truthIndex === -1) {
    findings.push(
      fail(
        "deployment",
        DEPLOY_SCRIPT,
        "validate:public-truth is not run before deploy",
        "run `pnpm validate:public-truth` before build in the deploy script",
      ),
    );
  } else if (buildIndex === -1) {
    findings.push(
      fail(
        "deployment",
        DEPLOY_SCRIPT,
        "no build step exists to order public-truth before",
        "run `pnpm build` after validate:public-truth in the deploy script",
      ),
    );
  } else if (truthIndex > buildIndex) {
    findings.push(
      fail(
        "deployment",
        DEPLOY_SCRIPT,
        "validate:public-truth runs after build",
        "move validate:public-truth ahead of build in the deploy script",
      ),
    );
  }

  for (const { kind, pattern } of SECRET_PATTERNS) {
    if (pattern.test(deployScript)) {
      findings.push(
        fail(
          "deployment",
          DEPLOY_SCRIPT,
          `plaintext secret material detected (${kind})`,
          "read the value from provider/CI secret storage instead",
        ),
      );
    }
  }

  return stageResult("deployment", findings);
}

/**
 * Reads the owner facts out of src/data/site.ts source text.
 * kind: "supplied" (committed owner value) | "fabricated" (placeholder) |
 *       "absent" (no committed value; the fact is empty).
 */
export function extractOwnerFacts(siteSource = "") {
  return OWNER_FACTS.map(({ name, env }) => {
    const line = siteSource
      .split(/\r?\n/)
      .find((candidate) => new RegExp(`\\b${name}\\s*:`).test(candidate));
    const literal = line?.match(/["']([^"']*@[^"']*)["']/);
    if (!literal) return { name, env, kind: "absent", value: null };

    const value = literal[1].trim();
    const host = value.split("@")[1] ?? "";
    const fabricated = FABRICATED_HOSTS.some(
      (candidate) => host === candidate || host.endsWith(`.${candidate}`),
    );
    return { name, env, kind: fabricated ? "fabricated" : "supplied", value };
  });
}

export function evaluatePublicTruth({
  siteSource = "",
  truthScriptPresent = false,
} = {}) {
  const findings = [];

  if (!truthScriptPresent) {
    findings.push(
      fail(
        "public-truth",
        TRUTH_SCRIPT,
        "public-truth validator script is missing",
        "restore scripts/validate-public-truth.mjs",
      ),
    );
  }

  let facts = [];
  if (siteSource.trim() === "") {
    findings.push(
      fail(
        "public-truth",
        SITE_DATA,
        "site data module is missing or empty",
        "restore src/data/site.ts",
      ),
    );
  } else {
    facts = extractOwnerFacts(siteSource);
  }

  for (const fact of facts) {
    const subject = `${SITE_DATA}#${fact.name}`;
    if (fact.kind === "fabricated") {
      findings.push(
        fail(
          "public-truth",
          subject,
          `fabricated owner fact "${fact.value}"`,
          "remove the placeholder; owner facts must be owner-supplied",
        ),
      );
    } else if (fact.kind === "absent") {
      findings.push(
        blockedOwnerFact(
          "public-truth",
          subject,
          `${fact.name} is empty; no verified owner fact exists`,
          `owner supplies ${fact.env} (committed value or provider var)`,
        ),
      );
    }
  }

  return stageResult("public-truth", findings);
}

function mergeFindings(result, extraFindings) {
  if (extraFindings.length === 0) return result;
  return stageResult(result.stage, [...result.findings, ...extraFindings]);
}

export function evaluatePromotionState({ root = process.cwd() } = {}) {
  const readText = (relative) => {
    const path = join(root, relative);
    return existsSync(path) ? readFileSync(path, "utf8") : null;
  };

  const packageFindings = [];
  let scripts = {};
  const packageText = readText("package.json");

  if (packageText === null) {
    packageFindings.push(
      fail(
        "source",
        "package.json",
        "package.json is missing",
        "restore package.json at the repository root",
      ),
    );
  } else {
    try {
      scripts = JSON.parse(packageText).scripts ?? {};
    } catch {
      packageFindings.push(
        fail(
          "source",
          "package.json",
          "package.json is not valid JSON",
          "repair package.json",
        ),
      );
    }
  }

  const workflow = readText(CI_WORKFLOW);
  if (workflow === null) {
    packageFindings.push(
      fail(
        "source",
        CI_WORKFLOW,
        "quality gates workflow is missing",
        "restore .github/workflows/quality-gates.yml",
      ),
    );
  }

  const source = mergeFindings(
    evaluateSource({ scripts, workflow: workflow ?? "" }),
    packageFindings,
  );

  const deployment = evaluateDeployment({
    deployScript: readText(DEPLOY_SCRIPT) ?? "",
  });

  const publicTruth = evaluatePublicTruth({
    siteSource: readText(SITE_DATA) ?? "",
    truthScriptPresent: readText(TRUTH_SCRIPT) !== null,
  });

  const stages = [source, deployment, publicTruth];
  const findings = stages.flatMap((stage) => stage.findings);
  const exitCode = findings.some((item) => item.status === STATUS.FAIL) ? 1 : 0;

  return { root, stages, findings, exitCode };
}

export function formatFinding(item) {
  const head = `${item.status} ${item.stage} ${item.subject}`;
  return `${head} — ${item.detail} (fix: ${item.fix})`;
}

export function formatSummary(state) {
  const counts = state.stages.reduce((total, stage) => {
    total[stage.status] = (total[stage.status] ?? 0) + 1;
    return total;
  }, {});
  const tally = [
    `${counts[STATUS.PASS] ?? 0} PASS`,
    `${counts[STATUS.BLOCKED_OWNER_FACT] ?? 0} BLOCKED_OWNER_FACT`,
    `${counts[STATUS.FAIL] ?? 0} FAIL`,
  ].join(", ");
  const verdict = state.exitCode === 0 ? "no FAIL" : "FAIL";
  const lines = [`Promotion assurance state — ${state.root}`];

  for (const stage of state.stages) {
    lines.push(`${stage.stage.padEnd(13)} ${stage.status}`);
  }
  lines.push(`Promotion assurance: ${verdict} — ${tally}`);

  return lines.join("\n");
}

function parseRoot(argv) {
  const index = argv.indexOf("--root");
  const value = index === -1 ? undefined : argv[index + 1];
  return value ? resolve(value) : process.cwd();
}

export function main(argv = process.argv.slice(2)) {
  const state = evaluatePromotionState({ root: parseRoot(argv) });

  for (const item of state.findings) {
    console.log(formatFinding(item));
  }
  console.log(formatSummary(state));

  process.exitCode = state.exitCode;
  return state.exitCode;
}

function isDirectInvocation() {
  const entry = process.argv[1];
  if (entry === undefined) return false;
  return resolve(entry) === fileURLToPath(import.meta.url);
}

if (isDirectInvocation()) {
  main();
}
