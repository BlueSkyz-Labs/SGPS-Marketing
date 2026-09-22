import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const C4 = "src/styles/c4-quiet-authority.css";
const css = readFileSync(C4, "utf8");

/** C4-A S3 — the four semantic materials. */
const MATERIALS = [
  "--c4-material-ink",
  "--c4-material-paper",
  "--c4-material-quiet-paper",
  "--c4-material-cobalt-accent",
];

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const walk = (dir, out = []) => {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(css|astro|ts|tsx)$/.test(entry)) out.push(full);
  }
  return out;
};

test("C4 materials: all four declared exactly once", () => {
  for (const role of MATERIALS) {
    const n = css
      .split("\n")
      .filter((l) => new RegExp(`^\\s*${escapeRe(role)}\\s*:`).test(l)).length;
    assert.equal(n, 1, `${role} must be declared exactly once (got ${n})`);
  }
});

test("C4 materials: no raw palette cluster", () => {
  assert.doesNotMatch(
    css,
    /#[0-9a-f]{3,8}\b/i,
    "C4 must not introduce raw hex colours",
  );
  assert.doesNotMatch(
    css,
    /\brgba?\(/i,
    "C4 must not introduce raw rgb()/rgba() colours",
  );
});

test("C4 materials: no universal glass / blur surface", () => {
  assert.doesNotMatch(
    css,
    /backdrop-filter/i,
    "no glassmorphism backdrop-filter",
  );
  assert.doesNotMatch(css, /blur\(/i, "no blur() surfaces");
});

test("C4 materials: shadow use stays restrained", () => {
  const shadows = (css.match(/box-shadow\s*:/g) ?? []).length;
  assert.ok(
    shadows <= 1,
    `at most one box-shadow declaration (got ${shadows})`,
  );
});

test("C4 materials: no route-local alternative material system", () => {
  const offenders = walk("src")
    .filter((f) => !f.endsWith("c4-quiet-authority.css"))
    .filter((f) => /--c4-material-/.test(readFileSync(f, "utf8")));
  assert.deepEqual(
    offenders,
    [],
    `material roles must live only in the C4 stylesheet`,
  );
});
