/**
 * C2 Lane E — truth-boundary contract (repaired + hardened).
 *
 * Boundary (preserved intent): the C2 cinematic layer may CONSUME truth but
 * never DEFINE it. Product, claim and evidence facts are authored once and
 * consumed from the canonical sources; the cinematic layer is presentation.
 *
 * Guards:
 *   1. C2 surfaces author no product/claim/evidence fact (no literal fact keys,
 *      no inline product list, no literal proof URL).
 *   2. C2 surfaces read truth only through the canonical accessors — never by
 *      calling the content collection directly.
 *   3. No second public product registry exists anywhere in src/.
 *
 * Repo conventions: node:test + node:assert/strict, ESM only (no require), and
 * paths are repository-root relative (never a new URL("../..", import.meta.url)
 * join, which resolves wrong inside a git worktree). Surfaces that do not exist
 * yet are skipped so a planned C2 file cannot fail the guard. Every detector is
 * exported so the non-vacuity tests can prove it fires on synthetic input.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

// ---------------------------------------------------------------------------
// Canonical sources of truth
// ---------------------------------------------------------------------------

const CANONICAL_PRODUCT_ACCESSOR = "src/lib/products.ts";

// ---------------------------------------------------------------------------
// Detectors (exported: the non-vacuity tests call them directly).
// ---------------------------------------------------------------------------

/**
 * Literal assignments to a canonical fact key. Consumption such as
 * `slug: product.data.slug` or `capabilities.slice(0, 3)` is NOT a match —
 * only an inline `"string"` / `[` value authored in the component is.
 */
