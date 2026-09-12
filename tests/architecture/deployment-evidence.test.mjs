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

const HEAD = "**Deployed head:** `64285ac` (main)";
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

test("the newest post-merge ledger resolves as the default and passes", () => {
  const ledger = resolveDefaultLedger(ROOT);
  assert.ok(ledger, "a post-merge ledger must exist");
  const text = readFileSync(ledger, "utf8");
  const { sha, violations } = validateLedger(text);

  assert.deepEqual(violations, []);
  assert.match(sha, /^[0-9a-f]{7,40}$/);
  // The resolved default must be the newest by name, not a pinned artifact.
  const dir = dirname(ledger);
  const newest = readdirSync(dir)
    .filter((name) => /post-merge/i.test(name) && name.endsWith(".md"))
    .sort()
    .at(-1);
  assert.equal(basename(ledger), newest);
  // The ledger's declared revision must appear in its own text.
  assert.ok(text.includes(sha), "declared revision must appear in the ledger");
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

test("CLI exits 0 and prints the observed revision for the real ledger", () => {
  const result = runCli([]);
  const ledger = resolveDefaultLedger(ROOT);
  const { sha } = validateLedger(readFileSync(ledger, "utf8"));

  assert.equal(result.status, 0);
  assert.ok(
    result.stdout.includes(`Deployment evidence: PASS (${sha})`),
    `expected the CLI to print the observed revision ${sha}`,
  );
});

test("CLI exits 1 with one FAIL line per violation", () => {
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
