/**
 * T11 — Integrity Lens evidence topology (anti-cycle).
 * "Verify this page" must never rest on the page itself as its only
 * evidence: a lens whose sole citation is its own surface is circular trust.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { INTEGRITY_ENTRIES } from "../../src/data/integrity.ts";

const SURFACE_PAGE = {
  security: "/security/",
  privacy: "/privacy/",
  products: "/products/",
};

test("no entry cites only its own surface page as evidence", () => {
  const cycles = [];
  for (const entry of INTEGRITY_ENTRIES) {
    const selfPath = SURFACE_PAGE[entry.surface];
    if (!selfPath) continue;
    // External destinations are never self-referential.
    const nonSelf = entry.evidence.filter(
      (ref) =>
        !(typeof ref.href?.en === "string" && ref.href.en.endsWith(selfPath)),
    );
    if (nonSelf.length === 0 && entry.evidence.length > 0) {
      cycles.push(
        `${entry.id} -> ${entry.evidence.map((ref) => ref.href.en).join(", ")}`,
      );
    }
  }
  assert.deepEqual(
    cycles,
    [],
    `circular evidence (a page verifying itself): ${cycles}`,
  );
});

test("every entry still declares at least one public evidence reference", () => {
  for (const entry of INTEGRITY_ENTRIES) {
    assert.ok(entry.evidence.length > 0, `${entry.id} has no evidence`);
  }
});

test("the products entry cites machine-verifiable public evidence", () => {
  const entry = INTEGRITY_ENTRIES.find(
    (candidate) => candidate.id === "products-publication",
  );
  assert.ok(entry, "products-publication entry must exist");
  assert.ok(
    entry.evidence.some((ref) => ref.href.en === "/.well-known/sgps.json"),
    "products entry must cite the public SGPS manifest, not only its own page",
  );
});
