/**
 * C2 — six-act homepage composition contract.
 * Source-level regression guard: the homepage hierarchy must remain
 * product-led (Hero → Flagship Theatre → Product House → One House → Trust →
 * About → Next Step) and must not drift back into an SGPS/control-surface
 * composition. Power-user surfaces are demoted from the homepage, never
 * deleted — their components and routes stay intact.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const LOCALES = ["en", "vi"];
const homePath = (lang) => `src/pages/${lang}/index.astro`;

/** Act components in the order the C2 design requires. */
const ACT_ORDER = ["Hero", "FlagshipTheatre", "ProductHouse", "ProofBand"];

/** Experience v6 S1: removed from the home (W10 deleted all but MaisonIndex). */
const REMOVED_FROM_HOME = [
  "OneHouse",
  "Trust",
  "AboutBlueSkyz",
  "NextStep",
  "MaisonIndex",
];

/** Power-user surfaces that must no longer lead the homepage. */
const DEMOTED_FROM_HOME = ["ExperienceSpine", "IntentLens", "Atlas"];

/** Rendered component tags, in source order, from a page's template body. */
function renderedComponents(source) {
  const body = source.split(/^---$/m).slice(2).join("---");
  const names = [];
  for (const match of body.matchAll(/<([A-Z][A-Za-z0-9]*)\b/g)) {
    names.push(match[1]);
  }
  return names;
}

/** Imported component names, from a page's frontmatter. */
function importedComponents(source) {
  const frontmatter = source.split(/^---$/m)[1] ?? "";
  return [...frontmatter.matchAll(/import\s+([A-Z][A-Za-z0-9]*)\s+from/g)].map(
    (match) => match[1],
  );
}

test("both locales render the S1 acts in the approved order", () => {
  for (const lang of LOCALES) {
    const source = readFileSync(homePath(lang), "utf8");
    const rendered = renderedComponents(source);
    const actSequence = rendered.filter((name) => ACT_ORDER.includes(name));
    assert.deepEqual(
      actSequence,
      ACT_ORDER,
      `${lang} homepage act order drifted from the S1 contract`,
    );
    for (const removed of REMOVED_FROM_HOME) {
      assert.ok(
        !rendered.includes(removed),
        `${lang} homepage must not render ${removed} (Experience v6 S1)`,
      );
    }
  }
});

test("power-user surfaces no longer lead the homepage", () => {
  for (const lang of LOCALES) {
    const source = readFileSync(homePath(lang), "utf8");
    for (const demoted of DEMOTED_FROM_HOME) {
      assert.ok(
        !importedComponents(source).includes(demoted),
        `${lang} homepage must not import ${demoted}`,
      );
      assert.ok(
        !renderedComponents(source).includes(demoted),
        `${lang} homepage must not render ${demoted}`,
      );
    }
  }
});

test("demoted surfaces are demoted, not deleted", () => {
  for (const demoted of DEMOTED_FROM_HOME) {
    const path = `src/components/experience/${demoted}.astro`;
    assert.ok(existsSync(path), `${demoted} must still exist at ${path}`);
  }
});

test("the flagship act consumes the product record instead of authoring facts", () => {
  const theatre = readFileSync(
    "src/components/product/FlagshipTheatre.astro",
    "utf8",
  );
  const house = readFileSync(
    "src/components/product/ProductHouse.astro",
    "utf8",
  );
  // Facts come from the record.
  assert.match(theatre, /data\.name/);
  assert.match(theatre, /productCopy\(data,\s*lang\)/);
  assert.match(theatre, /copy\.shortDescription/);
  assert.match(theatre, /copy\.jobs/);
  assert.match(theatre, /copy\.capabilities/);
  assert.match(theatre, /resolveLifecycleCta/);
  assert.match(theatre, /data-product-cta=\{cta\.verb\}/);
  assert.match(theatre, /data\.publicLabel/);
  assert.match(theatre, /data\.primaryAction/);
  // Experience v6 S2: the home hero states the brand promise (SITE.proposition)
  // and presents the flagship from the same record (shortDescription, status
  // chip, the one lifecycle-mapped action) with a labelled real capture; the
  // home mounts the flagship act in its compact form.
  const hero = readFileSync("src/components/sections/Hero.astro", "utf8");
  assert.match(hero, /productCopy\(flagship\.data,\s*lang\)/);
  assert.match(hero, /SITE\.proposition/);
  assert.match(hero, /<FlagshipCapture/);
  assert.match(hero, /copy\??\.shortDescription/);
  assert.match(hero, /copy\??\.statusLabel/);
  assert.match(hero, /resolveLifecycleCta/);
  assert.match(hero, /data-product-cta=\{cta\.verb\}/);
  assert.match(theatre, /compact\s*=\s*false/);
  assert.match(house, /data\.featuredTier/);
  // No invented product identity in the cinematic layer.
  assert.doesNotMatch(theatre, /\bLorem\b|placeholder product/i);
  assert.doesNotMatch(house, /\bLorem\b|placeholder product/i);
});

test("localized homepages show the flagship once and continue with other products", () => {
  for (const lang of LOCALES) {
    const source = readFileSync(homePath(lang), "utf8");
    assert.match(source, /<FlagshipTheatre\s+product=\{flagship\}/, lang);
    assert.match(source, /<FlagshipTheatre[^>]*\bcompact\b/s, lang);
    assert.match(
      source,
      new RegExp(
        `<ProductHouse products=\\{products\\} lang="${lang}" mode="continuation"`,
      ),
      lang,
    );
  }
});

test("the empty registry falls back honestly instead of fabricating a product", () => {
  const house = readFileSync(
    "src/components/product/ProductHouse.astro",
    "utf8",
  );
  const theatre = readFileSync(
    "src/components/product/FlagshipTheatre.astro",
    "utf8",
  );
  // Flagship renders nothing without a real flagship.
  assert.match(theatre, /if \(!product\) \{\s*return null;\s*\}/);
  // Product House shows the repository's proof-first statement when empty.
  assert.match(house, /products\.length === 0 \? \(/);
  assert.match(house, /ProofFirstEmptyState/);
});

test("homepages stay static-first: no client framework, no animation gate", () => {
  for (const lang of LOCALES) {
    const source = readFileSync(homePath(lang), "utf8");
    assert.doesNotMatch(source, /client:(load|only|visible|idle)/);
    assert.doesNotMatch(source, /React|Vue|Svelte|gsap|three\.js/i);
  }
});
