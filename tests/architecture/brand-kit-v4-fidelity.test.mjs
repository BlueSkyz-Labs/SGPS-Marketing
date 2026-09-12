/**
 * Brand Kit v4 fidelity guard.
 * Every published brand asset must stay byte-identical to its master in the
 * committed kit mirror (brand/blueskyz-production-v4), the CSS token layer
 * must carry the kit's values, and the document head must keep the
 * favicon/theme contract. Drift in any of these fails the build.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const KIT = "brand/blueskyz-production-v4";

const FAVICON_FILES = [
  "android-chrome-192x192.png",
  "android-chrome-512x512.png",
  "apple-touch-icon.png",
  "browserconfig.xml",
  "favicon.ico",
  "favicon.svg",
  "icon-1024x1024.png",
  "icon-128x128.png",
  "icon-150x150.png",
  "icon-16x16.png",
  "icon-180x180.png",
  "icon-192x192.png",
  "icon-256x256.png",
  "icon-32x32.png",
  "icon-384x384.png",
  "icon-48x48.png",
  "icon-512x512.png",
  "icon-64x64.png",
  "mstile-150x150.png",
  "mstile-310x310.png",
  "safari-pinned-tab.svg",
  "site.webmanifest",
];

const MASKABLE_FILES = [
  "android-maskable-192x192.png",
  "android-maskable-512x512.png",
];

const APPLE_FILES = [
  "apple-touch-icon-120x120.png",
  "apple-touch-icon-152x152.png",
  "apple-touch-icon-167x167.png",
  "apple-touch-icon-180x180.png",
];

const PAIRS = [
  ...FAVICON_FILES.map((file) => [
    `${KIT}/03_ICONS/01_FAVICON_PWA/${file}`,
    `public/icons/${file}`,
  ]),
  ...MASKABLE_FILES.map((file) => [
    `${KIT}/03_ICONS/01_FAVICON_PWA/MASKABLE/${file}`,
    `public/icons/MASKABLE/${file}`,
  ]),
  ...APPLE_FILES.map((file) => [
    `${KIT}/03_ICONS/01_FAVICON_PWA/APPLE/${file}`,
    `public/icons/APPLE/${file}`,
  ]),
  [
    `${KIT}/03_ICONS/01_FAVICON_PWA/browserconfig.xml`,
    "public/browserconfig.xml",
  ],
  [
    `${KIT}/02_LOGOS/01_VECTOR_SVG/FULL_LOCKUPS/blueskyzlabs_horizontal_flat_dark.svg`,
    "public/brand/blueskyz/v4/logos/horizontal-flat-dark.svg",
  ],
  [
    `${KIT}/02_LOGOS/01_VECTOR_SVG/FULL_LOCKUPS/blueskyzlabs_horizontal_flat_light.svg`,
    "public/brand/blueskyz/v4/logos/horizontal-flat-light.svg",
  ],
  [
    `${KIT}/02_LOGOS/01_VECTOR_SVG/FULL_LOCKUPS/blueskyzlabs_horizontal_reverse_white.svg`,
    "public/brand/blueskyz/v4/logos/horizontal-reverse-white.svg",
  ],
  [
    `${KIT}/04_DIGITAL/01_WEBSITE/website_hero_1920x1080.png`,
    "public/brand/blueskyz/v4/hero/website_hero_1920x1080.png",
  ],
  [
    `${KIT}/04_DIGITAL/10_WEB_OPTIMIZED/website_hero_1920x1080.webp`,
    "public/brand/blueskyz/v4/hero/website_hero_1920x1080.webp",
  ],
  [
    `${KIT}/04_DIGITAL/10_WEB_OPTIMIZED/website_hero_1920x1080.avif`,
    "public/brand/blueskyz/v4/hero/website_hero_1920x1080.avif",
  ],
  ...[
    ["intelligence", "intelligence"],
    ["elevation", "elevation"],
    ["trust", "trust"],
    ["impact", "impact"],
  ].map(([icon, principle]) => [
    `${KIT}/03_ICONS/02_BRAND_PRINCIPLES/${icon}.svg`,
    `public/brand/blueskyz/v4/principles/${principle}.svg`,
  ]),
  ...["apexagent", "fluentarc", "sotam", "sotro", "vungtaylai"].flatMap(
    (product) => [
      [
        `${KIT}/03_ICONS/03_PRODUCT_ICONS/${product}.svg`,
        `public/brand/blueskyz/v4/products/${product}.svg`,
      ],
      [
        `${KIT}/06_PRODUCT_BRANDS/01_LOCKUPS_SVG/${product}_endorsed_lockup_dark.svg`,
        `public/brand/blueskyz/v4/products/${product}_endorsed_lockup_dark.svg`,
      ],
      [
        `${KIT}/06_PRODUCT_BRANDS/01_LOCKUPS_SVG/${product}_endorsed_lockup_light.svg`,
        `public/brand/blueskyz/v4/products/${product}_endorsed_lockup_light.svg`,
      ],
    ],
  ),
  ...[`tokens.css`, `tokens.json`, `tokens.dtcg.json`].map((file) => [
    `${KIT}/07_DESIGN_TOKENS/${file}`,
    `public/brand/blueskyz/v4/tokens/${file}`,
  ]),
];

test("every published v4 asset is byte-identical to the kit master", () => {
  const drifted = [];
  for (const [kitPath, publicPath] of PAIRS) {
    assert.ok(existsSync(kitPath), `kit master missing: ${kitPath}`);
    assert.ok(existsSync(publicPath), `published asset missing: ${publicPath}`);
    const kitBytes = readFileSync(kitPath);
    const publicBytes = readFileSync(publicPath);
    if (!kitBytes.equals(publicBytes)) {
      drifted.push(publicPath);
    }
  }
  assert.deepEqual(
    drifted,
    [],
    `assets drifted from the kit master: ${drifted}`,
  );
});

test("the CSS token layer carries the kit's brand values", () => {
  const css = readFileSync("src/styles/global.css", "utf8").toLowerCase();
  const tokens = JSON.parse(
    readFileSync(`${KIT}/07_DESIGN_TOKENS/tokens.json`, "utf8"),
  );
  // Pure black/white are normative primitives, not UI colors.
  const PRIMITIVES = new Set(["#000000", "#ffffff"]);
  for (const value of Object.values(tokens.color.brand)) {
    if (PRIMITIVES.has(String(value).toLowerCase())) continue;
    assert.ok(
      css.includes(String(value).toLowerCase()),
      `global.css must carry kit brand color ${value}`,
    );
  }
  for (const value of Object.values(tokens.color.semantic)) {
    assert.ok(
      css.includes(String(value).toLowerCase()),
      `global.css must carry kit semantic color ${value}`,
    );
  }
  for (const value of [
    tokens.motion.fast,
    tokens.motion.normal,
    tokens.motion.slow,
  ]) {
    assert.ok(
      css.includes(String(value).toLowerCase()),
      `global.css must carry kit motion value ${value}`,
    );
  }
  assert.ok(css.includes("--brand-gradient-hero"), "hero gradient token");
  assert.ok(css.includes('data-theme="dark"'), "dormant dark semantics block");
});

test("the document head keeps the kit favicon and theme contract", () => {
  const layout = readFileSync("src/layouts/BaseLayout.astro", "utf8");
  assert.match(layout, /href="\/icons\/favicon\.svg" type="image\/svg\+xml"/);
  assert.match(layout, /href="\/icons\/favicon\.ico" sizes="any"/);
  assert.match(layout, /href="\/icons\/apple-touch-icon\.png"/);
  assert.match(layout, /href="\/icons\/site\.webmanifest"/);
  assert.match(layout, /name="theme-color" content="#0B1020"/);
});

test("the committed kit mirror reports production v4.0.0", () => {
  const version = readFileSync(`${KIT}/00_START_HERE/VERSION.txt`, "utf8");
  assert.match(version, /4\.0\.0/);
});

test("every brandAssets registry path resolves under public/", () => {
  const registry = readFileSync("src/data/brand-assets.ts", "utf8");
  const paths = [...registry.matchAll(/"\/brand\/[^"]+"/g)].map((match) =>
    match[0].slice(1, -1),
  );
  assert.ok(paths.length >= 20, "registry must declare the published assets");
  const missing = paths.filter((path) => !existsSync(`public${path}`));
  assert.deepEqual(missing, [], `registry paths missing on disk: ${missing}`);
});

test("the kit motion easing is carried as a parity alias", () => {
  const css = readFileSync("src/styles/global.css", "utf8").toLowerCase();
  assert.ok(
    css.includes("cubic-bezier(0.2, 0, 0, 1)"),
    "global.css must carry the kit ease-standard curve",
  );
});

test("public review dates render as semantic <time datetime>", () => {
  const details = readFileSync(
    "src/components/integrity/EvidenceDetails.astro",
    "utf8",
  );
  const passport = readFileSync(
    "src/components/integrity/EvidencePassport.astro",
    "utf8",
  );
  assert.match(details, /<time datetime=\{review\.reviewedOn\}>/);
  assert.match(passport, /<time datetime=\{passport\.reviewedOn\}>/);
});
