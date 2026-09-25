/**
 * T3 — product provenance guard contract.
 *
 * The guard must reject the defect class that shipped once: a `repositoryUrl` pointing at a
 * repository that does not exist, a `sourceRevision` that is really a commit of THIS repository,
 * and identity art claimed as a product screenshot. It must also stay fail-closed for missing or
 * malformed provenance and report an empty registry as IDLE rather than as a pass.
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
/** A real revision of the Sotro product repository — a foreign revision, not one of ours. */
const FOREIGN_REVISION = "b226e491517f34d49286b117e2d2634f7d47e763";
const HEAD = execFileSync("git", ["rev-parse", "HEAD"], {
  cwd: ROOT,
  encoding: "utf8",
}).trim();

function run(root) {
  return spawnSync("node", [SCRIPT, "--root", root, "--repo", ROOT], {
    cwd: ROOT,
    encoding: "utf8",
  });
}

function withFixture(lines, assertion) {
  const dir = mkdtempSync(join(tmpdir(), "product-provenance-"));
  mkdirSync(join(dir, "src/content/products"), { recursive: true });
  writeFileSync(
    join(dir, "src/content/products/sotro.yaml"),
    `${lines.join("\n")}\n`,
  );
  try {
    assertion(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

function record(overrides = {}) {
  const {
    slug = "sotro",
    repositoryUrl = "https://github.com/BlueSkyz-Labs/Sotro",
    revision = FOREIGN_REVISION,
    media = ["media:", "  src: /products/sotro/brand.png"],
    extra = [],
  } = overrides;
  const lines = [`slug: ${slug}`, "name: Example", "proof:"];
  if (repositoryUrl !== null) lines.push(`  repositoryUrl: ${repositoryUrl}`);
  if (revision !== null) lines.push(`sourceRevision: ${revision}`);
  if (media) lines.push(...media);
  lines.push(...extra);
  return lines;
}

test("the real registry satisfies provenance honestly", () => {
  const result = run(ROOT);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Product provenance: PASS \(5 entries\)/);
});

test("an empty registry reports IDLE instead of passing by accident", () => {
  const dir = mkdtempSync(join(tmpdir(), "product-provenance-"));
  try {
    const result = run(dir);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Product provenance: IDLE/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("a well-formed record citing an allow-listed repository passes", () => {
  withFixture(record(), (dir) => {
    const result = run(dir);
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /Product provenance: PASS \(1 entries\)/);
  });
});

test("a repositoryUrl outside the allow-list fails closed", () => {
  withFixture(
    record({ repositoryUrl: "https://github.com/BlueSkyz-Labs/PRJ-SoTro" }),
    (dir) => {
      const result = run(dir);
      assert.equal(result.status, 1);
      assert.match(
        result.stderr,
        /is not https:\/\/github\.com\/BlueSkyz-Labs\/Sotro/,
      );
    },
  );
});

test("a repositoryUrl on a foreign organisation fails closed", () => {
  withFixture(
    record({ repositoryUrl: "https://github.com/example/Sotro" }),
    (dir) => {
      const result = run(dir);
      assert.equal(result.status, 1);
      assert.match(
        result.stderr,
        /is not https:\/\/github\.com\/BlueSkyz-Labs\/Sotro/,
      );
    },
  );
});

test("a product that is not allow-listed fails closed", () => {
  withFixture(
    record({
      slug: "sotro",
      repositoryUrl: "https://github.com/BlueSkyz-Labs/Other",
    }),
    (dir) => {
      const result = run(dir);
      assert.equal(result.status, 1);
      assert.match(result.stderr, /FAIL .*sotro\.yaml/);
    },
  );
});

test("a sourceRevision that is a commit of THIS repository fails closed", () => {
  withFixture(record({ revision: HEAD }), (dir) => {
    const result = run(dir);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /is a commit of THIS repository/);
  });
});

test("a missing sourceRevision fails closed", () => {
  withFixture(record({ revision: null }), (dir) => {
    const result = run(dir);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /no sourceRevision/);
  });
});

test("a revision that is not 40-hex fails closed", () => {
  withFixture(record({ revision: "0123456" }), (dir) => {
    const result = run(dir);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /is not a 40-hex revision/);
  });
});

test("a missing repositoryUrl fails closed", () => {
  withFixture(record({ repositoryUrl: null }), (dir) => {
    const result = run(dir);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /no proof\.repositoryUrl/);
  });
});

test("identity art claimed as a bare screenshot fails closed", () => {
  withFixture(
    record({
      media: ["screenshot:", "  src: /products/sotro/screenshot.png"],
    }),
    (dir) => {
      const result = run(dir);
      assert.equal(result.status, 1);
      assert.match(result.stderr, /bare screenshot claim/);
    },
  );
});
