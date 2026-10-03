import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

/*
 * Dependency-audit exceptions stay narrow, justified and temporary.
 * pnpm-workspace.yaml (protected) lists the ignored advisories; the registry
 * in docs/security/audit-exceptions.json must explain every one, carry an
 * expiry, and name the guard that keeps the vulnerable code unreachable.
 */

const read = (path) => readFileSync(path, "utf8");
const REGISTRY = JSON.parse(read("docs/security/audit-exceptions.json"));

export function ignoredGhsas(workspaceYaml) {
  // Line-based on purpose: list items under auditConfig.ignoreGhsas until the
  // first line that is not a list item (a greedy regex once skipped items).
  const lines = workspaceYaml.split("\n");
  const start = lines.findIndex((line) => /^\s+ignoreGhsas:\s*$/.test(line));
  if (
    start === -1 ||
    !lines.slice(0, start).some((l) => /^auditConfig:/.test(l))
  ) {
    return [];
  }
  const ids = [];
  for (const line of lines.slice(start + 1)) {
    const item = line.match(/^\s+-\s+(\S+)\s*$/);
    if (!item) break;
    ids.push(item[1]);
  }
  return ids;
}

export function expired(entry, today) {
  return today > entry.expires;
}

export function remoteImagesConfigured(astroConfig) {
  return /\bremotePatterns\b|\bdomains\s*:/.test(astroConfig);
}

function sourceFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) out.push(...sourceFiles(full));
    else if (/\.(astro|ts|tsx|js|mjs|md|mdx)$/.test(name)) out.push(full);
  }
  return out;
}

test("every ignored advisory has a registry entry and vice versa", () => {
  const ignored = ignoredGhsas(read("pnpm-workspace.yaml")).sort();
  const registered = REGISTRY.exceptions.map((e) => e.ghsa).sort();
  assert.deepEqual(ignored, registered);
});

test("every exception is justified, guarded and not expired", () => {
  const today = new Date().toISOString().slice(0, 10);
  for (const entry of REGISTRY.exceptions) {
    for (const field of [
      "exposure",
      "exposureGuard",
      "expires",
      "removeWhen",
    ]) {
      assert.ok(entry[field], `${entry.ghsa}: ${field} missing`);
    }
    assert.ok(existsSync(entry.exposureGuard), `${entry.ghsa}: guard file`);
    assert.equal(
      expired(entry, today),
      false,
      `${entry.ghsa} expired on ${entry.expires}: re-assess, then remove or renew with the Owner`,
    );
  }
});

test("GHSA-ch52-4w7c-c8xp stays unreachable: no remote images, no astro:assets", () => {
  const config = ["astro.config.mjs", "astro.config.ts"]
    .filter(existsSync)
    .map(read)
    .join("\n");
  assert.equal(remoteImagesConfigured(config), false);
  for (const file of sourceFiles("src")) {
    assert.doesNotMatch(read(file), /from\s+["']astro:assets["']/, file);
  }
});

test("negative proofs: each guard detects its broken invariant", () => {
  assert.deepEqual(
    ignoredGhsas(
      "auditConfig:\n  ignoreGhsas:\n    - GHSA-aaaa-bbbb-cccc\n    - GHSA-dddd-eeee-ffff\n",
    ),
    ["GHSA-aaaa-bbbb-cccc", "GHSA-dddd-eeee-ffff"],
  );
  assert.equal(expired({ expires: "2026-01-01" }, "2026-01-02"), true);
  assert.equal(expired({ expires: "2026-01-02" }, "2026-01-02"), false);
  assert.equal(
    remoteImagesConfigured(
      "export default { image: { remotePatterns: [{ hostname: 'x' }] } }",
    ),
    true,
  );
  assert.equal(remoteImagesConfigured("image: { domains: ['x.com'] }"), true);
  assert.equal(remoteImagesConfigured("export default {}"), false);
});
