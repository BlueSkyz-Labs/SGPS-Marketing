import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import {
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import {
  CANONICAL_HOST,
  resolveDefaultLedger,
  validateLedger,
} from "../../scripts/validate-deployment-evidence.mjs";

const ROOT = fileURLToPath(new URL("../../", import.meta.url));
const CLI = "scripts/validate-deployment-evidence.mjs";
const read = (relative) =>
  readFileSync(new URL(`../../${relative}`, import.meta.url), "utf8");

const DEPLOYED_SHA = "64285ac0123456789abcdef0123456789abcdef0";
const OTHER_SHA = "89e037a886a9d02e2e100b892ade45ff7db193c5";
const HEAD = `**Deployed head:** \`${DEPLOYED_SHA}\` (main)`;
const SMOKE = [
  "Smoke command: `node scripts/smoke-production.mjs`",
  "**ALL PRODUCTION SMOKE CHECKS PASS**.",
];
const READ_BACK = [
  `## Read-back results (live, https://${CANONICAL_HOST})`,
  "- EN home `/en/` 200",
];

function ledgerText({ head = HEAD, smoke = SMOKE, readBack = READ_BACK } = {}) {
  return ["# Read-back", head, "", ...smoke, "", ...readBack].join("\n");
}

function runCli(args) {
  try {
    const stdout = execFileSync(process.execPath, [CLI, ...args], {
      cwd: ROOT,
      encoding: "utf8",
    });
    return { status: 0, stdout };
  } catch (error) {
    return {
      status: error.status,
      stdout: String(error.stdout ?? ""),
      stderr: String(error.stderr ?? ""),
    };
  }
}

test("the newest historical ledger resolves as the default baseline", () => {
  const ledger = resolveDefaultLedger(ROOT);
  assert.ok(ledger, "a post-merge ledger must exist");
  const text = readFileSync(ledger, "utf8");
  const { sha, violations } = validateLedger(text);

  assert.deepEqual(violations, []);
  assert.match(sha, /^[0-9a-f]{7,40}$/);

  const dir = dirname(ledger);
  const newest = readdirSync(dir)
    .filter((name) => /post-merge/i.test(name) && name.endsWith(".md"))
    .sort()
    .at(-1);
  assert.equal(basename(ledger), newest);
  assert.ok(text.includes(sha), "declared revision must appear in the ledger");
});

test("baseline CLI never promotes historical evidence to deployment PASS", () => {
  const result = runCli([]);

  assert.equal(result.status, 0);
  assert.match(result.stdout, /Deployment evidence baseline: VALID/);
  assert.match(result.stdout, /current revision NOT_VERIFIED/);
  assert.doesNotMatch(result.stdout, /Deployment evidence: PASS/);
});

test("exact certification passes only when full ledger and expected SHA match", () => {
  const dir = mkdtempSync(join(tmpdir(), "deployment-evidence-"));
  const file = join(dir, "synthetic-post-merge.md");

  try {
    writeFileSync(file, ledgerText(), "utf8");
    const result = runCli([file, "--expected-sha", DEPLOYED_SHA]);

    assert.equal(result.status, 0, result.stdout + result.stderr);
    assert.ok(
      result.stdout.includes(`Deployment evidence: PASS (${DEPLOYED_SHA})`),
      result.stdout,
    );
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("negative proof: structurally valid stale ledger cannot certify a newer revision", () => {
  const { violations } = validateLedger(ledgerText(), {
    expectedSha: OTHER_SHA,
  });

  assert.ok(
    violations.some(
      (item) =>
        item.subject === "deployed-sha-binding" &&
        item.detail.includes("does not match expected revision"),
    ),
  );
});

test("negative proof: abbreviated ledger SHA cannot certify an exact revision", () => {
  const { violations } = validateLedger(
    ledgerText({ head: "**Deployed head:** `64285ac` (main)" }),
    { expectedSha: DEPLOYED_SHA },
  );

  assert.ok(
    violations.some(
      (item) =>
        item.subject === "deployed-sha-binding" &&
        item.detail.includes("abbreviated"),
    ),
  );
});

test("a synthetic ledger without a deployed revision fails", () => {
  const { violations } = validateLedger(
    ledgerText({ head: "**Deployed head:** unknown (see provider)" }),
  );

  assert.equal(violations.length, 1);
  assert.equal(violations[0].subject, "deployed-sha");
  assert.match(violations[0].fix, /Deployed head/);
});

test("a synthetic ledger without a smoke PASS fails", () => {
  const absent = validateLedger(ledgerText({ smoke: [] }));
  assert.equal(absent.violations[0].subject, "smoke-result");

  const failed = validateLedger(
    ledgerText({
      smoke: [
        "Smoke command: `node scripts/smoke-production.mjs`",
        "**PRODUCTION SMOKE CHECKS FAIL**",
      ],
    }),
  );
  assert.equal(failed.violations[0].subject, "smoke-result");
  assert.match(failed.violations[0].detail, /FAIL/);
});

test("a ledger whose read-back omits the production host fails", () => {
  const { violations } = validateLedger(
    ledgerText({ readBack: ["## Read-back results", "- EN home 200"] }),
  );

  assert.equal(violations.length, 1);
  assert.equal(violations[0].subject, "read-back-host");
});

test("exact certification rejects malformed expected revision", () => {
  const result = runCli(["--expected-sha", "64285ac"]);

  assert.equal(result.status, 1);
  assert.match(result.stdout, /expected-sha must be a full 40-character/);
});

test("CLI exits 1 with one FAIL line per structural violation", () => {
  const dir = mkdtempSync(join(tmpdir(), "deployment-evidence-"));
  const file = join(dir, "synthetic-post-merge.md");

  try {
    writeFileSync(
      file,
      ledgerText({
        head: "**Deployed head:** unknown (see provider)",
        smoke: [],
        readBack: ["## Read-back results", "- EN home 200"],
      }),
      "utf8",
    );

    const result = runCli([file]);

    assert.equal(result.status, 1);
    assert.match(result.stdout, /FAIL deployed-sha — .*\(fix: .*\)/);
    assert.match(result.stdout, /FAIL smoke-result — .*\(fix: .*\)/);
    assert.match(result.stdout, /FAIL read-back-host — .*\(fix: .*\)/);
    assert.match(result.stdout, /3 deployment evidence violation\(s\)/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("CLI output is deterministic and performs no network access", () => {
  const first = runCli([]);
  const second = runCli([]);
  assert.equal(first.stdout, second.stdout);

  const source = read(CLI);
  for (const primitive of [
    "fetch(",
    "node:http",
    "node:https",
    "node:net",
    "node:dns",
    "node:tls",
    "undici",
    "axios",
    "XMLHttpRequest",
  ]) {
    assert.equal(
      source.includes(primitive),
      false,
      `unexpected network primitive: ${primitive}`,
    );
  }
  assert.match(source, /from "node:fs"/);
});
