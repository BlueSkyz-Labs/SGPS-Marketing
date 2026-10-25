/**
 * LSN-marketing-002 guard (recurrence 2026-10-21): Playwright must start its
 * own preview server and never reuse one already on the port, which may
 * belong to another worktree and serve a different build.
 *
 * LSN-marketing-005 guard: Playwright must stop the preview with SIGTERM.
 * Without gracefulShutdown it SIGKILLs the runner's process group, and the
 * `astro preview` daemon (its own group) keeps port 3000 after the run.
 */
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import test from "node:test";

const CONFIG = readFileSync("playwright.config.ts", "utf8");

function auditServerReuse(config) {
  const block = config.match(/webServer:\s*\{([\s\S]*?)\n\s*\}/)?.[1] ?? "";
  if (block === "") return ["playwright.config.ts has no webServer block"];
  const value = block.match(/reuseExistingServer:\s*([^,\n]+)/)?.[1]?.trim();
  return value === "false"
    ? []
    : [
        `webServer.reuseExistingServer must be false, found ${value ?? "unset"}`,
      ];
}

test("Playwright never reuses an existing server on the port", () => {
  assert.deepEqual(auditServerReuse(CONFIG), []);
});

test("negative proof: local reuse is caught", () => {
  for (const variant of ["!process.env.CI", "true"]) {
    const mutated = CONFIG.replace(
      "reuseExistingServer: false",
      `reuseExistingServer: ${variant}`,
    );
    assert.notEqual(mutated, CONFIG, variant);
    assert.equal(auditServerReuse(mutated).length, 1, variant);
  }
  const unset = CONFIG.replace(/\n\s*reuseExistingServer: false,/, "");
  assert.notEqual(unset, CONFIG);
  assert.equal(auditServerReuse(unset).length, 1);
});

function auditShutdown(config) {
  const block = config.match(/webServer:\s*\{([\s\S]*?)\n\s*\}/)?.[1] ?? "";
  const signal = block.match(
    /gracefulShutdown:\s*\{\s*signal:\s*"([A-Z]+)"/,
  )?.[1];
  return signal === "SIGTERM"
    ? []
    : [
        `webServer.gracefulShutdown must send SIGTERM, found ${signal ?? "unset"}`,
      ];
}

test("Playwright stops the preview server with SIGTERM", () => {
  assert.deepEqual(auditShutdown(CONFIG), []);
});

test("negative proof: a missing or hard-kill shutdown is caught", () => {
  const kill = CONFIG.replace('signal: "SIGTERM"', 'signal: "SIGKILL"');
  assert.notEqual(kill, CONFIG);
  assert.equal(auditShutdown(kill).length, 1);
  const unset = CONFIG.replace(/\n\s*gracefulShutdown: \{[^\n]*\},/, "");
  assert.notEqual(unset, CONFIG);
  assert.equal(auditShutdown(unset).length, 1);
});

/**
 * LSN-marketing-002 recurrence (2026-10-24): a loopback PLAYWRIGHT_BASE_URL
 * skips the webServer, so global-setup itself must still refuse a non-local
 * lane. Behavioural: run the real module (or a mutant) with the env set.
 */
const SETUP_PATH = resolve("tests/e2e/global-setup.mjs");
const SETUP_SRC = readFileSync(SETUP_PATH, "utf8");

async function runSetup(source, baseURL) {
  const dir = mkdtempSync(join(tmpdir(), "gsetup-"));
  const file = join(dir, "global-setup.mjs");
  const stampUrl = pathToFileURL(resolve("tests/e2e/build-stamp.mjs")).href;
  writeFileSync(file, source.replace('"./build-stamp.mjs"', `"${stampUrl}"`));
  const mod = await import(pathToFileURL(file).href);
  const saved = { ...process.env };
  delete process.env.CI;
  process.env.PLAYWRIGHT_BASE_URL = baseURL;
  try {
    await mod.default();
    return null;
  } catch (error) {
    return error.message;
  } finally {
    process.env = saved;
  }
}

test("global-setup refuses a remote PLAYWRIGHT_BASE_URL", async () => {
  const msg = await runSetup(SETUP_SRC, "https://blueskyzlabs.com");
  assert.match(msg ?? "", /remote base URL is not a local evidence lane/);
});

test("global-setup runs the stamp check when PLAYWRIGHT_BASE_URL is loopback", () => {
  assert.doesNotMatch(
    SETUP_SRC,
    /if\s*\(\s*process\.env\.PLAYWRIGHT_BASE_URL[^)]*\)\s*return/,
  );
  assert.match(SETUP_SRC, /checkStamp\(stamped, head\)/);
  assert.match(SETUP_SRC, /checkLaneURL/);
});

test("negative proof: a global-setup that returns early on PLAYWRIGHT_BASE_URL is caught", async () => {
  const mutant = SETUP_SRC.replace(
    "if (process.env.CI) return;",
    "if (process.env.CI || process.env.PLAYWRIGHT_BASE_URL) return;",
  );
  assert.notEqual(mutant, SETUP_SRC);
  const msg = await runSetup(mutant, "https://blueskyzlabs.com");
  // The mutant lets a remote lane through (no refusal), which the real
  // module's test above would reject; assert the detector sees the difference.
  assert.equal(msg, null);
  assert.match(mutant, /process\.env\.PLAYWRIGHT_BASE_URL\) return/);
});
