import assert from "node:assert/strict";
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";

test("static link checker script exists and is wired", () => {
  assert.equal(existsSync("scripts/check-static-links.mjs"), true);
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  assert.equal(
    pkg.scripts["check:static-links"],
    "node scripts/check-static-links.mjs",
  );
  const hook = readFileSync(".githooks/pre-commit", "utf8");
  assert.match(hook, /check:static-links/);
});


test("negative proof: executable navigation fails the built-output checker", () => {
  const root = mkdtempSync(join(tmpdir(), "static-links-negative-"));
  try {
    mkdirSync(join(root, "dist"), { recursive: true });
    writeFileSync(
      join(root, "dist", "index.html"),
      '<!doctype html><a href="javascript:alert(1)">unsafe</a>',
      "utf8",
    );
    const script = resolve("scripts/check-static-links.mjs");
    const result = spawnSync(process.execPath, [script], {
      cwd: root,
      encoding: "utf8",
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /forbidden executable URL scheme/i);
    assert.match(result.stderr, /javascript:alert\(1\)/i);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test("negative proof: unsupported navigation schemes fail closed", () => {
  const root = mkdtempSync(join(tmpdir(), "static-links-scheme-"));
  try {
    mkdirSync(join(root, "dist"), { recursive: true });
    writeFileSync(
      join(root, "dist", "index.html"),
      '<!doctype html><a href="file:///etc/passwd">unsafe</a>',
      "utf8",
    );
    const script = resolve("scripts/check-static-links.mjs");
    const result = spawnSync(process.execPath, [script], {
      cwd: root,
      encoding: "utf8",
    });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /unsupported URL scheme/i);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
