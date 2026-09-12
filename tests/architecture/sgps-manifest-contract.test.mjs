/**
 * v3 G7 — Public SGPS manifest contract.
 * The manifest must expose only stable public ids, locale paths, authored
 * truth states, and safe evidence ids — never emails, private-reporting
 * targets, repo paths, SHAs, workflow ids, branches, unpublished product
 * names, or arbitrary free-text fields.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  buildPublicSgpsManifest,
  serializePublicSgpsManifest,
} from "../../src/lib/sgps-manifest.ts";
import { getPublicClaims } from "../../src/lib/claims.ts";

test("manifest claim ids equal the public Claim Fabric ids", () => {
  const fabricIds = getPublicClaims([])
    .map((resolved) => resolved.claim.id)
    .sort();
  const manifestIds = buildPublicSgpsManifest([]).claims.map(
    (claim) => claim.id,
  );
  assert.deepEqual(manifestIds, fabricIds);
});

test("schema version, source marker, and determinism", () => {
  const manifest = buildPublicSgpsManifest([]);
  assert.equal(manifest.schemaVersion, "1.0");
  assert.equal(manifest.generatedFrom, "public-runtime-data");
  assert.equal(
    serializePublicSgpsManifest([]),
    serializePublicSgpsManifest([]),
    "serialization must be byte-stable",
  );
});

test("no emails, repo paths, SHAs, workflows, or branches", () => {
  const raw = serializePublicSgpsManifest([]);
  assert.doesNotMatch(raw, /@/, "no email addresses");
  assert.doesNotMatch(
    raw,
    /github\.com|Blueskyz-Labs|\.github/i,
    "no repo targets",
  );
  assert.doesNotMatch(raw, /\b[0-9a-f]{7,40}\b/i, "no commit SHAs");
  assert.doesNotMatch(
    raw,
    /workflows?\/|refs\/|branch/i,
    "no workflow ids or branches",
  );
});

test("no unpublished product names leak into the manifest", () => {
  const raw = serializePublicSgpsManifest([
    { slug: "ghost", name: "Ghost Name" },
  ]);
  assert.ok(!raw.includes("Ghost Name"), "product display name must not leak");
  assert.ok(!raw.includes("ghost"), "product slug must not leak");
});

test("claim records expose only the allowed schema fields", () => {
  const allowed = ["evidenceIds", "id", "kind", "truthState", "urls"];
  for (const claim of buildPublicSgpsManifest([]).claims) {
    for (const key of Object.keys(claim)) {
      assert.ok(allowed.includes(key), `unexpected field: ${key}`);
    }
  }
});

test("urls are locale-safe public evidence-passport paths", () => {
  for (const claim of buildPublicSgpsManifest([]).claims) {
    assert.match(claim.urls.en, /^\/en\/evidence\/[a-z0-9-]+\/$/);
    assert.match(claim.urls.vi, /^\/vi\/evidence\/[a-z0-9-]+\/$/);
  }
});

test("evidence ids are safe stable ids", () => {
  for (const claim of buildPublicSgpsManifest([]).claims) {
    for (const id of claim.evidenceIds) {
      assert.match(id, /^ev-[a-z0-9-]+$/);
    }
  }
});

test("the manifest module performs no network or dynamic evaluation", () => {
  const source = readFileSync("src/lib/sgps-manifest.ts", "utf8");
  assert.doesNotMatch(source, /fetch\(|XMLHttpRequest|sendBeacon/);
  assert.doesNotMatch(source, /new Function|eval\(/);
});
