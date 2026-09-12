/**
 * H10 — operations contract.
 * The rollback/smoke/observability document is required by the approved S+
 * plans; these assertions keep it present, keep QA_STRATEGY pointing at it,
 * and keep its claims true against the smoke script it describes.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const DOC = "docs/operations/production-smoke-and-rollback.md";
const QA = "docs/QA_STRATEGY.md";
const SMOKE = "scripts/smoke-production.mjs";

test("the operations contract exists and QA_STRATEGY points at it", () => {
  assert.ok(existsSync(DOC), "operations contract document is missing");
  const qa = readFileSync(QA, "utf8");
  assert.match(
    qa,
    /docs\/operations\/production-smoke-and-rollback\.md/,
    "QA_STRATEGY must link the operations contract",
  );
});

test("rollback and fix-forward are both documented", () => {
  const doc = readFileSync(DOC, "utf8");
  assert.match(doc, /rollback/i);
  assert.match(doc, /fix-forward/i);
  assert.match(doc, /Workers Builds/, "deployment authority must be named");
  assert.match(
    doc,
    /check:deployment-evidence/,
    "ledger validation must be named",
  );
  assert.match(
    doc,
    /never roll back without/i,
    "verification rule must be explicit",
  );
});

test("the smoke claims in the document match the smoke script", () => {
  const doc = readFileSync(DOC, "utf8");
  const smoke = readFileSync(SMOKE, "utf8");
  for (const needle of [
    "/.well-known/security.txt",
    "/.well-known/sgps.json",
    "SMOKE_COMMIT_SHA",
  ]) {
    assert.ok(doc.includes(needle), `doc must mention ${needle}`);
    assert.ok(smoke.includes(needle), `smoke script must implement ${needle}`);
  }
  assert.match(
    doc,
    /branded 404/i,
    "the 404 fallback check must be documented",
  );
  assert.match(smoke, /404/, "the smoke script must check the 404 fallback");
});

test("the header spot-check list mirrors the contract test", () => {
  const doc = readFileSync(DOC, "utf8");
  for (const header of [
    "X-Content-Type-Options",
    "X-Frame-Options",
    "Referrer-Policy",
    "Permissions-Policy",
    "HSTS",
  ]) {
    assert.ok(doc.includes(header), `doc must list ${header}`);
  }
  const security = readFileSync(
    "tests/architecture/security-surface.test.mjs",
    "utf8",
  );
  assert.match(security, /X-Content-Type-Options/);
});
