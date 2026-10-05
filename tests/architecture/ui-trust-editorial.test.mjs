import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

// UI upgrade WP-D (F3, F12): source contracts with negative proofs.

const strip = (t) => t.replace(/\/\*[\s\S]*?\*\//g, "");

/** The page H1 must step to the 44 px display size (--size-8) from 768 px. */
export function h1StepsUp(source) {
  const css = strip(source);
  const media = /@media \(min-width: 48rem\) \{([\s\S]*?)\n  \}/.exec(css);
  return Boolean(
    media &&
    /\.page-header__title \{[^}]*font-size: var\(--size-8\);/.test(media[1]) &&
    /<h1 class="page-header__title type-d2/.test(source),
  );
}

/** Each fact renders dt before dd inside one row of a dl. */
export function factsKeepOrder(source) {
  const dl = /<dl\b[\s\S]*?<\/dl>/.exec(source)?.[0] ?? "";
  const dt = dl.indexOf("<dt");
  const dd = dl.indexOf("<dd");
  return (
    dt > -1 &&
    dd > dt &&
    !/order:|flex-direction:\s*\w+-reverse/.test(strip(source))
  );
}

test("PageHeader steps the H1 up to --size-8 from 768 px", () => {
  assert.ok(
    h1StepsUp(readFileSync("src/components/layout/PageHeader.astro", "utf8")),
  );
});

test("negative proof: a header that keeps the H1 at 32 px is rejected", () => {
  assert.equal(
    h1StepsUp(
      '<h1 class="page-header__title type-d2">x</h1><style>.x{}</style>',
    ),
    false,
  );
});

test("trust facts render as dt then dd, with no visual reordering", () => {
  assert.ok(
    factsKeepOrder(
      readFileSync("src/components/trust/TrustFacts.astro", "utf8"),
    ),
  );
  for (const body of ["SecurityBody", "PrivacyBody"]) {
    const source = readFileSync(`src/components/trust/${body}.astro`, "utf8");
    assert.match(source, /<TrustFacts\b/, body);
    // Security keeps no section headings (v8 W5a); facts are not headings.
    assert.doesNotMatch(source, /<h2\b/, body);
  }
});

test("negative proof: dd before dt, or CSS reordering, is rejected", () => {
  assert.equal(
    factsKeepOrder("<dl><div><dd>b</dd><dt>a</dt></div></dl>"),
    false,
  );
  assert.equal(
    factsKeepOrder(
      "<dl><div><dt>a</dt><dd>b</dd></div></dl><style>.r{order: 2;}</style>",
    ),
    false,
  );
});

test("About pages drop the eyebrow that repeated the H1", () => {
  for (const lang of ["en", "vi", "zh", "zh-hant"]) {
    const page = readFileSync(`src/pages/${lang}/about.astro`, "utf8");
    assert.doesNotMatch(page, /eyebrow=/, lang);
  }
});
