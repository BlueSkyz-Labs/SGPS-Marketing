import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

/**
 * C4-A S8 — Quiet Motion Budget.
 *
 * One focal entrance moment per scene is the ceiling. Perpetual decoration,
 * competing entrance hooks, or a new animation engine are contract violations.
 */
const C4 = "src/styles/c4-quiet-authority.css";
const css = readFileSync(C4, "utf8");

const walk = (dir, out = []) => {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(astro|ts|tsx)$/.test(entry)) out.push(full);
  }
  return out;
};

test("C4 motion: no perpetual decorative animation", () => {
  assert.doesNotMatch(
    css,
    /\binfinite\b/i,
    "continuous animation is not quiet authority",
  );
});

test("C4 motion: at most one focal entrance keyframe", () => {
  const names = [...css.matchAll(/@keyframes\s+([\w-]+)/g)].map((m) => m[1]);
  assert.ok(
    names.length <= 1,
    `at most one focal keyframe (got ${names.length}: ${names})`,
  );
  assert.equal(
    new Set(names).size,
    names.length,
    "keyframe names must be unique",
  );
});

test("C4 motion: at most one focal motion hook class", () => {
  const hooks = new Set(
    [...css.matchAll(/^\s*\.(c4-motion-[\w-]+)\s*[,{]/gm)].map((m) => m[1]),
  );
  assert.ok(
    hooks.size <= 1,
    `at most one focal motion hook (got ${[...hooks].join(", ")})`,
  );
});

test("C4 motion: every C4 animation is neutralised under reduced motion", () => {
  const reduced = css.match(
    /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{([\s\S]*?)\n\}/,
  );
  assert.ok(
    reduced,
    "C4 must neutralise its motion under prefers-reduced-motion",
  );
  assert.match(
    reduced[1],
    /animation:\s*none/,
    "reduced motion must disable the focal animation",
  );
});

test("C4 motion: print media shows content, not the entrance", () => {
  const print = css.match(/@media\s*print\s*\{([\s\S]*?)\n\}/);
  assert.ok(print, "C4 must neutralise its focal animation for print");
  assert.match(
    print[1],
    /animation:\s*none/,
    "print must not freeze content at its hidden start",
  );
});

test("C4 motion: no new animation engine enters the bundle", () => {
  const engines =
    /\b(?:framer-motion|motion\/react|gsap|animejs|@react-spring|popmotion|lottie)\b/;
  const offenders = walk("src").filter((f) =>
    engines.test(readFileSync(f, "utf8")),
  );
  assert.deepEqual(
    offenders,
    [],
    "no runtime animation framework may be added",
  );
});
