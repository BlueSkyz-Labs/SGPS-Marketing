/**
 * Empty-branch contract for the public product registry.
 *
 * The registry is no longer empty, so the browser suite can no longer exercise the empty branch
 * through a live route — the previous e2e cases were skipped whenever any product was published.
 * This test keeps that coverage at the level where it can be proven: the loader reports zero for
 * an empty registry and counts only records that declare `public: true`, and the empty-state
 * component states the publication rule in all three languages with locale-correct actions and
 * without claiming the registry is broken or empty in user-facing copy.
 */
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { getPublicProductCount } from "../../tests/e2e/product-helpers.ts";

const ROOT = resolve(fileURLToPath(new URL("../..", import.meta.url)));

function withRegistry(records, assertion) {
  const dir = mkdtempSync(join(tmpdir(), "empty-registry-"));
  try {
    for (const [name, body] of Object.entries(records)) {
      writeFileSync(join(dir, name), body);
    }
    assertion(dir);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

test("an empty registry reports zero published products", () => {
  const dir = mkdtempSync(join(tmpdir(), "empty-registry-"));
  try {
    assert.equal(getPublicProductCount(dir), 0);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test("only records that declare public: true count as published", () => {
  withRegistry(
    {
      "public-product.yaml": "slug: public-product\npublic: true\n",
      "private-product.yaml": "slug: private-product\npublic: false\n",
    },
    (dir) => {
      assert.equal(getPublicProductCount(dir), 1);
    },
  );
});

test("the real registry reports the published product count", () => {
  assert.equal(
    getPublicProductCount(join(ROOT, "src/content/products")),
    5,
    "the shipped registry publishes five products",
  );
});

test("the empty state states the publication rule in every language with locale actions", () => {
  const component = readFileSync(
    join(ROOT, "src/components/product/ProofFirstEmptyState.astro"),
    "utf8",
  );
  assert.match(component, /data-proof-first-empty-state/);
  for (const heading of [
    "Publication requires proof",
    "Công bố cần bằng chứng",
    "发布须有证据",
  ]) {
    assert.ok(
      component.includes(heading),
      `the empty state must state the rule in ${heading}`,
    );
  }
  assert.match(
    component,
    /emptyRegistryPrimaryCta\(SITE\.contactEmail, lang\)/,
  );
  assert.match(
    component,
    /emptyRegistrySecondaryCta\(SITE\.contactEmail, lang\)/,
  );
  assert.doesNotMatch(component, /has no products|không có sản phẩm/i);
});

test("the empty state is mounted only behind the empty-registry condition", () => {
  for (const lang of ["en", "vi", "zh"]) {
    const listing = readFileSync(
      join(ROOT, `src/pages/${lang}/products/index.astro`),
      "utf8",
    );
    assert.match(
      listing,
      /products\.length === 0 \?/,
      `${lang} listing must gate the empty state on an empty registry`,
    );
    assert.match(
      listing,
      /<ProofFirstEmptyState lang=\{?["']?[a-z]{2}/,
      `${lang} listing must render the localized empty state inside that branch`,
    );
    assert.match(
      listing,
      /ProductCard|ProductGrid|data-product-card/,
      `${lang} listing must render the published products`,
    );
  }
});
