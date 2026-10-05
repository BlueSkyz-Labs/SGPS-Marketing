/**
 * Post-deploy smoke: asset reachability and security-header expectations.
 * Two production bugs (a `_redirects` rule that 301'd /products/ assets, and
 * unverifiable `_headers` changes) only manifested on Cloudflare. These tests
 * pin the pure helpers the smoke uses, with negative proofs for each failure.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  assetProblem,
  buildHeaderExpectations,
  contentTypeMatches,
  extractProductPaths,
  extractSameOriginAssetPaths,
  htmlHeaderProblems,
  immutableAssetHeaderProblems,
  parseHeadersFile,
} from "../../scripts/smoke-assets.mjs";

const SITE = "https://blueskyzlabs.com";
const HEADERS_TEXT = readFileSync("public/_headers", "utf8");
const SMOKE = readFileSync("scripts/smoke-production.mjs", "utf8");

const PAGE = `
<html><head>
<link rel="canonical" href="https://blueskyzlabs.com/en/">
<link rel="alternate" hreflang="vi" href="/vi/">
<link rel="stylesheet" href="/_astro/app.abc.css">
<link rel="icon" href="https://blueskyzlabs.com/favicon.svg">
<link rel="stylesheet" href="https://evil.example/x.css">
<link rel="stylesheet" href="http://blueskyzlabs.com/insecure.css">
<meta property="og:image" content="https://blueskyzlabs.com/og/home.png?v=1&amp;w=2">
<meta name="twitter:image" content="https://cdn.example/t.png">
<script src="/_astro/app.abc.js" type="module"></script>
</head><body>
<a href="/en/about/">About</a>
<img src="/products/sotro/hero.png" srcset="/products/sotro/h-1x.webp 1x, /products/sotro/h-2x.webp 2x">
<video poster="/products/sotro/poster.jpg"><source src="/products/sotro/demo.mp4" type="video/mp4">
<track src="/products/sotro/demo.vtt" kind="captions"></video>
<img src="data:image/gif;base64,AAAA"><img src="//evil.example/p.png">
<img src="/products/sotro/hero.png#frag">
</body></html>`;

test("asset extraction keeps exact same-origin assets and drops the rest", () => {
  const found = extractSameOriginAssetPaths(PAGE, `${SITE}/en/`, SITE);
  assert.deepEqual(found, [
    "/_astro/app.abc.css",
    "/_astro/app.abc.js",
    "/favicon.svg",
    "/og/home.png?v=1&w=2",
    "/products/sotro/demo.mp4",
    "/products/sotro/demo.vtt",
    "/products/sotro/h-1x.webp",
    "/products/sotro/h-2x.webp",
    "/products/sotro/hero.png",
    "/products/sotro/poster.jpg",
  ]);
});

test("asset extraction rejects look-alike origins and page links", () => {
  const found = extractSameOriginAssetPaths(PAGE, `${SITE}/en/`, SITE);
  for (const bad of ["evil.example", "insecure.css", "t.png", "/en/about/"]) {
    assert.ok(!found.some((p) => p.includes(bad)), `${bad} must be excluded`);
  }
  assert.deepEqual(
    extractSameOriginAssetPaths(
      '<img src="https://blueskyzlabs.com.evil.example/a.png">',
      `${SITE}/en/`,
      SITE,
    ),
    [],
  );
});

test("content-type matching follows the extension", () => {
  for (const [path, type] of [
    ["/a.png", "image/png"],
    ["/a.webp", "image/webp"],
    ["/a.mp4", "video/mp4"],
    ["/a.vtt", "text/vtt; charset=utf-8"],
    ["/a.css", "text/css; charset=utf-8"],
    ["/a.js", "application/javascript"],
    ["/a.js", "text/javascript; charset=utf-8"],
    ["/a.woff2", "font/woff2"],
    ["/a.unknownext", "application/octet-stream"],
  ]) {
    assert.ok(contentTypeMatches(path, type), `${path} ${type}`);
  }
});

test("negative proof: a text/html response for a .png fails", () => {
  assert.equal(contentTypeMatches("/products/x/hero.png", "text/html"), false);
  assert.equal(contentTypeMatches("/a.png", undefined), false);
  const problem = assetProblem({
    pathname: "/products/x/hero.png",
    status: 200,
    contentType: "text/html; charset=utf-8",
  });
  assert.match(problem, /content-type text\/html.*\.png/);
  assert.equal(contentTypeMatches("/a.css", "text/plain"), false);
  assert.equal(contentTypeMatches("/a.vtt", "text/plain"), false);
});

test("negative proof: a 301 on an asset fails; a clean 200 passes", () => {
  const redirected = assetProblem({
    pathname: "/products/x/hero.png",
    status: 301,
    contentType: null,
    location: "/en/products/x/hero.png",
  });
  assert.match(redirected, /status 301 -> \/en\/products\/x\/hero\.png/);
  assert.match(
    assetProblem({ pathname: "/a.png", status: 404, contentType: "image/png" }),
    /status 404/,
  );
  assert.equal(
    assetProblem({ pathname: "/a.png", status: 200, contentType: "image/png" }),
    null,
  );
});

test("smoke fetches assets without following redirects, bounded", () => {
  assert.match(SMOKE, /redirect:\s*"manual"/);
  assert.match(SMOKE, /ASSET_CONCURRENCY\s*=\s*\d+/);
  assert.match(SMOKE, /MAX_ASSETS\s*=\s*\d+/);
  assert.match(SMOKE, /SUPPORTED_LANGUAGES/);
});

test("product pages are discovered from the products index only", () => {
  const html = `<a href="/en/products/sotro/">a</a><a href="/en/products/sotam/">b</a>
  <a href="/en/products/">index</a><a href="/en/products/sotro/deep/">c</a>
  <a href="/vi/products/sotro/">other locale</a><a href="/en/products/sotro/#x">d</a>`;
  assert.deepEqual(extractProductPaths(html, "en"), [
    "/en/products/sotam/",
    "/en/products/sotro/",
  ]);
});

test("header expectations are read from public/_headers", () => {
  const routes = parseHeadersFile(HEADERS_TEXT);
  assert.ok(routes.get("/*")?.get("content-security-policy"));
  assert.match(routes.get("/_astro/*").get("cache-control"), /immutable/);
  const expectations = buildHeaderExpectations(HEADERS_TEXT);
  const { "permissions-policy": permissionsPolicy, ...stableHeaders } =
    expectations.exactHeaders;
  assert.deepEqual(stableHeaders, {
    "cross-origin-opener-policy": "same-origin",
    "cross-origin-resource-policy": "same-site",
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "strict-transport-security": "max-age=31536000; includeSubDomains",
    "referrer-policy": "strict-origin-when-cross-origin",
  });
  // The Permissions-Policy opt-out list churns (interest-cohort -> browsing-
  // topics); assert its semantics instead of pinning the literal so this
  // test cannot race an in-flight header fix.
  assert.match(
    permissionsPolicy,
    /^camera=\(\), microphone=\(\), geolocation=\(\), payment=\(\)/,
  );
  assert.deepEqual(expectations.cspDirectives, [
    "media-src 'self'",
    "upgrade-insecure-requests",
    "frame-ancestors 'none'",
    "script-src 'self' 'inline-speculation-rules'",
  ]);
});

test("expectation parsing fails closed when _headers drops a requirement", () => {
  const broken = (from, to) => HEADERS_TEXT.replace(from, to);
  assert.throws(
    () => buildHeaderExpectations(broken("media-src 'self'; ", "")),
    /media-src 'self'/,
  );
  assert.throws(
    () =>
      buildHeaderExpectations(broken(/ *Cross-Origin-Opener-Policy:.*\n/, "")),
    /cross-origin-opener-policy/,
  );
  assert.throws(
    () => buildHeaderExpectations(broken(", immutable", "")),
    /immutable/,
  );
  assert.throws(() => buildHeaderExpectations(""), /no \/\* block/);
});

function headerGetter(map) {
  const lower = new Map(
    Object.entries(map).map(([k, v]) => [k.toLowerCase(), v]),
  );
  return (name) => lower.get(name.toLowerCase()) ?? null;
}

const GOOD_RESPONSE = () => {
  const routes = parseHeadersFile(HEADERS_TEXT).get("/*");
  return Object.fromEntries(routes);
};

test("a response mirroring _headers passes the HTML header check", () => {
  const expectations = buildHeaderExpectations(HEADERS_TEXT);
  assert.deepEqual(
    htmlHeaderProblems(headerGetter(GOOD_RESPONSE()), expectations),
    [],
  );
});

test("negative proof: a missing COOP fails", () => {
  const expectations = buildHeaderExpectations(HEADERS_TEXT);
  const response = GOOD_RESPONSE();
  delete response["cross-origin-opener-policy"];
  const problems = htmlHeaderProblems(headerGetter(response), expectations);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /cross-origin-opener-policy missing/);
});

test("negative proof: wrong CORP, weakened CSP and missing nosniff fail", () => {
  const expectations = buildHeaderExpectations(HEADERS_TEXT);
  const response = GOOD_RESPONSE();
  response["cross-origin-resource-policy"] = "cross-origin";
  response["content-security-policy"] = response["content-security-policy"]
    .replace("media-src 'self'; ", "")
    .replace("; upgrade-insecure-requests", "");
  delete response["x-content-type-options"];
  const text = htmlHeaderProblems(headerGetter(response), expectations).join(
    "|",
  );
  assert.match(text, /media-src 'self'/);
  assert.match(text, /upgrade-insecure-requests/);
  assert.match(text, /cross-origin-resource-policy is "cross-origin"/);
  assert.match(text, /x-content-type-options missing/);
  assert.doesNotMatch(text, /frame-ancestors|script-src/);
});

test("immutable cache header is required on hashed assets", () => {
  const expectations = buildHeaderExpectations(HEADERS_TEXT);
  assert.deepEqual(
    immutableAssetHeaderProblems(
      headerGetter({ "cache-control": "public, max-age=31536000, immutable" }),
      expectations,
    ),
    [],
  );
  assert.equal(
    immutableAssetHeaderProblems(
      headerGetter({ "cache-control": "public, max-age=0, must-revalidate" }),
      expectations,
    ).length,
    2,
  );
  assert.equal(
    immutableAssetHeaderProblems(headerGetter({}), expectations).length,
    2,
  );
});
