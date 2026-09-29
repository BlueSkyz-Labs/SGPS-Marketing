import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("v4 hero uses the supplied website artwork and flat lockup", () => {
  const hero = readFileSync("src/components/sections/Hero.astro", "utf8");
  const lockup = readFileSync("src/components/brand/BrandLockup.astro", "utf8");
  const site = readFileSync("src/data/site.ts", "utf8");
  // C2 (approved design §9 W1 + plan Task 5) transforms the hero from a framed
  // brand-art card into an integrated Horizon field, so the brand raster is no
  // longer required IN the hero. Brand fidelity still means the v4 lockup, the
  // ink plane and the tagline contract — and the removed framed card must not
  // come back.
  assert.match(hero, /BrandLockup/);
  assert.match(hero, /HorizonField/);
  assert.match(hero, /hero-plane--ink/);
  assert.doesNotMatch(hero, /hero-art-frame|brandAssets\.hero/);
  assert.match(site, /taglineLead: "Intelligence\. Elevated\."/);
  assert.match(site, /taglineAccent: "Impact\."/);
  assert.match(
    lockup,
    /\/brand\/blueskyz\/v4\/logos\/horizontal-flat-light\.svg/,
  );
  assert.match(
    lockup,
    /\/brand\/blueskyz\/v4\/logos\/horizontal-reverse-white\.svg/,
  );
});

test("v4 principle icons remain available while C2 home uses the editorial interlude", () => {
  // The reusable S+ matrix remains intact for any surface that still needs the
  // operating-model detail, but C2 Task 10 deliberately removes the homepage
  // dependency on that equal-card treatment in favor of an editorial interlude.
  const matrix = readFileSync(
    "src/components/experience/OneHouseMatrix.astro",
    "utf8",
  );
  const assets = readFileSync("src/data/brand-assets.ts", "utf8");
  for (const name of ["intelligence", "elevation", "trust", "impact"]) {
    assert.ok(
      matrix.includes("brandAssets.principles." + name),
      "matrix must render the " + name + " principle icon",
    );
    assert.match(assets, new RegExp(name + ":"));
  }

  const house = readFileSync("src/components/sections/OneHouse.astro", "utf8");
  assert.doesNotMatch(house, /OneHouseMatrix/);
  assert.match(house, /data-one-house-editorial/);
  assert.match(house, /data-one-house-concept/);
});

test("v4 principle matrix is four official cards, trilingual, and reflow-safe", () => {
  // W4.1 upgrades the matrix from list rows to four distinct cards. The matrix
  // stays a reusable library surface (C2 keeps the homepage on the editorial
  // interlude, asserted above), so the acceptance is asserted on the source that
  // renders it: one official SVG per card, one card per principle, trilingual
  // copy from the single label source, and the same shrink/break invariants the
  // product card needed at 200% text.
  const matrix = readFileSync(
    "src/components/experience/OneHouseMatrix.astro",
    "utf8",
  );

  const icons = matrix.match(/brandAssets\.principles\.[a-z]+/g) ?? [];
  assert.deepEqual(
    icons,
    [
      "brandAssets.principles.intelligence",
      "brandAssets.principles.elevation",
      "brandAssets.principles.trust",
      "brandAssets.principles.impact",
    ],
    "each card must render its own official principle SVG exactly once",
  );
  assert.match(
    matrix,
    /data-principle-card=\{principle\.id\}/,
    "the four cards must be the four matrix entries, not a partial or repeated set",
  );
  assert.match(matrix, /PRINCIPLE_MATRIX\.map\(/);
  assert.match(
    matrix,
    /rounded-\[var\(--bsl-radius-lg\)\][^"]*border border-\[var\(--border-subtle\)\][^"]*bg-\[var\(--surface-raised\)\]/,
    "cards use the kit radius, the themed border token and the raised surface token — no raw palette",
  );
  assert.doesNotMatch(
    matrix,
    /#[0-9a-f]{3,8}\b/i,
    "no raw hex may enter the cards; brand colour comes from tokens",
  );

  assert.match(
    matrix,
    /lang\?: Language/,
    "the matrix must accept the canonical locale set (en|vi|zh), so a zh surface compiles",
  );
  assert.doesNotMatch(
    matrix,
    /"en"\s*\|\s*"vi"/,
    "a two-locale union is the pre-W4 contract: zh would silently fall back to another locale",
  );
  assert.doesNotMatch(
    matrix,
    /(?:en|vi|zh)\s*:\s*"/,
    "no per-page locale strings may be authored in the component: copy comes from PRINCIPLE_MATRIX and its labels from the shared label source",
  );
  assert.match(matrix, /SHARED_LABELS\.brandPrinciples/);
  assert.match(matrix, /PRINCIPLE_DIMENSION_LABELS/);

  const site = readFileSync("src/data/site.ts", "utf8");
  const label = site.match(/brandPrinciples:\s*\{([\s\S]*?),\s*\}/)?.[1] ?? "";
  for (const locale of ["en", "vi", "zh"]) {
    assert.match(
      label,
      new RegExp(`\\b${locale}:\\s*"`),
      `SHARED_LABELS.brandPrinciples must carry ${locale}`,
    );
  }

  // Reflow: a card grid that pins min-content overflows at 200% text.
  assert.match(matrix, /class="mt-10 grid min-w-0 gap-5/);
  assert.match(matrix, /class="flex min-w-0 flex-col/);
  const breaks = (matrix.match(/\[overflow-wrap:anywhere\]/g) ?? []).length;
  assert.ok(
    breaks >= 4,
    `every record-driven text node must break rather than overflow (got ${breaks})`,
  );
});

test("v4 copy library description is the public brand proposition", () => {
  const site = readFileSync("src/data/site.ts", "utf8");
  assert.match(
    site,
    /We build intelligent products that empower people and elevate the way work gets done\./,
  );
  assert.match(site, /A higher perspective builds a brighter tomorrow\./);
});
