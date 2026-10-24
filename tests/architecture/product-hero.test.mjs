/**
 * Experience wave E (EX-01, EX-08, EX-22) source guard for the product profile.
 *
 * 1. The hero poster is the first story capture of the record (registry only,
 *    never a second asset): `heroScreen` resolves it from the showcase.
 * 2. Every locale page renders the hero through ProductHero with the three
 *    slots, the secondary contact action and the primary action chain, and the
 *    hero poster is decorative (alt="").
 * 3. The availability line no longer ends in a link (the contact action is the
 *    button) and keeps its full stop.
 * 4. Retired: the 01-05 numerals on the feature cards, the inline guide link.
 * 5. The coda "view larger" name carries the desktop kicker so it differs from
 *    the phone chapter with the same title.
 * Each rule has a negative proof.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { heroScreen } from "../../src/lib/product-hero.ts";

const LANGS = ["en", "vi", "zh", "zh-hant"];
const page = (lang) =>
  readFileSync(`src/pages/${lang}/products/[slug].astro`, "utf8");
const read = (path) => readFileSync(path, "utf8");

const screens = [
  { id: "a", surface: "desktop" },
  { id: "b", surface: "phone" },
  { id: "c", surface: "phone" },
];

test("heroScreen is the first story phone chapter, else the first phone", () => {
  assert.equal(
    heroScreen({ screens, story: { chapters: [{ screen: "c" }] } })?.id,
    "c",
  );
  assert.equal(heroScreen({ screens })?.id, "b");
  assert.equal(heroScreen(null), null);
  assert.equal(heroScreen({ screens: [screens[0]] }), null);
});

test("negative proof: the poster is never a desktop capture or an unknown id", () => {
  assert.notEqual(
    heroScreen({ screens, story: { chapters: [{ screen: "a" }] } })?.id,
    "a",
  );
  assert.equal(
    heroScreen({ screens, story: { chapters: [{ screen: "zzz" }] } })?.id,
    "b",
  );
});

const rendersHero = (src) =>
  /<ProductHero art=\{heroShot\}>/.test(src) &&
  /slot="intro"/.test(src) &&
  /slot="actions"/.test(src) &&
  /slot="status"/.test(src) &&
  /<ProductContactAction/.test(src) &&
  /heroScreen\(showcase\)/.test(src);

test("every locale page renders the hero poster layout with the contact action", () => {
  for (const lang of LANGS) assert.ok(rendersHero(page(lang)), lang);
});

test("negative proof: a page without the hero layout or the contact action is detected", () => {
  assert.equal(
    rendersHero(page("en").replace("<ProductContactAction", "<X")),
    false,
  );
  assert.equal(rendersHero(page("en").replace('slot="status"', "")), false);
});

test("the hero poster is decorative and lazy-sized", () => {
  const hero = read("src/components/product/ProductHero.astro");
  assert.match(hero, /alt=""/);
  assert.match(hero, /srcset=/);
  assert.match(hero, /max-height: 60vh/);
  assert.match(hero, /mask-image: linear-gradient\(to bottom/);
  assert.match(hero, /forced-colors: active/);
  assert.doesNotMatch(hero, /<script/);
});

test("the availability line carries no contact link; the button does", () => {
  const access = read("src/components/product/AppAccess.astro");
  assert.doesNotMatch(access, /\/contact\//);
  assert.doesNotMatch(access, /data-interim-note/);
  const action = read("src/components/product/ProductContactAction.astro");
  assert.match(action, /variant="secondary"/);
  assert.match(action, /data-interim-state/);
  assert.match(action, /\/contact\//);
});

test("retired idioms stay out: feature-card numerals and the inline guide link", () => {
  for (const lang of LANGS) {
    assert.doesNotMatch(page(lang), /profile-does__index/, lang);
    assert.doesNotMatch(page(lang), /padStart\(2, "0"\)/, lang);
  }
  const showcase = read("src/components/product/ProductShowcase.astro");
  assert.match(showcase, /variant="secondary"/);
  assert.doesNotMatch(showcase, /showcase__guide \{/);
  // The guide button sits between the video and the screens, not at the tail.
  assert.ok(
    showcase.indexOf("data-showcase-guide-link") <
      showcase.indexOf("heroPhones.length + heroDesktops.length"),
  );
  assert.ok(
    showcase.indexOf("showcase__video") <
      showcase.indexOf("data-showcase-guide-link"),
  );
});

test("negative proof: a feature numeral is detected", () => {
  assert.match(
    `${page("vi")}\n<span class="profile-does__index">01</span>`,
    /profile-does__index/,
  );
});

test("the coda link name carries the desktop kicker and matches its viewer label", () => {
  const story = read("src/components/product/FeatureStory.astro");
  assert.match(
    story,
    /aria-label=\{`\$\{t\.inspect\}: \$\{t\.desktop\}: \$\{story\.coda\.title\[lang\]\}/,
  );
  assert.match(
    story,
    /data-viewer-label=\{`\$\{t\.inspect\}: \$\{t\.desktop\}: \$\{story\.coda\.title\[lang\]\}/,
  );
});
