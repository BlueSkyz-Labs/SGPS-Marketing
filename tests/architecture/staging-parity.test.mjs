import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

/**
 * WP-13 (DEC-043): staging parity guard.
 *
 * wrangler.toml is the single source for Workers Builds config.
 * Preview vs production environment separation is dashboard-managed
 * (Cloudflare Workers Builds); the repo cannot verify dashboard state.
 *
 * This guard asserts:
 * 1. compatibility_date is present and a valid ISO date (the parity anchor).
 * 2. No [env.preview] / [env.production] overrides exist that could
 *    silently diverge (if they appear, the guard forces explicit review).
 *
 * Negative proof: a fixture with a mismatched/missing date fails.
 */

const WRANGLER_PATH = new URL("../../wrangler.toml", import.meta.url);

function checkParity(tomlText) {
  const issues = [];
  const dateMatch = /^compatibility_date\s*=\s*"(\d{4}-\d{2}-\d{2})"/m.exec(
    tomlText,
  );
  if (!dateMatch) {
    issues.push("compatibility_date missing or not ISO date");
  }
  // If env-specific overrides appear, they must be reviewed explicitly.
  if (/^\[env\./m.test(tomlText)) {
    issues.push("[env.*] overrides present: review preview/production parity");
  }
  return { issues, date: dateMatch?.[1] ?? null };
}

test("compatibility_date is present and valid", () => {
  const toml = readFileSync(WRANGLER_PATH, "utf8");
  const { issues, date } = checkParity(toml);
  assert.deepEqual(issues, [], `parity issues: ${issues.join("; ")}`);
  assert.ok(date, "compatibility_date must be set");
});

test("negative proof: fixture with missing date fails", () => {
  const fixture = `name = "test"\nworkers_dev = false\n`;
  const { issues } = checkParity(fixture);
  assert.ok(
    issues.some((i) => i.includes("compatibility_date")),
    "missing date must be detected",
  );
});

test("negative proof: fixture with env overrides is flagged", () => {
  const fixture = `name = "test"\ncompatibility_date = "2026-09-04"\n[env.preview]\nvars = {}\n`;
  const { issues } = checkParity(fixture);
  assert.ok(
    issues.some((i) => i.includes("[env.*]")),
    "env overrides must be flagged for review",
  );
});
