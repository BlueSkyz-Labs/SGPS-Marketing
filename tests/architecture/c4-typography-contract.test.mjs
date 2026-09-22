import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const C4 = "src/styles/c4-quiet-authority.css";
const css = readFileSync(C4, "utf8");

/** C4-A S2 optical typography roles. */
const TYPE_ROLES = [
  "--c4-type-display",
  "--c4-type-section",
  "--c4-type-product",
  "--c4-type-evidence",
  "--c4-type-reading",
  "--c4-type-meta",
  "--c4-type-caption",
];

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const declarations = (role) =>
  css
    .split("\n")
    .filter((l) => new RegExp(`^\\s*${escapeRe(role)}\\s*:`).test(l)).length;

test("C4 typography: no second font family", () => {
  assert.doesNotMatch(
    css,
    /font-family\s*:/i,
    "C4 must not declare a font family",
  );
});

test("C4 typography: every type role declared exactly once", () => {
  for (const role of TYPE_ROLES) {
    assert.equal(
      declarations(role),
      1,
      `${role} must be declared exactly once`,
    );
  }
});

test("C4 typography: headline roles are fluid, not one-off fixed steps", () => {
  for (const role of [
    "--c4-type-display",
    "--c4-type-section",
    "--c4-type-product",
  ]) {
    const line =
      css
        .split("\n")
        .find((l) => new RegExp(`^\\s*${escapeRe(role)}\\s*:`).test(l)) ?? "";
    assert.match(line, /clamp\(/, `${role} must use a fluid clamp range`);
  }
});

test("C4 typography: long-form reading measure stays bounded", () => {
  const m = css.match(/--c4-reading-measure\s*:\s*(\d+(?:\.\d+)?)ch/);
  assert.ok(m, "--c4-reading-measure must be declared in ch");
  const ch = Number.parseFloat(m[1]);
  assert.ok(
    ch > 0 && ch <= 75,
    `reading measure must stay within 75ch (got ${ch}ch)`,
  );
});
