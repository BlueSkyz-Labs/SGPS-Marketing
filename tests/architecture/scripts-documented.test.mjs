/**
 * H5 — documentation drift guard.
 * A gate that exists but is undocumented is a gate nobody can rely on, and a
 * documented order that differs from the workflow order misleads reviewers.
 * This test keeps docs/QA_STRATEGY.md, package.json and the workflow in sync.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const QA = readFileSync("docs/QA_STRATEGY.md", "utf8");
const WORKFLOW = readFileSync(".github/workflows/quality-gates.yml", "utf8");

const ASSURANCE_PREFIX = /^(check|verify|validate):/;

/**
 * Deploy-time gates: they run in the promotion path (deploy:workers and the
 * Cloudflare Workers Builds command), not in the secretless source-assurance
 * workflow. Each exception needs a written reason — silence is not an excuse.
 */
const DEPLOY_TIME_GATES = new Map([
  [
    "validate:public-truth",
    "deploy-time gate; Quality Gates is secretless and runs on every PR",
  ],
]);

test("every assurance script in package.json is documented", () => {
  const assurance = Object.keys(pkg.scripts).filter((name) =>
    ASSURANCE_PREFIX.test(name),
  );
  assert.ok(
    assurance.length >= 8,
    `expected the assurance surface, found ${assurance.length}`,
  );
  const missing = assurance.filter((name) => !QA.includes(name));
  assert.deepEqual(
    missing,
    [],
    `document these scripts in docs/QA_STRATEGY.md: ${missing.join(", ")}`,
  );
});

test("every CI gate step is documented", () => {
  const steps = [...WORKFLOW.matchAll(/run: pnpm ([a-z0-9:-]+)/g)].map(
    (match) => match[1],
  );
  const gates = steps.filter(
    (name) => ASSURANCE_PREFIX.test(name) || name === "test:architecture",
  );
  assert.ok(gates.length >= 8, `expected CI gates, found ${gates.length}`);
  const missing = gates.filter((name) => !QA.includes(name));
  assert.deepEqual(
    missing,
    [],
    `document these CI gates in docs/QA_STRATEGY.md: ${missing.join(", ")}`,
  );
  // No gate may be described in the doc but missing from CI — unless it is a
  // declared deploy-time gate with a written reason.
  const extraneous = Object.keys(pkg.scripts)
    .filter((name) => ASSURANCE_PREFIX.test(name))
    .filter((name) => !steps.includes(name))
    .filter((name) => !DEPLOY_TIME_GATES.has(name));
  assert.deepEqual(
    extraneous,
    [],
    `wire these into Quality Gates or remove them: ${extraneous.join(", ")}`,
  );
});

test("the documented gate order matches the workflow order", () => {
  const steps = [...WORKFLOW.matchAll(/run: pnpm ([a-z0-9:-]+)/g)].map(
    (match) => match[1],
  );
  const gates = steps.filter((name) => ASSURANCE_PREFIX.test(name));
  const positions = gates.map((name) => QA.indexOf(name));
  for (let index = 1; index < positions.length; index += 1) {
    if (positions[index] === -1) continue; // covered by the test above
    assert.ok(
      positions[index] > positions[index - 1],
      `docs list ${gates[index]} before ${gates[index - 1]}, but CI runs ${gates[index - 1]} first`,
    );
  }
});

test("the deploy-order contract is described where the gates are", () => {
  assert.match(QA, /public-truth/i, "public truth gate must be documented");
  assert.match(
    QA,
    /BLOCKED_OWNER_FACT/,
    "owner-fact semantics must be explicit",
  );
});
