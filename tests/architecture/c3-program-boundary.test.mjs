/**
 * C3 master Task 2 — cross-program boundary guard.
 *
 * Prevents C3 experience modules from becoming a second truth registry,
 * importing high-risk concierge/spatial code into the critical path, or
 * introducing hidden telemetry.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");
const PROOF_MODULE = "src/lib/product-proof.ts";

test("C3 Trust Continuum consumes the canonical Claim Fabric", () => {
  assert.ok(
    existsSync(PROOF_MODULE),
    "first C3 trust runtime selector must exist behind the program boundary",
  );
  const source = read(PROOF_MODULE);
  assert.match(source, /from ["']\.\/claims\.ts["']/);
  assert.match(source, /getPublicClaims/);
  assert.doesNotMatch(
    source,
    /from ["']\.\.\/data\/claims\.ts["']/,
    "C3 trust adapters must consume selectors, not own the claim registry",
  );
  assert.doesNotMatch(source, /astro:content|getCollection/);
});

test("C3 runtime modules declare no second truth registry or network transport", () => {
  const candidates = [
    "src/lib/product-proof.ts",
    "src/lib/product-transition.ts",
    "src/lib/route-transition.ts",
    "src/lib/scene.ts",
    "src/components/product/ProductVisual.astro",
    "src/styles/c3-craft.css",
  ].filter(existsSync);

  assert.ok(candidates.includes(PROOF_MODULE));
  for (const path of candidates) {
    const source = read(path);
    assert.doesNotMatch(
      source,
      /export\s+const\s+(?:PRODUCTS|CLAIMS|EVIDENCE|RELEASES)\b/,
      `${path} must not declare a second truth registry`,
    );
    assert.doesNotMatch(
      source,
      /\bfetch\s*\(|XMLHttpRequest|sendBeacon\s*\(|new\s+WebSocket\s*\(/,
      `${path} must not introduce telemetry/network transport`,
    );
  }
});

test("homepage critical path has no concierge or spatial runtime import", () => {
  for (const path of [
    "src/pages/en/index.astro",
    "src/pages/vi/index.astro",
    "src/layouts/BaseLayout.astro",
  ]) {
    const source = read(path);
    assert.doesNotMatch(
      source,
      /^\s*import\s+.*(?:concierge|spatial|webgl|three|babylon).*$/gim,
      `${path} must not statically import high-risk C3 runtime`,
    );
  }
});
