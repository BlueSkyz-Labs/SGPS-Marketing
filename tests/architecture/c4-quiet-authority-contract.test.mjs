import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const C4 = "src/styles/c4-quiet-authority.css";
const GLOBAL = "src/styles/global.css";

/** C4-A semantic roles: each must have exactly one declaration source. */
const ROLES = [
  "--c4-reading-measure",
  "--c4-display-measure",
  "--c4-material-ink",
  "--c4-material-paper",
  "--c4-hairline",
  "--c4-folio-gap",
  "--c4-motion-scarcity-duration",
  "--c4-motion-scarcity-ease",
];

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

test("C4 quiet authority: exactly one stylesheet", () => {
  assert.ok(existsSync(C4), `${C4} must exist`);
  assert.ok(existsSync(GLOBAL), `${GLOBAL} must exist`);
});

test("C4 quiet authority: global.css imports the C4 stylesheet once", () => {
  const g = readFileSync(GLOBAL, "utf8");
  const hits = g.match(/@import\s+"@\/styles\/c4-quiet-authority\.css"/g) ?? [];
  assert.equal(hits.length, 1, "C4 stylesheet must be imported exactly once");
});

test("C4 quiet authority: each semantic role declared exactly once", () => {
  const css = readFileSync(C4, "utf8");
  const lines = css.split("\n");
  for (const role of ROLES) {
    const re = new RegExp(`^\\s*${escapeRe(role)}\\s*:`);
    const n = lines.filter((l) => re.test(l)).length;
    assert.equal(n, 1, `${role} must be declared exactly once (got ${n})`);
  }
});

test("C4 quiet authority: roles alias existing tokens, never re-author brand truth", () => {
  const css = readFileSync(C4, "utf8");
  const block = css.match(/:root\s*\{([\s\S]*?)\}/);
  assert.ok(block, "C4 role layer must declare a :root block");
  for (const role of ROLES) {
    const re = new RegExp(`^\\s*${escapeRe(role)}\\s*:\\s*(.+?);`, "m");
    const m = block[1].match(re);
    assert.ok(m, `${role} must have a value`);
    const value = m[1].trim();
    const aliasesToken = /var\(\s*--(?!c4-)/.test(value);
    const isMeasure = /^\d+(\.\d+)?(ch|rem)$/.test(value);
    assert.ok(
      aliasesToken || isMeasure,
      `${role} must alias a non-C4 token or be a measured length (got: ${value})`,
    );
  }
});

test("C4 quiet authority: no hard-coded decorative gold palette", () => {
  const css = readFileSync(C4, "utf8");
  assert.doesNotMatch(
    css,
    /#(d4af37|c9a227|ffd700|b8860b|e5c07b)/i,
    "no decorative gold hex",
  );
  assert.doesNotMatch(css, /\bgold\b/i, "no gold keyword");
});

test("C4 quiet authority: no duplicated keyframes", () => {
  const css = readFileSync(C4, "utf8");
  const names = [...css.matchAll(/@keyframes\s+([\w-]+)/g)].map((m) => m[1]);
  assert.equal(
    new Set(names).size,
    names.length,
    "keyframe names must be unique",
  );
});

test("C4 quiet authority: no runtime animation framework", () => {
  const css = readFileSync(C4, "utf8");
  assert.doesNotMatch(css, /framer-motion|motion\/react|\bgsap\b|animejs/i);
});
