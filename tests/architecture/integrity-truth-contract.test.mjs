import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, existsSync } from "node:fs";

const read = (path) =>
  readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

const dataPath = new URL("../../src/data/integrity.ts", import.meta.url);
const libPath = new URL("../../src/lib/integrity.ts", import.meta.url);

test("integrity modules exist", () => {
  assert.ok(existsSync(dataPath), "src/data/integrity.ts must exist");
  assert.ok(existsSync(libPath), "src/lib/integrity.ts must exist");
});

const data = existsSync(dataPath) ? read("src/data/integrity.ts") : "";
const lib = existsSync(libPath) ? read("src/lib/integrity.ts") : "";

test("no fabricated trust scoring or blanket verification", () => {
  const combined = `${data}\n${lib}`;
  assert.doesNotMatch(combined, /trustScore/i);
  assert.doesNotMatch(combined, /maturityScore/i);
  assert.doesNotMatch(combined, /verified:\s*true/);
  assert.doesNotMatch(
    combined,
    /new Date\(\)|Date\.now\(\)/,
    "review dates must be authored data, never generated at runtime",
  );
  assert.doesNotMatch(
    combined,
    /brand-assets/,
    "brand assets are never product evidence",
  );
});

test("integrity entries reference only public, localized facts (v3 S+5)", () => {
  const start = data.indexOf("INTEGRITY_ENTRIES: readonly IntegrityEntry[]");
  assert.notEqual(start, -1, "INTEGRITY_ENTRIES must exist as a typed list");
  const end = data.indexOf("\n];", start);
  assert.notEqual(end, -1, "INTEGRITY_ENTRIES must be terminated");
  const block = data.slice(start, end + 3);
  assert.doesNotMatch(
    block,
    /sha|workflow|branch protection|run id|runner|deploy/i,
    "entries must not use internal governance jargon as public proof",
  );
  const ids = [...block.matchAll(/id: "([^"]+)"/g)].map((m) => m[1]);
  assert.ok(ids.length >= 3, "expected at least three modeled surfaces");
  assert.equal(new Set(ids).size, ids.length, "entry ids must be unique");
  const surfaces = [...block.matchAll(/surface: "([^"]+)"/g)].map((m) => m[1]);
  assert.equal(surfaces.length, ids.length, "every entry needs a surface");
  const summaries = [...block.matchAll(/summary: \{[^}]*\}/gs)];
  assert.equal(summaries.length, ids.length, "every entry needs a summary");
  for (const summary of summaries) {
    assert.match(summary[0], /en: "/, "summary needs EN");
    assert.match(summary[0], /vi: "/, "summary needs VI");
  }
  const hrefs = [...block.matchAll(/href: \{ ([^}]+) \}/g)];
  assert.ok(hrefs.length >= ids.length, "every entry needs evidence hrefs");
  for (const href of hrefs) {
    const pairs = [
      ...href[1].matchAll(/(en|vi): ("[^"]+"|[A-Z][A-Z0-9_]+)/g),
    ];
    assert.equal(pairs.length, 2, "evidence href must be localized");
    for (const [, , raw] of pairs) {
      if (raw.startsWith('"')) {
        const value = raw.slice(1, -1);
        assert.match(
          value,
          /^\/|^https:\/\//,
          `evidence href must be a public path or URL: ${value}`,
        );
      } else {
        assert.match(
          raw,
          /^[A-Z][A-Z0-9_]+$/,
          "identifier href values must be UPPERCASE constants",
        );
      }
    }
  }
});

test("truth-state contract covers the required states", () => {
  for (const state of [
    "source-linked",
    "reviewed",
    "changed",
    "not-published",
    "unavailable",
  ]) {
    assert.match(data, new RegExp(`"${state}"`), `missing state: ${state}`);
  }
  assert.doesNotMatch(
    data,
    /"verified"/,
    "blanket verified state is not part of the contract",
  );
});

test("public-truth validation module is preserved and not bypassed", () => {
  const truth = read("src/lib/truth.ts");
  assert.match(truth, /blueskyzlabs\.com|PUBLIC_SITE_URL|canonical/i);
  assert.match(lib, /getIntegrityEntriesForSurface/);
  assert.match(lib, /getIntegrityEntry/);
});

test("proof-first empty state cannot import brand assets or enumerate products", () => {
  const empty = read("src/components/product/ProofFirstEmptyState.astro");
  assert.doesNotMatch(empty, /brand-assets/);
  assert.doesNotMatch(empty, /astro:content|getCollection|getPublicProducts/);
  assert.match(empty, /en: "/);
  assert.match(empty, /vi: "/);
});

test("authored boundary statements are localized and concrete", () => {
  for (const name of ["SECURITY_BOUNDARY", "PRIVACY_BOUNDARY"]) {
    const start = data.indexOf(`${name}: BoundaryStatement = {`);
    assert.notEqual(start, -1, `${name} must exist in src/data/integrity.ts`);
    const end = data.indexOf("};", start);
    assert.notEqual(end, -1, `${name} must be terminated`);
    const block = data.slice(start, end + 2);
    assert.match(block, /claim: \{/);
    assert.match(block, /doesNotImply: \{/);
    assert.match(block, /en: "/);
    assert.match(block, /vi: "/);
  }
});
