import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  STATUS,
  evaluateDeployment,
  evaluateProviderDeployment,
  evaluatePromotionState,
  evaluatePublicTruth,
  evaluateSource,
} from "../../scripts/check-promotion-state.mjs";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const read = (relative) =>
  readFileSync(new URL(`../../${relative}`, import.meta.url), "utf8");
const scripts = JSON.parse(read("package.json")).scripts;
const workflow = read(".github/workflows/quality-gates.yml");

test("real repository yields no FAIL in any assurance stage", () => {
  const state = evaluatePromotionState({ root: ROOT });

  assert.equal(state.stages.length, 4);
  for (const stage of state.stages) {
    assert.notEqual(
      stage.status,
      STATUS.FAIL,
      `${stage.stage}: ${JSON.stringify(stage.findings)}`,
    );
  }
  assert.equal(state.exitCode, 0);
});

test("source/deploy-contract pass while provider deployment stays NOT_VERIFIED", () => {
  const state = evaluatePromotionState({ root: ROOT });
  const byName = Object.fromEntries(
    state.stages.map((stage) => [stage.stage, stage]),
  );

  assert.equal(byName.source.status, STATUS.PASS);
  assert.equal(byName["deployment-contract"].status, STATUS.PASS);
  assert.equal(byName["provider-deployment"].status, STATUS.NOT_VERIFIED);
  // Owner facts are not committed yet, so public truth is honestly blocked.
  assert.notEqual(byName["public-truth"].status, STATUS.FAIL);
  assert.notEqual(byName["provider-deployment"].status, STATUS.PASS);
});

test("offline checker cannot certify authoritative Cloudflare provider deployment", () => {
  const result = evaluateProviderDeployment();

  assert.equal(result.status, STATUS.NOT_VERIFIED);
  assert.notEqual(result.status, STATUS.PASS);
  assert.equal(result.findings.length, 1);
  assert.match(result.findings[0].subject, /Cloudflare Workers Builds/);
  assert.match(result.findings[0].detail, /not read back/i);
});

test("a synthetic source stage with a missing script yields FAIL", () => {
  const incomplete = { ...scripts };
  delete incomplete.lint;

  const result = evaluateSource({ scripts: incomplete, workflow });

  assert.equal(result.status, STATUS.FAIL);
  assert.ok(
    result.findings.some(
      (item) => item.status === STATUS.FAIL && item.subject.includes("lint"),
    ),
  );
});

test("a synthetic workflow that skips a gate yields FAIL", () => {
  const result = evaluateSource({
    scripts,
    workflow: workflow.replace(/^\s*run: pnpm typecheck$/m, ""),
  });

  assert.equal(result.status, STATUS.FAIL);
  assert.ok(result.findings.some((item) => item.subject.includes("typecheck")));
});

test("a missing owner fact yields BLOCKED_OWNER_FACT, not PASS", () => {
  const siteSource = [
    "export const SITE = {",
    "  contactEmail: import.meta.env?.PUBLIC_CONTACT_EMAIL?.trim() || null,",
    "  securityEmail: import.meta.env?.PUBLIC_SECURITY_EMAIL?.trim() || null,",
    "} as const;",
  ].join("\n");

  const result = evaluatePublicTruth({
    siteSource,
    truthScriptPresent: true,
  });

  assert.equal(result.status, STATUS.BLOCKED_OWNER_FACT);
  assert.notEqual(result.status, STATUS.FAIL);
  assert.notEqual(result.status, STATUS.PASS);
  assert.equal(result.findings.length, 2);
  assert.ok(
    result.findings.every((item) => item.status === STATUS.BLOCKED_OWNER_FACT),
  );
});

test("a fabricated owner fact fails the public-truth stage", () => {
  const siteSource = [
    '  contactEmail: "hello@example.com",',
    '  securityEmail: "security@blueskyzlabs.com",',
  ].join("\n");

  const result = evaluatePublicTruth({
    siteSource,
    truthScriptPresent: true,
  });

  assert.equal(result.status, STATUS.FAIL);
  assert.ok(result.findings.some((item) => item.subject.includes("contact")));
});

test("committed owner facts pass the public-truth stage", () => {
  const siteSource = [
    '  contactEmail: "owner@blueskyzlabs.com",',
    '  securityEmail: "security@blueskyzlabs.com",',
  ].join("\n");

  const result = evaluatePublicTruth({
    siteSource,
    truthScriptPresent: true,
  });

  assert.equal(result.status, STATUS.PASS);
  assert.deepEqual(result.findings, []);
});

test("a deploy script that gates public truth after build yields FAIL", () => {
  const reversed = [
    'run("pnpm", ["build"]);',
    'run("pnpm", ["validate:public-truth"]);',
  ].join("\n");

  const result = evaluateDeployment({ deployScript: reversed });

  assert.equal(result.status, STATUS.FAIL);
  assert.ok(result.findings.some((item) => item.subject.includes("deploy")));

  const ungated = 'run("pnpm", ["wrangler", "deploy"]);';
  assert.equal(
    evaluateDeployment({ deployScript: ungated }).status,
    STATUS.FAIL,
  );
});

test("plaintext secret material in the deploy script yields FAIL", () => {
  const leaky = [
    'const apiToken = "abcdef1234567890";',
    'run("pnpm", ["validate:public-truth"]);',
    'run("pnpm", ["build"]);',
  ].join("\n");

  const result = evaluateDeployment({ deployScript: leaky });

  assert.equal(result.status, STATUS.FAIL);
  assert.ok(result.findings.some((item) => item.detail.includes("secret")));
});

test("CLI exits 0 and prints the per-stage summary", () => {
  const output = execFileSync(
    process.execPath,
    ["scripts/check-promotion-state.mjs"],
    { cwd: ROOT, encoding: "utf8" },
  );

  assert.match(output, /source\s+PASS/);
  assert.match(output, /deployment-contract\s+PASS/);
  assert.match(output, /provider-deployment\s+NOT_VERIFIED/);
  assert.doesNotMatch(output, /^deployment\s+PASS$/m);
  assert.match(output, /Promotion assurance: offline checks non-failing/);
  assert.match(output, /BLOCKED_OWNER_FACT/);
  assert.match(output, /NOT_VERIFIED/);
  assert.match(
    output,
    /Authoritative Cloudflare provider deployment\/runtime is never implied/,
  );
});

test("promotion-state script performs no network access", () => {
  const source = read("scripts/check-promotion-state.mjs");
  const primitives = [
    "fetch(",
    "node:http",
    "node:https",
    "node:net",
    "node:dns",
    "node:tls",
    "undici",
    "axios",
    "XMLHttpRequest",
  ];

  for (const primitive of primitives) {
    assert.equal(
      source.includes(primitive),
      false,
      `unexpected network primitive: ${primitive}`,
    );
  }
  assert.match(source, /from "node:fs"/);
});
