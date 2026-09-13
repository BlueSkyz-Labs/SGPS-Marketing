/**
 * H3 — motion-reduce contract.
 * A visitor who asks for reduced motion must actually get it: the global
 * stylesheet must neutralise every transition/animation, and no later
 * `!important` duration may out-rank that neutraliser.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const GLOBAL_CSS = "src/styles/global.css";
const css = readFileSync(GLOBAL_CSS, "utf8");

const REDUCE_BLOCK =
  /@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?)\n\}/g;

function reduceBlocks() {
  return [...css.matchAll(REDUCE_BLOCK)].map((match) => match[1]);
}

test("a reduced-motion block neutralises transitions and animations", () => {
  const blocks = reduceBlocks();
  assert.ok(blocks.length > 0, "global.css must declare a reduce block");
  const joined = blocks.join("\n");
  assert.match(
    joined,
    /transition-duration:\s*0\.01ms\s*!important/,
    "transitions must be neutralised with !important",
  );
  assert.match(
    joined,
    /animation-duration:\s*0\.01ms\s*!important/,
    "animations must be neutralised with !important",
  );
  assert.match(joined, /animation-iteration-count:\s*1\s*!important/);
});

test("nothing out-ranks the neutraliser", () => {
  const neutralised = reduceBlocks().join("\n");
  const outside = css.replace(REDUCE_BLOCK, "");
  const offenders = outside
    .split(/\r?\n/)
    .filter((line) =>
      /(transition-duration|animation-duration|transition|animation)\s*:[^;]*!important/.test(
        line,
      ),
    )
    .filter((line) => !neutralised.includes(line.trim()));
  assert.deepEqual(
    offenders,
    [],
    `!important duration outside the reduce block defeats reduced motion: ${offenders.join(" | ")}`,
  );
});

test("decorative entrance animations only run when motion is welcome", () => {
  const welcome = css.match(
    /@media \(prefers-reduced-motion: no-preference\) \{([\s\S]*?)\n\}/,
  );
  assert.ok(welcome, "entrance animations must live behind no-preference");
  const entrance = welcome[1].match(/animation:\s*([a-z-]+)/g) ?? [];
  assert.ok(entrance.length > 0, "expected the entrance animations");
  for (const declaration of entrance) {
    const name = declaration.replace(/animation:\s*/, "");
    assert.match(
      css,
      new RegExp(`@keyframes\\s+${name}\\b`),
      `animation ${name} must have a keyframes definition`,
    );
  }
  // The keyframes must not be declared outside the welcome path in a way that
  // could start before the media query applies.
  const keyframesAt = css.indexOf("@keyframes");
  assert.ok(keyframesAt > -1, "keyframes must be defined");
});

test("every keyframes block defined in global.css is actually used", () => {
  const defined = [...css.matchAll(/@keyframes\s+([a-z-]+)/g)].map(
    (match) => match[1],
  );
  assert.ok(defined.length > 0);
  for (const name of defined) {
    assert.match(
      css,
      new RegExp(`animation:\\s*${name}\\b`),
      `@keyframes ${name} is dead code`,
    );
  }
});
