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
  return pb <= pc ? b : c;
}

function decodePngScanlines(bytes) {
  const signature = bytes.subarray(0, 8);
  assert.equal(
    signature.equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
    true,
    "expected PNG signature",
  );

  let offset = 8;
  let width;
  let height;
  let bitDepth;
  let colorType;
  let interlace;
  const idat = [];

  while (offset < bytes.length) {
    const length = bytes.readUInt32BE(offset);
    const type = bytes.toString("ascii", offset + 4, offset + 8);
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    const data = bytes.subarray(dataStart, dataEnd);

    if (type === "IHDR") {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      bitDepth = data[8];
      colorType = data[9];
      interlace = data[12];
    } else if (type === "IDAT") {
      idat.push(data);
    } else if (type === "IEND") {
      break;
    }

    offset = dataEnd + 4;
  }

  assert.equal(bitDepth, 8, "OG PNG must use 8-bit channels");
  assert.equal(interlace, 0, "OG PNG must be non-interlaced for deterministic validation");
  assert.ok([0, 2, 4, 6].includes(colorType), `unsupported PNG color type ${colorType}`);
  assert.ok(width && height, "PNG IHDR dimensions must exist");
  assert.ok(idat.length > 0, "PNG must contain image data");

  const channels = { 0: 1, 2: 3, 4: 2, 6: 4 }[colorType];
  const stride = width * channels;
  const raw = inflateSync(Buffer.concat(idat));
  assert.equal(raw.length, height * (stride + 1), "unexpected PNG scanline length");

  const rows = [];
  let rawOffset = 0;
  let previous = Buffer.alloc(stride);

  for (let y = 0; y < height; y += 1) {
    const filter = raw[rawOffset];
    rawOffset += 1;
    const source = raw.subarray(rawOffset, rawOffset + stride);
    rawOffset += stride;
    const row = Buffer.alloc(stride);

    for (let x = 0; x < stride; x += 1) {
      const left = x >= channels ? row[x - channels] : 0;
      const up = previous[x];
      const upLeft = x >= channels ? previous[x - channels] : 0;
      const value = source[x];

      if (filter === 0) row[x] = value;
      else if (filter === 1) row[x] = (value + left) & 0xff;
      else if (filter === 2) row[x] = (value + up) & 0xff;
      else if (filter === 3) row[x] = (value + Math.floor((left + up) / 2)) & 0xff;
      else if (filter === 4) {
        row[x] = (value + paethPredictor(left, up, upLeft)) & 0xff;
      } else {
        assert.fail(`unsupported PNG filter ${filter}`);
      }
    }

    rows.push(row);
    previous = row;
  }

  return { width, height, colorType, channels, rows };
}

function countOpaqueInkPixels(path) {
  const { width, height, colorType, channels, rows } = decodePngScanlines(
    readFileSync(path),
  );
  let dark = 0;

  for (const row of rows) {
    for (let x = 0; x < row.length; x += channels) {
      let r;
      let g;
      let b;
      let a = 255;

      if (colorType === 0 || colorType === 4) {
        r = g = b = row[x];
        if (colorType === 4) a = row[x + 1];
      } else {
        r = row[x];
        g = row[x + 1];
        b = row[x + 2];
        if (colorType === 6) a = row[x + 3];
      }

      if (a > 200 && r < 40 && g < 40 && b < 50) dark += 1;
    }
  }

  return { width, height, dark };
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
  const { width, height, dark } = countOpaqueInkPixels(
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
