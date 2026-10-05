import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

/**
 * v8 W3 (product pages). Source-level invariants; the rendered counterparts
 * (exactly one / zero [data-primary-action], Availability without a store CTA,
 * Sổ Trọ height at 1440) are asserted in tests/e2e/v8-w3-product-pages.spec.ts.
 * Each predicate is proven to fail on a broken input.
 */
const LANGS = ["en", "vi", "zh", "zh-hant"];
const page = (lang) =>
  readFileSync(`src/pages/${lang}/products/[slug].astro`, "utf8");
const ACCESS = readFileSync("src/components/product/AppAccess.astro", "utf8");
const COPY = readFileSync(
  "src/components/product/product-page-copy.ts",
  "utf8",
);

/** The primary action is one mutually exclusive chain: Try, else See the screens, else none. */
const primaryActionIsSingle = (src) =>
  (src.match(/data-primary-action/g) ?? []).length === 2 &&
  /showTryCta \? \([\s\S]*?data-primary-action[\s\S]*?\) : showcase \? \([\s\S]*?data-primary-action[\s\S]*?\) : null/.test(
    src,
  ) &&
  /href="#profile-showcase"/.test(src);

test("product pages render at most one primary action (See the screens, or none)", () => {
  for (const lang of LANGS) {
    assert.ok(primaryActionIsSingle(page(lang)), lang);
  }
});

test("negative proof: a second primary action is detected", () => {
  const broken = `${page("en")}\n<ButtonLink href="/x" data-primary-action>Extra</ButtonLink>`;
  assert.equal(primaryActionIsSingle(broken), false);
});

/** No anchor may render before the `live` (store-listed, available) branch. */
const availabilityHasNoStoreCta = (src) => {
  const [pending] = src.split(/^---$/m)[2].split("live.map(");
  return (
    !/<a[\s>]/.test(pending) && !/Google Play|App Store|Get it on/.test(pending)
  );
};

test("the Availability line never renders a store CTA for an in-development app", () => {
  assert.ok(availabilityHasNoStoreCta(ACCESS));
  assert.match(ACCESS, /data-mobile-state="in-development"/);
  assert.match(
    ACCESS,
    /app\.state === "available" && a\.app\.storeUrl|a\.app\.state === "available" && a\.app\.storeUrl/,
  );
});

test("negative proof: an anchor on the in-development branch is detected", () => {
  const broken = ACCESS.replace(
    '<span data-mobile-state="in-development">',
    '<a href="https://play.google.com/x" data-mobile-state="in-development">',
  );
  assert.notEqual(broken, ACCESS);
  assert.equal(availabilityHasNoStoreCta(broken), false);
});

/** Retired idioms and the unconfirmed Sổ Tâm tagline must not render (deck sro-12, OG-3). */
const RETIRED = /clear head|stand out|gentler|AI Journal for Clarity/i;

test("retired caption idioms and the unconfirmed Sổ Tâm tagline are absent", () => {
  const showcase = readFileSync("src/content/showcases/sotro.yaml", "utf8");
  assert.doesNotMatch(showcase, RETIRED);
  for (const lang of LANGS) assert.doesNotMatch(page(lang), RETIRED, lang);
  assert.doesNotMatch(COPY, RETIRED);
  assert.match(RETIRED.source, /clear head/);
  assert.ok(RETIRED.test("Collect with a clear head"));
});

test("Sổ Tâm renders no identity art (its tagline is unconfirmed)", () => {
  for (const lang of LANGS) {
    const src = page(lang);
    assert.match(src, /isIdentityArt/, lang);
    assert.match(src, /!showcase && isIdentityArt/, lang);
    assert.doesNotMatch(src, /<NoCaptureStage[^>]*\n?[^>]*isIdentityArt/, lang);
  }
});

test("the endorsed lockup is hidden below 480 px", () => {
  for (const lang of LANGS) {
    assert.match(
      page(lang),
      /@media \(max-width: 479px\) \{\s*\.profile-lockup \{\s*display: none;/,
      lang,
    );
  }
});

test("the 'What it does' list has at most five items", () => {
  assert.match(COPY, /WHAT_IT_DOES_MAX = 5/);
  const lists = [...COPY.matchAll(/whatItDoes: \[([\s\S]*?)\],\n\s*\},/g)];
  assert.ok(lists.length >= 8);
  for (const [, body] of lists) {
    assert.equal((body.match(/^\s+"/gm) ?? []).length, 5);
  }
});

test("the showcase leads with three phone captures and one desktop capture", () => {
  const showcase = readFileSync(
    "src/components/product/ProductShowcase.astro",
    "utf8",
  );
  assert.match(showcase, /phones\.slice\(0, 3\)/);
  assert.match(showcase, /desktops\.slice\(0, 1\)/);
  assert.match(showcase, /data-showcase-more/);
});
