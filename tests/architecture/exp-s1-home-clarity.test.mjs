/**
 * Experience v6 S1 — home clarity contract (source level).
 * Complements tests/e2e/exp-s1-home-caps.spec.ts, which measures the rendered
 * page. Here: the hero binds to registry fields, the removed bands stay off
 * the home, and slogans are not re-stacked in the shell.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const LOCALES = ["en", "vi", "zh", "zh-hant"];
const read = (path) => readFileSync(path, "utf8");

test("hero flagship statements resolve to registry fields; the H1 is the site promise", () => {
  const hero = read("src/components/sections/Hero.astro");
  assert.match(hero, /productCopy\(flagship\.data,\s*lang\)/);
  // Experience v6 S2 (Owner 2026-10-01): H1 = the existing site proposition,
  // not the registry job line.
  assert.match(hero, /SITE\.proposition/);
  assert.doesNotMatch(hero, /copy\.jobs\[0\]/);
  assert.match(hero, /copy\??\.shortDescription/);
  assert.match(hero, /flagship\.data\.name/);
  assert.match(hero, /resolveLifecycleCta/);
  // Only the company fallback (empty registry) may carry authored sentences,
  // and they are the existing tagline/proposition, not new claims.
  assert.doesNotMatch(hero, /SITE\.supporting|SITE\.motto/);
  assert.doesNotMatch(hero, /BrandLockup/);
});

test("every locale home renders one hero, no removed band, one quiet proof link", () => {
  for (const lang of LOCALES) {
    const source = read(`src/pages/${lang}/index.astro`);
    assert.equal((source.match(/<Hero\b/g) ?? []).length, 1, lang);
    for (const removed of [
      "OneHouse",
      "AboutBlueSkyz",
      "NextStep",
      "MaisonIndex",
      "TrustLedger",
      "EvidenceTeaser",
    ]) {
      assert.doesNotMatch(
        source,
        new RegExp(`\\b${removed}\\b`),
        `${lang} ${removed}`,
      );
    }
    assert.match(source, /<ProofBand lang="/, lang);
  }
});

test("the hero declares exactly one primary action and one quiet secondary", () => {
  const hero = read("src/components/sections/Hero.astro");
  // One per branch (registry flagship | empty-registry fallback); the rendered
  // count is exactly one and is measured by tests/e2e/exp-s1-home-caps.spec.ts.
  assert.equal((hero.match(/data-hero-primary/g) ?? []).length, 2);
  assert.equal((hero.match(/<ButtonLink\b/g) ?? []).length, 2);
  assert.equal((hero.match(/data-hero-secondary/g) ?? []).length, 1);
  assert.doesNotMatch(hero, /variant="on-ink"/);
});

test("the shell states the brand tagline once and no second slogan", () => {
  const footer = read("src/components/layout/Footer.astro");
  assert.match(footer, /taglineLead/);
  assert.doesNotMatch(
    footer,
    /SITE\.proposition|SITE\.motto|\{motto\}|\{proposition\}/,
  );
  const journey = read("src/lib/journey.ts");
  assert.match(journey, /"": \[\]/, "home carries no Next steps pill row");
});
