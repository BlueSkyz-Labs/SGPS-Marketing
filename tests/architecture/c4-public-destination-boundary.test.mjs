import assert from "node:assert/strict";
import test from "node:test";
import { EVIDENCE_INDEX } from "../../src/data/claims.ts";
import {
  getPublicProvenance,
  isPublicDestination,
} from "../../src/lib/provenance-lens.ts";

test("public destinations reject unsafe URLs", () => {
  const refused = [
    "/\\evil.example/path",
    "/%2e%2e/private/",
    "/%2F%2Fevil.example/",
    "/%5c%5cevil.example/",
    "/%252e%252e/private/",
    "/a/../private/",
    "//evil.example/path",
    "https://",
    "https://user:password@evil.example/report",
    "https://example.com\\@evil.example/report",
    "https://example.com/\nattack",
    "http://example.com/",
    "javascript:alert(1)",
  ];
  for (const href of refused) {
    assert.equal(
      isPublicDestination(href),
      false,
      `refuse ${JSON.stringify(href)}`,
    );
  }
  for (const href of [
    "/en/security/",
    "/vi/products/",
    "https://github.com/BlueSkyz-Labs/SGPS-Marketing/security/advisories",
    "https://example.com/report?version=1#source",
  ]) {
    assert.equal(isPublicDestination(href), true, `preserve ${href}`);
  }
});

test("a malformed canonical destination is not published as a source", () => {
  const reference = EVIDENCE_INDEX.get("ev-security-route");
  assert.ok(reference, "real canonical evidence fixture must exist");
  const original = reference.href.en;
  const malformed = "/\\evil.example/report";
  try {
    reference.href.en = malformed;
    assert.equal(getPublicProvenance(reference.id, "en"), null);
    const chain = getPublicProvenance("security-reporting-is-private", "en");
    assert.ok(chain);
    assert.equal(
      chain.sourceRefs.some((ref) => ref.href === malformed),
      false,
    );
    assert.equal(
      chain.sourceRefs.some((ref) => ref.id === reference.id),
      false,
    );
  } finally {
    reference.href.en = original;
  }
});
