/** WCAG 2.5.8 (24x24 CSS px) source contract for controls axe/keyboard audit found small. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const global = readFileSync("src/styles/global.css", "utf8");
const quiet = readFileSync("src/styles/c4-quiet-authority.css", "utf8");

export const ruleBody = (css, selector) => {
  const i = css.indexOf(`${selector} {`);
  return i < 0 ? "" : css.slice(i, css.indexOf("}", i));
};
export const meetsMin24 = (body) => {
  const m = body.match(/min-(?:height|block-size):\s*([\d.]+)(rem|px)/);
  if (!m) return false;
  return (m[2] === "rem" ? Number(m[1]) * 16 : Number(m[1])) >= 24;
};
export const checkboxIs24 = (body) => {
  const m = body.match(/inline-size:\s*([\d.]+)rem/);
  const n = body.match(/block-size:\s*([\d.]+)rem/);
  return Boolean(m && n && Number(m[1]) * 16 >= 24 && Number(n[1]) * 16 >= 24);
};

test("decision-room source link is at least 24px tall", () => {
  assert.equal(meetsMin24(ruleBody(global, ".decision-room__source")), true);
});

test("decision-room checkboxes are at least 24x24", () => {
  const body = ruleBody(
    quiet,
    '.decision-room__atelier-check input[type="checkbox"],\n.decision-room__select input[type="checkbox"]',
  );
  assert.equal(checkboxIs24(body), true);
});

test("negative proof: undersized rules are rejected", () => {
  assert.equal(meetsMin24("a { min-height: 1.25rem; }"), false);
  assert.equal(meetsMin24("a { font-size: 1rem; }"), false);
  assert.equal(checkboxIs24("inline-size: 0.8rem; block-size: 0.8rem;"), false);
});
