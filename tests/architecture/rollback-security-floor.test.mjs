/**
 * Rollback security-floor contract.
 *
 * A provider rollback target is not "known good" merely because it once
 * served successfully. The target must map to an exact Git revision that
 * remains eligible after material security/financial authority revocations.
 */
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  PAYMENT_RUNTIME_ROOTS,
  SECURITY_FLOORS,
  paymentMarkersIn,
  qualifyRollbackCandidate,
} from "../../scripts/check-rollback-candidate.mjs";

const ROOT = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const SCRIPT = "scripts/check-rollback-candidate.mjs";
const PRE_D0 = "462aa460243d9dd07976306c962db0a26d49328a";

function git(...args) {
  return execFileSync("git", args, {
    cwd: ROOT,
    encoding: "utf8",
  }).trim();
}

function currentMainRef() {
  for (const ref of ["origin/main", "main"]) {
    try {
      git("rev-parse", "--verify", ref);
      return ref;
    } catch {
      // Try the next local full-history ref.
    }
  }
  throw new Error("main ref is unavailable");
}

function run(candidate) {
  return spawnSync(
    process.execPath,
    [SCRIPT, "--candidate", candidate, "--main", currentMainRef()],
    {
      cwd: ROOT,
      encoding: "utf8",
    },
  );
}

test("D-0 VietQR removal is an explicit rollback security floor", () => {
  assert.deepEqual(
    SECURITY_FLOORS.map(({ id, revision }) => ({ id, revision })),
    [
      {
        id: "D0_NO_MARKETING_PAYMENT_AUTHORITY",
        revision: "3342d912bf03217979d9325aeff3fe2043b62758",
      },
    ],
  );
});

test("rollback payment scan covers both application and direct public runtime roots", () => {
  assert.deepEqual(PAYMENT_RUNTIME_ROOTS, ["src", "public"]);
});

test("current main is eligible for the bounded rollback source checks", () => {
  const mainRef = currentMainRef();
  const sha = git("rev-parse", mainRef);
  const result = qualifyRollbackCandidate({
    candidate: sha,
    mainRef,
    cwd: ROOT,
  });

  assert.equal(result.eligible, true, JSON.stringify(result.failures));
  assert.deepEqual(result.failures, []);
});

test("negative proof: a pre-D0 revision is rollback-ineligible", () => {
  const result = qualifyRollbackCandidate({
    candidate: PRE_D0,
    mainRef: currentMainRef(),
    cwd: ROOT,
  });

  assert.equal(result.eligible, false);
  assert.ok(
    result.failures.some((failure) => failure.id === "PREDATES_SECURITY_FLOOR"),
  );
});

test("CLI fails closed for a pre-D0 rollback target", () => {
  const result = run(PRE_D0);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /PREDATES_SECURITY_FLOOR/);
  assert.match(result.stderr, /Rollback candidate: INELIGIBLE/);
});

test("CLI requires an exact full Git revision", () => {
  const result = run("3342d91");
  assert.equal(result.status, 1);
  assert.match(result.stderr, /EXACT_SHA_REQUIRED/);
});

test("payment markers include the historical VietQR/NAPAS payload class", () => {
  const historicalPayload =
    'const payload = "0010A000000727012400069704220110" + "0208QRIBFTTA";';
  assert.ok(paymentMarkersIn(historicalPayload).length >= 2);
  assert.ok(paymentMarkersIn('import x from "./vietqr.ts";').length > 0);
  assert.deepEqual(paymentMarkersIn("ordinary product profile"), []);
});

test("security-floor commits are themselves present in repository history", () => {
  for (const floor of SECURITY_FLOORS) {
    assert.doesNotThrow(() =>
      git("cat-file", "-e", `${floor.revision}^{commit}`),
    );
  }
});
