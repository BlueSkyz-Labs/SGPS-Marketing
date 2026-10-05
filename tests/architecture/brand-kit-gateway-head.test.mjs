/**
 * Brand Kit v4 conformance guard for the language gateway (src/pages/index.astro).
 * The gateway is the only indexable page that does not render through
 * BaseLayout, so it must carry the kit head contract itself:
 * 00_START_HERE/IMPLEMENTATION/favicon-head.html (icons + manifest),
 * the website Open Graph card (04_DIGITAL/01_WEBSITE, 1200x630) and the kit alt
 * text for the logo (BRAND_COPY_LIBRARY.md: "BlueSkyz Labs logo").
 * Audit record: docs/brand/BRAND_KIT_CONFORMANCE_2026-10-01.md.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const KIT = "brand/blueskyz-production-v4/00_START_HERE";

/** Returns the list of kit-contract violations found in the gateway source. */
export function gatewayKitViolations(source) {
  const violations = [];
  const need = (label, pattern) => {
    if (!pattern.test(source)) violations.push(label);
  };
  need(
    "favicon.svg link",
    /href="\/icons\/favicon\.svg" type="image\/svg\+xml"/,
  );
  need("favicon.ico link", /href="\/icons\/favicon\.ico" sizes="any"/);
  need("apple-touch-icon link", /href="\/icons\/apple-touch-icon\.png"/);
  need("manifest link", /href="\/icons\/site\.webmanifest"/);
  need("og:image", /property="og:image" content=\{ogImageUrl\}/);
  need("og:image:width", /property="og:image:width"/);
  need("og:image:height", /property="og:image:height"/);
  need("og:image:alt", /property="og:image:alt"/);
  need(
    "twitter summary_large_image",
    /name="twitter:card" content="summary_large_image"/,
  );
  need("twitter:image", /name="twitter:image" content=\{ogImageUrl\}/);
  need("default OG asset", /defaultOgImagePath\(\)/);
  need("kit logo alt", /alt="BlueSkyz Labs logo"/);
  if (/<link[^>]+rel="stylesheet"/.test(source)) {
    violations.push("gateway must stay stylesheet-free (ADR 0009)");
  }
  return violations;
}

const gateway = readFileSync("src/pages/index.astro", "utf8");

test("the kit's own copy library fixes the logo alt text this guard enforces", () => {
  const copy = readFileSync(
    `${KIT}/IMPLEMENTATION/BRAND_COPY_LIBRARY.md`,
    "utf8",
  );
  assert.match(copy, /Logo: "BlueSkyz Labs logo"/);
});

test("the kit head contract still lists the icon and manifest links", () => {
  const head = readFileSync(`${KIT}/IMPLEMENTATION/favicon-head.html`, "utf8");
  for (const href of [
    "/icons/favicon.svg",
    "/icons/favicon.ico",
    "/icons/apple-touch-icon.png",
    "/icons/site.webmanifest",
  ]) {
    assert.ok(head.includes(href), `kit favicon-head.html lists ${href}`);
  }
});

test("the language gateway carries the kit head, OG card and logo alt", () => {
  assert.deepEqual(gatewayKitViolations(gateway), []);
});

test("negative proof: dropping each kit element from the gateway is detected", () => {
  const mutations = [
    [
      /<link rel="icon" href="\/icons\/favicon\.svg"[^>]*\/>/,
      "favicon.svg link",
    ],
    [/<link rel="manifest"[^>]*\/>/, "manifest link"],
    [/<meta property="og:image" content=\{ogImageUrl\} \/>/, "og:image"],
    [/<meta name="twitter:card"[^>]*\/>/, "twitter summary_large_image"],
    [/alt="BlueSkyz Labs logo"/, "kit logo alt"],
  ];
  for (const [pattern, label] of mutations) {
    const mutated = gateway.replace(pattern, "");
    assert.notEqual(
      mutated,
      gateway,
      `mutation for ${label} must change source`,
    );
    assert.ok(
      gatewayKitViolations(mutated).includes(label),
      `removing ${label} must be reported`,
    );
  }
  assert.ok(
    gatewayKitViolations(
      gateway.replace(
        "</head>",
        '<link rel="stylesheet" href="/x.css" /></head>',
      ),
    ).some((v) => v.includes("stylesheet-free")),
  );
});
