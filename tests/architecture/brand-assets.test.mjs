import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import { inflateSync } from "node:zlib";

function paethPredictor(a, b, c) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  if (pb <= pc) return b;
  return c;
}

function countDarkPixelsInRgbPng(path) {
  const png = readFileSync(path);
  assert.deepEqual(
    [...png.subarray(0, 8)],
    [137, 80, 78, 71, 13, 10, 26, 10],
    "asset must remain a PNG",
  );

  let offset = 8;
  let width = 0;
  let height = 0;
  const idat = [];
  while (offset < png.length) {
    const length = png.readUInt32BE(offset);
    const type = png.toString("ascii", offset + 4, offset + 8);
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    assert.ok(dataEnd + 4 <= png.length, `invalid PNG chunk ${type}`);

    if (type === "IHDR") {
      width = png.readUInt32BE(dataStart);
      height = png.readUInt32BE(dataStart + 4);
      assert.equal(png[dataStart + 8], 8, "OG PNG must remain 8-bit");
      assert.equal(png[dataStart + 9], 2, "OG PNG must remain RGB");
      assert.equal(
        png[dataStart + 10],
        0,
        "unsupported PNG compression method",
      );
      assert.equal(png[dataStart + 11], 0, "unsupported PNG filter method");
      assert.equal(png[dataStart + 12], 0, "OG PNG must remain non-interlaced");
    } else if (type === "IDAT") {
      idat.push(png.subarray(dataStart, dataEnd));
    } else if (type === "IEND") {
      break;
    }

    offset = dataEnd + 4;
  }

  assert.ok(width > 0 && height > 0, "PNG is missing IHDR dimensions");
  assert.ok(idat.length > 0, "PNG is missing IDAT image data");

  const bytesPerPixel = 3;
  const stride = width * bytesPerPixel;
  const raw = inflateSync(Buffer.concat(idat));
  assert.equal(
    raw.length,
    height * (stride + 1),
    "unexpected PNG scanline size",
  );

  let dark = 0;
  let previous = Buffer.alloc(stride);
  let cursor = 0;
  for (let y = 0; y < height; y += 1) {
    const filter = raw[cursor];
    cursor += 1;
    const current = Buffer.alloc(stride);

    for (let x = 0; x < stride; x += 1) {
      const encoded = raw[cursor + x];
      const left = x >= bytesPerPixel ? current[x - bytesPerPixel] : 0;
      const up = previous[x];
      const upLeft = x >= bytesPerPixel ? previous[x - bytesPerPixel] : 0;
      let value;
      switch (filter) {
        case 0:
          value = encoded;
          break;
        case 1:
          value = encoded + left;
          break;
        case 2:
          value = encoded + up;
          break;
        case 3:
          value = encoded + Math.floor((left + up) / 2);
          break;
        case 4:
          value = encoded + paethPredictor(left, up, upLeft);
          break;
        default:
          assert.fail(`unsupported PNG filter ${filter}`);
      }
      current[x] = value & 0xff;
    }

    for (let x = 0; x < stride; x += bytesPerPixel) {
      if (current[x] < 40 && current[x + 1] < 40 && current[x + 2] < 50) {
        dark += 1;
      }
    }

    cursor += stride;
    previous = current;
  }

  return { dark, height, width };
}

test("brand asset generator projects C1.1 primitives only", () => {
  const path = "scripts/generate-brand-assets.py";
  assert.equal(existsSync(path), true);
  const source = readFileSync(path, "utf8");
  assert.match(source, /Porcelain|PORCELAIN/);
  assert.match(source, /Cobalt|COBALT/);
  assert.match(source, /#0[Bb]1020|INK\s*=\s*\(11,\s*16,\s*32/);
  assert.doesNotMatch(
    source,
    /Quiet Luxury|champagne|Cormorant|#C9A962|GOLD\s*=/i,
  );
  assert.match(source, /Does not invent R4d geometry/);
  assert.match(source, /symbol_mono_ink\.svg/);
  assert.match(source, /micro_mark_ink\.svg/);
  assert.match(source, /require_r4d_symbol/);
  assert.match(source, /horizontal_light_1800\.png|rsvg-convert/);
  assert.match(source, /brand_mark_for_og|rasterize_svg/);
  assert.doesNotMatch(source, /rounded_rectangle/);
});

test("committed OG assets exist for masterbrand social previews", () => {
  assert.equal(existsSync("public/social/og-default.png"), true);
  assert.equal(existsSync("public/og-image.png"), false);
});

test("OG image contains opaque ink pixels from the R4d symbol", () => {
  const { dark, height, width } = countDarkPixelsInRgbPng(
    "public/social/og-default.png",
  );
  assert.deepEqual([width, height], [1200, 630]);
  assert.ok(dark > 2000, `expected R4d ink cluster, found ${dark} dark pixels`);
});

test("favicon is not the prior rounded-rect placeholder", () => {
  assert.equal(existsSync("public/favicon.ico"), true);
  const bytes = readFileSync("public/favicon.ico");
  assert.ok(bytes.byteLength > 400, "favicon should carry mark detail");
  const digest = createHash("sha256").update(bytes).digest("hex");
  // Prior geometric placeholder digest prefix (live pre-fix).
  assert.notEqual(digest.slice(0, 16), "fde16ee9101c2288");
});
