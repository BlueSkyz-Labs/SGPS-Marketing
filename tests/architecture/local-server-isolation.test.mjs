/**
 * LSN-marketing-002 guard (recurrence 2026-10-21): Playwright must start its
 * own preview server and never reuse one already on the port, which may
 * belong to another worktree and serve a different build.
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
