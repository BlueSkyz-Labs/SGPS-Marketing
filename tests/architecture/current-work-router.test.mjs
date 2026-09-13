/**
 * T1 — canonical current-work router contract.
 * The router must stay honest: every referenced evidence file exists, every
 * status comes from a bounded set, in-progress work never claims MERGED, and
 * human/external items can never be promoted by automation.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const ROUTER = "docs/current-work.json";
const router = JSON.parse(readFileSync(ROUTER, "utf8"));

const WAVE_STATUSES = new Set([
  "PLANNED",
  "IN_PROGRESS",
  "MERGED",
  "BLOCKED",
  "BLOCKED_SAFETY",
  "EXTERNAL_MANUAL",
]);

test("router declares its schema and authorities that exist", () => {
  assert.equal(router.schemaVersion, "1.0");
  assert.match(router.updatedAt, /^\d{4}-\d{2}-\d{2}$/);
  for (const [key, path] of Object.entries(router.authorities)) {
    assert.ok(existsSync(path), `authority ${key} missing on disk: ${path}`);
  }
});

test("every wave uses a bounded status and real evidence", () => {
  assert.ok(Array.isArray(router.waves) && router.waves.length > 0);
  const ids = new Set();
  for (const wave of router.waves) {
    assert.ok(!ids.has(wave.id), `duplicate wave id ${wave.id}`);
    ids.add(wave.id);
    assert.ok(
      WAVE_STATUSES.has(wave.status),
      `wave ${wave.id} has an unknown status ${wave.status}`,
    );
    assert.ok(
      existsSync(wave.evidence) || wave.status === "IN_PROGRESS",
      `wave ${wave.id} evidence missing on disk: ${wave.evidence}`,
    );
  }
});

test("at most one wave is in progress; merged waves have evidence", () => {
  const inProgress = router.waves.filter(
    (wave) => wave.status === "IN_PROGRESS",
  );
  assert.ok(inProgress.length <= 1, "WIP control: one active wave at a time");
  for (const wave of router.waves) {
    if (wave.status === "MERGED") {
      assert.ok(
        existsSync(wave.evidence),
        `merged wave ${wave.id} must carry existing evidence`,
      );
    }
  }
});

test("open owner decisions are well-formed and never auto-resolved", () => {
  assert.ok(Array.isArray(router.openOwnerDecisions));
  for (const decision of router.openOwnerDecisions) {
    assert.ok(decision.id && decision.question, "decision needs id + question");
    assert.ok(Array.isArray(decision.blocks), "decision needs a blocks array");
  }
});

test("human/external items are never promoted by automation", () => {
  const residual = router.residualExternal.join(" ");
  // Allowed states: NOT RUN (initial) or OWNER SELF-TESTS (explicit owner
  // directive, still non-blocker). Anything claiming agent-run completion fails.
  assert.match(
    residual,
    /Human E4: (real participants: NOT RUN|OWNER SELF-TESTS)/,
  );
  assert.doesNotMatch(residual, /Human E4.*(COMPLETE|PASSED|VERIFIED)/);
  const e4Protocol = "docs/evidence/2026-09-12-v3-human-e4.md";
  assert.ok(existsSync(e4Protocol), "the E4 protocol must be present");
  const protocol = readFileSync(e4Protocol, "utf8");
  assert.match(
    protocol,
    /\*\*Status: NOT RUN\.\*\*/,
    "automation must not promote the E4 status",
  );
});

test("the router carries no secrets or personal data", () => {
  const raw = readFileSync(ROUTER, "utf8");
  assert.doesNotMatch(raw, /@[a-z0-9.-]+\.[a-z]{2,}/i, "no email addresses");
  assert.doesNotMatch(raw, /\b[0-9a-f]{40}\b/, "no raw commit SHAs in prose");
});
