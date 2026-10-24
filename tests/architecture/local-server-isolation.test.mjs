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
import { readFileSync } from "node:fs";
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
