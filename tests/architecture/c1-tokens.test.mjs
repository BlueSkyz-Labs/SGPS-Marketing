import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const css = readFileSync("src/styles/global.css", "utf8").toLowerCase();

test("C1.1 tokens use R4d primitives without legacy gold", () => {
  for (const value of [
    "--brand-ink: #0b1020",
    "--brand-porcelain: #f7f8fa",
    "--brand-cobalt: #2564ff",
    "--surface-primary",
    "--surface-inverse",
    "--text-primary",
    "--text-muted",
    "--action-primary",
    "--focus-ring",
  ]) {
    assert.match(css, new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.doesNotMatch(css, /#c9a962|champagne|gold/i);
});
