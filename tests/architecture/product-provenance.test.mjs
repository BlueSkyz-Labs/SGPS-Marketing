/**
 * T3 — product provenance guard contract.
 */
import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const SCRIPT = "scripts/check-product-provenance.mjs";

function run(root) {
  return spawnSync("node", [SCRIPT, "--root", root, "--repo", ROOT], {
    cwd: ROOT,
    encoding: "utf8",
  });
}

function fixture(revision) {
  const dir = mkdtempSync(join(tmpdir(), "product-provenance-"));
  mkdirSync(join(dir, "src/content/products"), { recursive: true });
  writeFileSync(
    join(dir, "src/content/products/example.yaml"),
    `slug: example\nname: Example\nsourceRevision: ${revision}\n`,
  );
  return dir;
}

test("the real registry is idle and says so honestly", () => {
  const result = run(ROOT);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Product provenance: IDLE/);
});

test("a resolvable, reachable revision passes", () => {
  const head = execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: ROOT,
    encoding: "utf8",
  }).trim();
  const dir = fixture(head);
  const result = run(dir);
  rmSync(dir, { recursive: true, force: true });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Product provenance: PASS \(1 entries\)/);
});

test("a SHA-shaped but unresolvable revision fails", () => {
  const dir = fixture("0123456789abcdef0123456789abcdef01234567");
  const result = run(dir);
  rmSync(dir, { recursive: true, force: true });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /FAIL .*example\.yaml/);
  assert.match(result.stderr, /Product provenance: FAIL/);
});

test("a product with no sourceRevision fails", () => {
  const dir = mkdtempSync(join(tmpdir(), "product-provenance-"));
  mkdirSync(join(dir, "src/content/products"), { recursive: true });
  writeFileSync(
    join(dir, "src/content/products/bare.yaml"),
    "slug: bare\nname: Bare\n",
  );
  const result = run(dir);
  rmSync(dir, { recursive: true, force: true });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /no sourceRevision/);
});
