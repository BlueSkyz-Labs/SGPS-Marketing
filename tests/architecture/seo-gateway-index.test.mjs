/**
 * Owner decision F16 (2026-10-01): the language gateway `/` is indexable and is
 * the hreflang x-default of the home cluster only. Negative proofs break each
 * invariant on purpose.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { isHomeClusterPath, xDefaultPath } from "../../src/lib/seo.ts";

const gateway = readFileSync("src/pages/index.astro", "utf8");
const layout = readFileSync("src/layouts/BaseLayout.astro", "utf8");
const sitemap = readFileSync("src/pages/sitemap.xml.ts", "utf8");

const TITLE = "BlueSkyz Labs | Choose your language";
const DESCRIPTION =
  "BlueSkyz Labs: We build intelligent products that empower people and elevate the way work gets done. Operating since 2026. Choose from four languages.";

const gatewayIsIndexable = (src) =>
  !/content="noindex, follow"/.test(src) &&
  /rel="canonical"/.test(src) &&
  /isNonProductionSiteUrl\(SITE\.url\)/.test(src);

test("gateway is indexable with a self canonical and the non-prod gate intact", () => {
  assert.equal(gatewayIsIndexable(gateway), true);
  assert.match(gateway, /canonicalForPath\("\/", SITE\.url\)/);
  assert.match(gateway, /hreflang="x-default"/);
});

test("gateway title and description are the approved single strings", () => {
  assert.ok(gateway.includes(`const title = "${TITLE}"`));
  assert.match(
    gateway,
    /const description =\s*`\$\{SITE\.name\}: \$\{SITE\.proposition\} Operating since \$\{SITE\.foundedYear\}\. Choose from four languages\.`;/,
  );
  assert.ok([...DESCRIPTION].length <= 160);
  assert.equal(TITLE.split(" | ").length, 2);
});

test("home cluster x-default is the gateway; other pages keep /en/", () => {
  for (const home of ["/", "/en/", "/vi/", "/zh/", "/zh-hant/"]) {
    assert.equal(isHomeClusterPath(home), true, home);
    assert.equal(xDefaultPath(home), "/", home);
  }
  for (const page of [
    "/vi/about/",
    "/zh-hant/products/",
    "/zh/products/sotro/",
    "/en/support/",
  ]) {
    assert.equal(isHomeClusterPath(page), false, page);
    assert.equal(
      xDefaultPath(page),
      page.replace(/^\/[a-z-]+\//, "/en/"),
      page,
    );
  }
});

test("layout derives x-default from the shared helper", () => {
  assert.match(layout, /canonicalForPath\(xDefaultPath\(path\), SITE\.url\)/);
});

test("sitemap lists the gateway, still gated by the non-prod check", () => {
  assert.match(sitemap, /absoluteUrl\(SITE\.url, "\/"\)/);
  assert.match(sitemap, /isNonProductionSiteUrl\(SITE\.url\)/);
});

test("negative proof: noindex gateway, missing canonical or dropped gate is rejected", () => {
  assert.equal(
    gatewayIsIndexable(
      gateway.replace(
        "{robotsNoindex",
        '<meta name="robots" content="noindex, follow" />{robotsNoindex',
      ),
    ),
    false,
  );
  assert.equal(
    gatewayIsIndexable(gateway.replace('rel="canonical"', 'rel="x"')),
    false,
  );
  assert.equal(
    gatewayIsIndexable(gateway.replace("isNonProductionSiteUrl(", "noop(")),
    false,
  );
  assert.equal(xDefaultPath("/vi/about/") === "/", false);
});