const AUTHORED_FACT_PATTERNS = [
  /\b(?:slug|reviewDate|reviewedAt|proofUrl|evidenceUrl|claimText|publicLabel|displayOrder|featuredTier|capabilities?)\s*:\s*["'[]/,
  /\bproducts?\s*:\s*\[\s*\{/,
  /\b(?:proof|evidence)[A-Za-z]*\s*:\s*["']https?:\/\//i,
];

/** Registry shapes: an exported product list is a second source of truth. */
const SECOND_REGISTRY_PATTERNS = [
  // an exported array literal of product-shaped objects
  /export\s+(?:default\s+)?(?:const\s+|let\s+|var\s+)?[\w$]*\s*=?\s*\[\s*\{[\s\S]{0,400}?\bslug\s*:/,
  // an exported symbol named as a product registry, even when empty
  /export\s+(?:const|let|var)\s+(?:products|publicproducts|productregistry|productsregistry|publicproductregistry)\s*[:=]/i,
];

/** A surface reaching straight into the collection instead of the accessor. */
const DIRECT_COLLECTION_READ_PATTERNS = [
  /\bgetCollection\s*\(/,
  /\bgetEntry\s*\(/,
];

/** First authored-fact snippet in `content`, or null when it only consumes. */
export function detectAuthoredFact(content) {
  for (const pattern of AUTHORED_FACT_PATTERNS) {
    const match = content.match(pattern);
    if (match) return match[0];
  }
  return null;
}

/** First second-registry snippet in `content`, or null when it is not one. */
export function detectSecondProductRegistry(content) {
  for (const pattern of SECOND_REGISTRY_PATTERNS) {
    const match = content.match(pattern);
    if (match) return match[0];
  }
  return null;
}

/** First direct collection read in `content`, or null when it is absent. */
export function detectDirectCollectionRead(content) {
  for (const pattern of DIRECT_COLLECTION_READ_PATTERNS) {
    const match = content.match(pattern);
    if (match) return match[0];
  }
  return null;
}

// ---------------------------------------------------------------------------
// Scan helpers — repository-root relative, missing paths skipped.
// ---------------------------------------------------------------------------

const SURFACE_SOURCE_EXTENSIONS = [
  ".astro",
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
];

/** Forward-slash paths so assertions are separator-independent. */
const toPosix = (path) => path.replaceAll("\\", "/");

function listFiles(root) {
  if (!existsSync(root)) return [];
  if (!statSync(root).isDirectory()) {
    return SURFACE_SOURCE_EXTENSIONS.some((ext) => root.endsWith(ext))
      ? [toPosix(root)]
      : [];
  }
  const files = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const full = toPosix(join(root, entry.name));
    if (entry.isDirectory()) {
      files.push(...listFiles(full));
    } else if (
      SURFACE_SOURCE_EXTENSIONS.some((ext) => entry.name.endsWith(ext))
    ) {
      files.push(full);
    }
  }
  return files;
}

/**
 * The C2 surfaces that exist or are planned. `HorizonField.astro` and
 * `EvidenceTeaser.astro` are named individually; the rest are whole
 * directories. Missing entries are skipped, not failed.
 */
const C2_SURFACES = [
  "src/components/product",
  "src/components/experience/HorizonField.astro",
  "src/components/sections",
  "src/components/integrity/EvidenceTeaser.astro",
];

function listSurfaceFiles() {
  return [
    ...new Set(C2_SURFACES.flatMap((surface) => listFiles(surface))),
  ].sort();
}

// ---------------------------------------------------------------------------
// Guard 1 — C2 surfaces author no product/claim/evidence fact.
// ---------------------------------------------------------------------------

test("C2 surfaces consume truth and author no product/claim/evidence fact", () => {
  const files = listSurfaceFiles();
  assert.ok(files.length > 0, "expected at least one C2 surface under scan");

  const offenders = [];
  for (const file of files) {
    const snippet = detectAuthoredFact(readFileSync(file, "utf8"));
    if (snippet) offenders.push(`${file}: ${snippet}`);
  }

  assert.deepEqual(
    offenders,
    [],
    `the cinematic layer must consume truth, never define it: ${offenders.join(", ")}`,
  );
});

test("the truth-boundary scan covers the surfaces that exist today", () => {
  const files = listSurfaceFiles();
  assert.ok(
    files.includes("src/components/experience/HorizonField.astro"),
    "the C2 cinematic surface HorizonField.astro must be under scan",
  );
  assert.ok(
    files.some((file) => file.startsWith("src/components/product")),
    "the product surfaces must be under scan",
  );
  assert.ok(
    files.some((file) => file.startsWith("src/components/sections")),
    "the section surfaces must be under scan",
  );
});

// ---------------------------------------------------------------------------
// Guard 2 — truth is read through the canonical accessors only.
// ---------------------------------------------------------------------------

test("C2 surfaces never read the content collection directly", () => {
  const offenders = [];
  for (const file of listSurfaceFiles()) {
    const snippet = detectDirectCollectionRead(readFileSync(file, "utf8"));
    if (snippet) offenders.push(`${file}: ${snippet}`);
  }
  assert.deepEqual(
    offenders,
    [],
    `truth must come from @/lib accessors, not a direct collection read: ${offenders.join(", ")}`,
  );
});

test("the canonical product accessor still owns the products collection", () => {
  assert.ok(
    existsSync(CANONICAL_PRODUCT_ACCESSOR),
    `${CANONICAL_PRODUCT_ACCESSOR} is the single public-product accessor`,
  );
  const source = readFileSync(CANONICAL_PRODUCT_ACCESSOR, "utf8");
  assert.match(
    source,
    /getCollection\(\s*["']products["']/,
    "the canonical accessor must read the products collection",
  );
  assert.match(
    source,
    /export\s+async\s+function\s+getPublicProducts/,
    "the canonical public-product accessor must be preserved",
  );
});

// ---------------------------------------------------------------------------
// Guard 3 — no second public product registry exists in src/.
// ---------------------------------------------------------------------------

const REGISTRY_SCAN_ROOTS = [
  "src/lib",
  "src/data",
  "src/components",
  "src/layouts",
  "src/pages",
  "src/scripts",
];

test("no second public product registry exists in src/", () => {
  const files = REGISTRY_SCAN_ROOTS.flatMap((root) => listFiles(root));
  assert.ok(
    files.length > 0,
    "expected source files to scan for a second registry",
  );

  const offenders = [];
  for (const file of files) {
    if (file === CANONICAL_PRODUCT_ACCESSOR) continue;
    const snippet = detectSecondProductRegistry(readFileSync(file, "utf8"));
    if (snippet) offenders.push(`${file}: ${snippet}`);
  }

  assert.deepEqual(
    offenders,
    [],
    `product facts live in the content collection + canonical accessor only: ${offenders.join(", ")}`,
  );
});

// ---------------------------------------------------------------------------
// Non-vacuity proofs — each detector fires on synthetic offending input and
// stays quiet on legitimate consumption.
// ---------------------------------------------------------------------------

test("non-vacuity: the authored-fact detector catches a fabricated product", () => {
  const fabricatedProduct = [
    "export const FAKE_PRODUCT = {",
    '  slug: "sky-loft",',
    '  name: "Sky Loft",',
    '  capabilities: ["Runs on solar"],',
    '  reviewDate: "2026-01-01",',
    '  proofUrl: "https://example.com/proof",',
    "};",
  ].join("\n");
  assert.notEqual(detectAuthoredFact(fabricatedProduct), null);

  assert.notEqual(
    detectAuthoredFact('const claimText: "Verified by a third party",'),
    null,
  );
  assert.notEqual(
    detectAuthoredFact('const products = { products: [{ slug: "a-b" }] };'),
    null,
  );
  assert.notEqual(
    detectAuthoredFact('evidenceHref: "https://example.com/evidence"'),
    null,
  );

  // Negative controls: real consumption must NOT be flagged.
  assert.equal(
    detectAuthoredFact("slug: product.data.slug,"),
    null,
    "passing a consumed slug through must not read as authorship",
  );
  assert.equal(
    detectAuthoredFact(
      "{capabilities.slice(0, 3).map((capability: string) => (\n  <li>{capability}</li>\n))}",
    ),
    null,
    "rendering a consumed capability list must not read as authorship",
  );
  assert.equal(
    detectAuthoredFact("products: { slug: string; name: string }[];"),
    null,
    "a TypeScript prop shape is not an authored fact",
  );
});

test("non-vacuity: the second-registry detector catches a duplicate registry", () => {
  assert.notEqual(
    detectSecondProductRegistry(
      'export const PUBLIC_PRODUCTS = [{ slug: "sky-loft", name: "Sky Loft" }];',
    ),
    null,
  );
  assert.notEqual(
    detectSecondProductRegistry("export const products = [];"),
    null,
  );
  assert.notEqual(
    detectSecondProductRegistry('export default [{ slug: "sky-loft" }];'),
    null,
  );

  // Negative controls: the canonical accessor shape must NOT be flagged.
  assert.equal(
    detectSecondProductRegistry(
      'export async function getPublicProducts(): Promise<ProductEntry[]> {\n  return await getCollection("products");\n}',
    ),
    null,
    "an accessor function is not a second registry",
  );
  assert.equal(
    detectSecondProductRegistry("export const ProductSchema = z.object({});"),
    null,
    "a schema is not a registry",
  );
});

test("non-vacuity: the direct-collection-read detector catches a raw read", () => {
  assert.notEqual(
    detectDirectCollectionRead('const p = await getCollection("products");'),
    null,
  );
  assert.equal(
    detectDirectCollectionRead(
      'import type { CollectionEntry } from "astro:content";',
    ),
    null,
    "a type-only import is consumption, not a direct read",
  );
});
