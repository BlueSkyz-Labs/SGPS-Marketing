/**
 * v3 G4 — Decision Room contract.
 * The room is a bounded, ephemeral, in-memory workspace: no storage, no
 * network, no grading vocabulary, and items come only from public sources.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  buildDecisionItems,
  MAX_COMPARISON,
} from "../../src/lib/decision-room.ts";

const lib = readFileSync("src/lib/decision-room.ts", "utf8");
const script = readFileSync("src/scripts/decision-room.ts", "utf8");
const combined = lib + script;

test("no storage, cookies, or persistence anywhere", () => {
  assert.doesNotMatch(
    combined,
    /localStorage|sessionStorage|document\.cookie|indexedDB/,
  );
});

test("no network primitives — the room never phones home", () => {
  assert.doesNotMatch(
    combined,
    /fetch\(|XMLHttpRequest|sendBeacon|new WebSocket|navigator\.sendBeacon/,
  );
});

test("no grading vocabulary: nothing is ordered by quality", () => {
  assert.doesNotMatch(
    combined,
    /score|rank|recommend|winner|confidence|best|worst/i,
  );
});

test("comparison is capped at four and bounded by construction", () => {
  assert.equal(MAX_COMPARISON, 4);
  assert.match(script, /Math\.min\(\s*MAX_DEFAULT/);
  assert.match(script, /data-decision-ready/);
  assert.doesNotMatch(script, /new Function|eval\(|import\(/);
});

test("items are built only from public claims, trust ledger, and products", () => {
  assert.match(lib, /getPublicClaims/);
  assert.match(lib, /TRUST_LEDGER/);
  assert.match(lib, /getProductProfilePath/);
  assert.doesNotMatch(lib, /brand-assets|\.png|\.jpg|\.webp/);
});

test("an empty public registry yields no product items", () => {
  const items = buildDecisionItems([]);
  assert.ok(items.length > 0, "claims/trust items still exist");
  assert.ok(items.every((item) => item.kind !== "product"));
  const ids = new Set(items.map((item) => item.id));
  assert.equal(ids.size, items.length, "item ids are unique");
});

test("a public product becomes a sourced item with its profile path", () => {
  const items = buildDecisionItems([{ slug: "sample", name: "Sample" }]);
  const product = items.find((item) => item.kind === "product");
  assert.ok(product, "product item exists once published");
  assert.equal(product?.id, "product:sample");
  assert.equal(product?.evidenceHref?.en, "/en/products/sample/");
  assert.equal(product?.evidenceHref?.vi, "/vi/products/sample/");
});

test("claims carry their boundary text when a boundary is declared", () => {
  const items = buildDecisionItems([]);
  assert.ok(
    items.some((item) => item.kind === "claim" && item.boundaryText),
    "at least one claim exposes its boundary in the room",
  );
});
