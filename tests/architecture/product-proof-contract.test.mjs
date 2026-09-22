import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const schema = readFileSync("src/lib/product-schema.ts", "utf8");
const config = readFileSync("src/content.config.ts", "utf8");
const flagship = readFileSync(
  "src/components/sections/FlagshipProof.astro",
  "utf8",
);
const productVisual = readFileSync(
  "src/components/product/ProductVisual.astro",
  "utf8",
);
const profile = readFileSync("src/pages/products/[slug].astro", "utf8");

test("product proof screenshot is a local sized artifact contract", () => {
  assert.match(schema, /screenshot:\s*productScreenshot/);
  assert.match(schema, /src:\s*z[\s.]*string\(/);
  assert.match(schema, /alt:\s*z\.string/);
  assert.match(schema, /width:\s*z\.number/);
  assert.match(schema, /height:\s*z\.number/);
  assert.match(schema, /\/products\//);
  assert.doesNotMatch(schema, /screenshot:\s*z\.string\(\)\.optional\(\)/);
});

test("product action and proof URLs require https schemes", () => {
  assert.match(schema, /httpsUrl/);
  assert.match(schema, /isHttpsUrl|isPublicClaimHttpsUrl/);
  assert.match(schema, /href:\s*httpsUrl/);
  assert.match(schema, /publicUrl:\s*httpsUrl/);
  assert.match(schema, /repositoryUrl:\s*httpsUrl/);
  assert.match(config, /from ["']@\/lib\/product-schema["']/);
});

test("public product truth rejects incoherent maturity claims", () => {
  assert.match(schema, /PUBLIC_LABEL_COHERENCE/);
  assert.match(schema, /public product cannot have private availability/);
  assert.match(schema, /publicLabel .* is incoherent with lifecycle/);
  assert.match(schema, /if\s*\(\s*!value\.public\s*\)\s*return/);
});

test("public products require verified capabilities distinct from jobs", () => {
  assert.match(schema, /capabilities/);
  assert.match(schema, /jobs/);
  assert.match(schema, /capabilities\.length/);
});

test("ProductVisual owns intrinsic screenshot rendering without owning product truth", () => {
  assert.match(productVisual, /CollectionEntry<"products">/);
  assert.match(productVisual, /data-product-visual/);
  assert.match(productVisual, /screenshot\.src/);
  assert.match(productVisual, /screenshot\.alt/);
  assert.match(productVisual, /screenshot\.width/);
  assert.match(productVisual, /screenshot\.height/);
  assert.match(productVisual, /loading=\{loading\}/);
  assert.match(productVisual, /decoding="async"/);
  assert.doesNotMatch(
    productVisual,
    /data\.(?:name|shortDescription|capabilities|jobs|publicLabel)/,
  );
});

test("FlagshipProof renders capabilities through the shared ProductVisual", () => {
  assert.match(flagship, /capabilities\.slice\(0,\s*3\)/);
  assert.doesNotMatch(flagship, /data\.jobs\.slice/);
  assert.match(flagship, /ProductVisual/);
  assert.match(flagship, /screenshot=\{screenshot\}/);
});

test("product profile exposes public status without internal enums", () => {
  assert.match(profile, /data\.publicLabel/);
  assert.doesNotMatch(profile, /data\.lifecycle/);
  assert.doesNotMatch(profile, /data\.availability/);
  assert.match(profile, /Main capabilities|capabilities/);
  assert.match(profile, /screenshot\.src/);
  assert.match(profile, /width=\{screenshot\.width\}/);
  assert.match(profile, /height=\{screenshot\.height\}/);
  assert.match(profile, /ogImage=\{data\.proof\.screenshot\?\.src\}/);
});
