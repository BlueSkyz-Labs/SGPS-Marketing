import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { test } from "node:test";

/**
 * Mobile LCP headroom (measured 2026-10-01, Lighthouse 13.4.1, CI mobile
 * settings). The LCP element is the hero H1 (text), and Lighthouse's simulated
 * LCP waits on every non-offscreen request that finishes before the hero
 * paints. Master-size raster files that render in small slots therefore
 * inflate LCP even though they never block the H1: a 256/512 px icon in a
 * 36-56 px tile, and the 1920 px desktop capture in a ~380 px mobile slot,
 * together cost about 300 ms of simulated LCP on /en/ and /vi/.
 *
 * Contract: small slots use resized derivatives of the same artwork; the
 * masters stay recorded and untouched.
 */
const read = (path) => readFileSync(path, "utf8");
const PRODUCTS = ["apexagent", "fluentarc", "sotam", "sotro", "vungtaylai"];
const THUMB_MAX_BYTES = 12_000;
const CAPTURE_MAX_BYTES = 30_000;

function pngSize(path) {
  const b = readFileSync(path);
  assert.equal(b.subarray(1, 4).toString(), "PNG", `${path} must be a PNG`);
  return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
}

/** Lossy WebP (`VP8 `) canvas size. */
function webpSize(path) {
  const b = readFileSync(path);
  assert.equal(b.subarray(0, 4).toString(), "RIFF", `${path} must be WebP`);
  assert.equal(b.subarray(8, 12).toString(), "WEBP");
  assert.equal(b.subarray(12, 16).toString(), "VP8 ", "lossy WebP expected");
  return {
    width: b.readUInt16LE(26) & 0x3fff,
    height: b.readUInt16LE(28) & 0x3fff,
  };
}

function checkThumbs(sizeOf, bytesOf) {
  for (const slug of PRODUCTS) {
    const thumb = `public/products/${slug}/icon-112.png`;
    const { width, height } = sizeOf(thumb);
    assert.equal(width, 112, `${thumb} width`);
    assert.equal(height, 112, `${thumb} height`);
    assert.ok(bytesOf(thumb) <= THUMB_MAX_BYTES, `${thumb} must stay small`);
  }
}

function checkThumbUsage(hero, card, routes) {
  for (const [name, src] of [
    ["Hero", hero],
    ["ProductCard", card],
  ]) {
    assert.match(src, /getProductIconThumbPath\(/, `${name} uses the thumb`);
    assert.doesNotMatch(src, /getProductIconPath\(/, `${name} master icon`);
  }
  assert.match(routes, /\/products\/\$\{slug\}\/icon-112\.png/);
}

function checkCapture(theatre, sizeOf, bytesOf) {
  const file = "public/products/sotro/showcase/mgr-02-payments-768.webp";
  assert.match(
    theatre,
    /smallSrc=\{[\s\S]*?mgr-02-payments-768\.webp[\s\S]*?width:\s*768/,
    "home capture must offer the 768 px candidate through smallSrc",
  );
  const master = sizeOf("public/products/sotro/showcase/mgr-02-payments.webp");
  const small = sizeOf(file);
  assert.equal(small.width, 768, "declared srcset width must be real");
  assert.equal(small.width * master.height, small.height * master.width);
  assert.ok(bytesOf(file) <= CAPTURE_MAX_BYTES, "derivative must stay small");
}

const bytes = (path) => statSync(path).size;
const sizeOf = (path) =>
  path.endsWith(".png") ? pngSize(path) : webpSize(path);

test("product icons have 112 px derivatives for small tiles", () => {
  checkThumbs(sizeOf, bytes);
});

test("Hero and ProductCard render the derivative, not the master icon", () => {
  checkThumbUsage(
    read("src/components/sections/Hero.astro"),
    read("src/components/product/ProductCard.astro"),
    read("src/lib/product-routes.ts"),
  );
});

test("home capture offers a small srcset candidate of the same screen", () => {
  checkCapture(
    read("src/components/product/FlagshipTheatre.astro"),
    sizeOf,
    bytes,
  );
});

test("negative proof: each check turns RED on a broken invariant", () => {
  const hero = read("src/components/sections/Hero.astro");
  const card = read("src/components/product/ProductCard.astro");
  const routes = read("src/lib/product-routes.ts");
  const theatre = read("src/components/product/FlagshipTheatre.astro");
  // Master icon routed back into a small tile.
  assert.throws(() =>
    checkThumbUsage(
      hero.replaceAll("getProductIconThumbPath", "getProductIconPath"),
      card,
      routes,
    ),
  );
  assert.throws(() =>
    checkThumbUsage(hero, card, routes.replace("icon-112.png", "icon.png")),
  );
  // Derivative grows back toward the master.
  assert.throws(() => checkThumbs(sizeOf, () => 37_489));
  // Derivative has the wrong pixel size.
  assert.throws(() => checkThumbs(() => ({ width: 256, height: 256 }), bytes));
  // Capture srcset candidate dropped, mis-declared or bloated.
  assert.throws(() =>
    checkCapture(theatre.replace("smallSrc={", "data-x={"), sizeOf, bytes),
  );
  assert.throws(() =>
    checkCapture(theatre.replace("width: 768", "width: 640"), sizeOf, bytes),
  );
  assert.throws(() => checkCapture(theatre, sizeOf, () => 69_118));
});
