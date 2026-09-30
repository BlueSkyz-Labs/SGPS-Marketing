import assert from "node:assert/strict";
import test from "node:test";

const { hreflangLinks, PUBLIC_STATIC_PATHS } =
  await import("../../src/lib/seo.ts");

test("hreflangLinks returns en, vi, zh-Hans and zh-Hant for every path", () => {
  const links = hreflangLinks("/en/about/", "https://blueskyzlabs.com");
  assert.equal(links.length, 4);
  assert.equal(links[0].hreflang, "en");
  assert.equal(links[1].hreflang, "vi");
  assert.equal(links[2].hreflang, "zh-Hans");
  assert.equal(links[3].hreflang, "zh-Hant");
  assert.ok(links[0].href.includes("/en/about/"));
  assert.ok(links[1].href.includes("/vi/about/"));
  assert.ok(links[2].href.includes("/zh/about/"));
  assert.ok(links[3].href.includes("/zh-hant/about/"));
});

test("hreflangLinks handles root path", () => {
  const links = hreflangLinks("/", "https://blueskyzlabs.com");
  assert.equal(links.length, 4);
  assert.ok(links[0].href.includes("/en/"));
  assert.ok(links[1].href.includes("/vi/"));
  assert.ok(links[2].href.includes("/zh/"));
  assert.ok(links[3].href.includes("/zh-hant/"));
});

test("PUBLIC_STATIC_PATHS includes en, vi, zh and zh-hant", () => {
  const enPaths = PUBLIC_STATIC_PATHS.filter((p) => p.startsWith("/en/"));
  const viPaths = PUBLIC_STATIC_PATHS.filter((p) => p.startsWith("/vi/"));
  const zhPaths = PUBLIC_STATIC_PATHS.filter((p) => p.startsWith("/zh/"));
  assert.ok(enPaths.length >= 7);
  assert.ok(viPaths.length >= 7);
  const zhHantPaths = PUBLIC_STATIC_PATHS.filter((p) =>
    p.startsWith("/zh-hant/"),
  );
  assert.ok(zhPaths.length >= 7);
  assert.equal(zhHantPaths.length, zhPaths.length);
  assert.deepEqual(
    zhHantPaths.map((p) => p.replace("/zh-hant/", "/")),
    zhPaths.map((p) => p.replace("/zh/", "/")),
    "zh-hant must mirror the zh route set",
  );
});

test("hreflang values are valid BCP 47", () => {
  const links = hreflangLinks("/en/about/", "https://blueskyzlabs.com");
  for (const link of links) {
    assert.match(link.hreflang, /^[a-z]{2}(-[A-Za-z0-9]+)*$/);
  }
});
