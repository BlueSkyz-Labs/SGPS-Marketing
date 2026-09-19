import assert from "node:assert/strict";
import test from "node:test";

const { hreflangLinks, PUBLIC_STATIC_PATHS } =
  await import("../../src/lib/seo.ts");

test("hreflangLinks returns en, vi and zh for every path", () => {
  const links = hreflangLinks("/en/about/", "https://blueskyzlabs.com");
  assert.equal(links.length, 3);
  assert.equal(links[0].hreflang, "en");
  assert.equal(links[1].hreflang, "vi");
  assert.equal(links[2].hreflang, "zh-Hans");
  assert.ok(links[0].href.includes("/en/about/"));
  assert.ok(links[1].href.includes("/vi/about/"));
  assert.ok(links[2].href.includes("/zh/about/"));
});

test("hreflangLinks handles root path", () => {
  const links = hreflangLinks("/", "https://blueskyzlabs.com");
  assert.equal(links.length, 3);
  assert.ok(links[0].href.includes("/en/"));
  assert.ok(links[1].href.includes("/vi/"));
  assert.ok(links[2].href.includes("/zh/"));
});

test("PUBLIC_STATIC_PATHS includes en, vi and zh", () => {
  const enPaths = PUBLIC_STATIC_PATHS.filter((p) => p.startsWith("/en/"));
  const viPaths = PUBLIC_STATIC_PATHS.filter((p) => p.startsWith("/vi/"));
  const zhPaths = PUBLIC_STATIC_PATHS.filter((p) => p.startsWith("/zh/"));
  assert.ok(enPaths.length >= 7);
  assert.ok(viPaths.length >= 7);
  assert.ok(zhPaths.length >= 7);
});

test("hreflang values are valid BCP 47", () => {
  const links = hreflangLinks("/en/about/", "https://blueskyzlabs.com");
  for (const link of links) {
    assert.match(link.hreflang, /^[a-z]{2}(-[A-Za-z0-9]+)*$/);
  }
});
