import assert from "node:assert/strict";
import test from "node:test";

const { hreflangLinks, PUBLIC_STATIC_PATHS } =
  await import("../../src/lib/seo.ts");

test("hreflangLinks returns both en and vi for every path", () => {
  const links = hreflangLinks("/en/about/", "https://blueskyzlabs.com");
  assert.equal(links.length, 2);
  assert.equal(links[0].hreflang, "en");
  assert.equal(links[1].hreflang, "vi");
  assert.ok(links[0].href.includes("/en/about/"));
  assert.ok(links[1].href.includes("/vi/about/"));
});

test("hreflangLinks handles root path", () => {
  const links = hreflangLinks("/", "https://blueskyzlabs.com");
  assert.equal(links.length, 2);
  assert.ok(links[0].href.includes("/en/"));
  assert.ok(links[1].href.includes("/vi/"));
});

test("PUBLIC_STATIC_PATHS includes both en and vi", () => {
  const enPaths = PUBLIC_STATIC_PATHS.filter((p) => p.startsWith("/en/"));
  const viPaths = PUBLIC_STATIC_PATHS.filter((p) => p.startsWith("/vi/"));
  assert.ok(enPaths.length >= 7);
  assert.ok(viPaths.length >= 7);
});

test("hreflang values are valid BCP 47", () => {
  const links = hreflangLinks("/en/about/", "https://blueskyzlabs.com");
  for (const link of links) {
    assert.match(link.hreflang, /^[a-z]{2}(-[A-Z]{2})?$/);
  }
});
