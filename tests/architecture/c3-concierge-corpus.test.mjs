/**
 * C3-E Task 2 — deterministic public concierge corpus adapter.
 *
 * The corpus is a COMPOSITION of published truth, never a new statement of it:
 * every record's text is verbatim from the canonical adapters (claims catalog,
 * claim resolver, product refs the caller already filtered as public). These
 * tests pin the leakage refusals, the record shape, and the determinism the
 * plan requires (Step 1 negative leakage, Step 3 stable ids/ordering).
 */
import assert from "node:assert/strict";
import test from "node:test";

import { buildConciergeCorpus } from "../../src/lib/concierge-corpus.ts";

const SITE = "https://blueskyzlabs.com";

/** The two products the public registry actually publishes (fixtures). */
const PUBLIC_PRODUCTS = [
  {
    slug: "sotro",
    name: "Sổ Trọ",
    description: "A tenancy journal for Vietnamese renters.",
  },
  {
    slug: "sotam",
    name: "Sổ Tâm",
    description: "A local-first journal for private reflections.",
  },
];

const HIDDEN_SLUGS = ["apexagent", "fluentarc", "vungtaylai"];

test("every record carries the declared shape and a same-origin public URL", () => {
  const corpus = buildConciergeCorpus({
    products: PUBLIC_PRODUCTS,
    lang: "en",
  });
  assert.ok(
    corpus.length > 0,
    "corpus must not be empty for the public registry",
  );
  for (const record of corpus) {
    assert.ok(["product", "claim", "route"].includes(record.kind), record.kind);
    assert.match(record.id, /^(product|claim|route):[a-z0-9-]+$/);
    assert.ok(record.title.trim().length > 0, `${record.id}: title`);
    assert.ok(record.text.trim().length > 0, `${record.id}: text`);
    assert.ok(record.publicUrl.startsWith(`${SITE}/en/`), record.publicUrl);
    assert.ok(
      Array.isArray(record.sourceIds) && record.sourceIds.length > 0,
      record.id,
    );
  }
});

test("non-vacuity: the public registry yields product, claim and route records", () => {
  const corpus = buildConciergeCorpus({
    products: PUBLIC_PRODUCTS,
    lang: "en",
  });
  const kinds = new Set(corpus.map((record) => record.kind));
  assert.ok(kinds.has("product"), "product records");
  assert.ok(kinds.has("claim"), "claim records");
  assert.ok(kinds.has("route"), "route records");
});

test("negative leakage: unpublished products never appear", () => {
  const corpus = buildConciergeCorpus({
    products: PUBLIC_PRODUCTS,
    lang: "en",
  });
  const flat = JSON.stringify(corpus);
  for (const hidden of HIDDEN_SLUGS) {
    assert.ok(
      !flat.includes(hidden),
      `${hidden} must not leak into the corpus`,
    );
  }
  // The corpus only reflects what the caller passed — it adds no product itself.
  const products = corpus.filter((record) => record.kind === "product");
  assert.equal(products.length, PUBLIC_PRODUCTS.length);
});

test("negative leakage: internal paths, workflows and secret shapes are absent", () => {
  const corpus = buildConciergeCorpus({
    products: PUBLIC_PRODUCTS,
    lang: "en",
  });
  const flat = JSON.stringify(corpus);
  for (const needle of [
    "docs/",
    "scripts/",
    "tests/",
    ".github",
    "src/",
    "node_modules",
    "workflow",
    "quality-gates",
  ]) {
    assert.ok(
      !flat.includes(needle),
      `internal marker ${needle} must not leak`,
    );
  }
  assert.doesNotMatch(
    flat,
    /AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{36}|sk-[A-Za-z0-9]{20,}|BEGIN [A-Z ]*PRIVATE KEY/,
  );
});

test("determinism: repeated calls are byte-identical and input order is irrelevant", () => {
  const first = buildConciergeCorpus({ products: PUBLIC_PRODUCTS, lang: "en" });
  const second = buildConciergeCorpus({
    products: PUBLIC_PRODUCTS,
    lang: "en",
  });
  assert.deepEqual(first, second);

  const reversed = buildConciergeCorpus({
    products: [...PUBLIC_PRODUCTS].reverse(),
    lang: "en",
  });
  assert.deepEqual(first, reversed, "input order must not change the corpus");
});

test("determinism: ids are stable, unique and canonically ordered", () => {
  const corpus = buildConciergeCorpus({
    products: PUBLIC_PRODUCTS,
    lang: "en",
  });
  const ids = corpus.map((record) => record.id);
  assert.deepEqual(
    ids,
    [...ids].sort(),
    "records must be canonically ordered by id",
  );
  assert.equal(new Set(ids).size, ids.length, "ids must be unique");
});

test("localization: the requested language shapes every public URL", () => {
  for (const lang of ["en", "vi", "zh", "zh-hant"]) {
    const corpus = buildConciergeCorpus({ products: PUBLIC_PRODUCTS, lang });
    for (const record of corpus) {
      assert.ok(
        record.publicUrl.startsWith(`${SITE}/${lang}/`),
        `${lang}: ${record.publicUrl}`,
      );
    }
  }
});

test("negative proof: a malformed product slug is refused, never sanitized", () => {
  const corpus = buildConciergeCorpus({
    products: [
      ...PUBLIC_PRODUCTS,
      { slug: "../secrets", name: "Nope" },
      { slug: "UPPER CASE", name: "Nope" },
    ],
    lang: "en",
  });
  const flat = JSON.stringify(corpus);
  assert.ok(!flat.includes("secrets"), "malformed slug must be dropped");
  assert.ok(!flat.includes("UPPER CASE"), "malformed slug must be dropped");
  assert.equal(
    corpus.filter((record) => record.kind === "product").length,
    PUBLIC_PRODUCTS.length,
  );
});

test("claim records carry the canonical statement verbatim and its evidence ids", async () => {
  const { CLAIMS } = await import("../../src/data/claims.ts");
  const corpus = buildConciergeCorpus({
    products: PUBLIC_PRODUCTS,
    lang: "en",
  });
  for (const claim of CLAIMS) {
    const record = corpus.find((r) => r.id === `claim:${claim.id}`);
    assert.ok(record, `claim record for ${claim.id}`);
    assert.equal(
      record.text,
      claim.statement.en,
      `${claim.id}: verbatim statement`,
    );
    for (const evidenceId of claim.evidenceIds ?? []) {
      assert.ok(
        record.sourceIds.includes(evidenceId),
        `${claim.id}: ${evidenceId}`,
      );
    }
    assert.equal(record.publicUrl, `${SITE}/en/evidence/${claim.id}/`);
  }
});
