/**
 * H11 — legacy redirect contract.
 * Recovery from an old URL must be one hop: a redirect that lands on another
 * redirect is a chain, and chains rot (later edits forget the middle link).
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync("public/_redirects", "utf8");

const rules = source
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith("#"))
  .map((line) => line.split(/\s+/))
  .filter((parts) => parts.length >= 2)
  .map(([from, to, status]) => ({ from, to, status: status ?? "301" }));

test("the redirect table is non-empty and all destinations are localized", () => {
  assert.ok(
    rules.length >= 8,
    `expected the legacy table, found ${rules.length}`,
  );
  for (const rule of rules) {
    assert.match(
      rule.to,
      /^\/(en|vi)\//,
      `${rule.from} must land on a localized canonical route`,
    );
    assert.equal(
      rule.status,
      "301",
      `${rule.from} must be a permanent redirect`,
    );
  }
});

test("no redirect destination is itself a redirect source (no chains)", () => {
  const sources = new Set(rules.map((rule) => rule.from));
  const chains = rules.filter((rule) => sources.has(rule.to));
  assert.deepEqual(
    chains.map((rule) => `${rule.from} -> ${rule.to}`),
    [],
    "redirect chains must be flattened to a single hop",
  );
});

test("every legacy root route has a rule", () => {
  for (const from of [
    "/",
    "/about/",
    "/contact/",
    "/privacy/",
    "/security/",
    "/support/",
    "/products/",
  ]) {
    assert.ok(
      rules.some((rule) => rule.from === from),
      `missing legacy rule for ${from}`,
    );
  }
});
