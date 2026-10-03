/**
 * RT-03 — no-slash legacy paths and bare locale roots must reach their final
 * destination in ONE permanent hop (no 307 -> 301 chain from the platform's
 * auto-trailing-slash normalization).
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const rules = readFileSync("public/_redirects", "utf8")
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith("#"))
  .map((line) => line.split(/\s+/))
  .map(([from, to, status]) => ({ from, to, status }));

const byFrom = new Map(rules.map((rule) => [rule.from, rule]));
const LOCALES = ["en", "vi", "zh", "zh-hant"];

test("every legacy slash rule has a no-slash twin with the same 301 target", () => {
  const slashRules = rules.filter(
    (rule) =>
      rule.from.endsWith("/") && rule.from !== "/" && !rule.from.includes(":"),
  );
  assert.ok(slashRules.length >= 6, "legacy slash rules must be discovered");
  for (const rule of slashRules) {
    const twin = byFrom.get(rule.from.slice(0, -1));
    assert.ok(twin, `missing no-slash rule for ${rule.from}`);
    assert.equal(
      twin.to,
      rule.to,
      `${twin.from} must share the target of ${rule.from}`,
    );
    assert.equal(twin.status, "301", `${twin.from} must be 301`);
  }
});

test("each bare locale root redirects once, with 301, to its slash form", () => {
  for (const locale of LOCALES) {
    const rule = byFrom.get(`/${locale}`);
    assert.ok(rule, `missing bare locale rule for /${locale}`);
    assert.equal(rule.to, `/${locale}/`);
    assert.equal(rule.status, "301", `/${locale} must be 301`);
  }
});

test("no rule has an off-site or protocol-relative target, and every status is 301", () => {
  for (const rule of rules) {
    assert.match(
      rule.to,
      /^\/(?!\/)/,
      `${rule.from} must target a same-origin path`,
    );
    assert.doesNotMatch(rule.to, /^[a-z][a-z0-9+.-]*:/i);
    assert.equal(rule.status, "301", `${rule.from} must be 301`);
  }
});

test("new no-slash rules use exact matches only (no splat/placeholder)", () => {
  for (const rule of rules.filter((r) => !r.from.endsWith("/"))) {
    if (rule.from.startsWith("/products/:")) continue; // pre-existing one-segment rule
    assert.doesNotMatch(rule.from, /[*:]/, `${rule.from} must be exact`);
  }
});
