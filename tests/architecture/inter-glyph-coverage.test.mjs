import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { brotliDecompressSync } from "node:zlib";

// Guards tools/instance-inter.py: the instanced Inter must still cover every
// character the built pages ask the Inter faces to render.
const TAGS = [
  "cmap",
  "head",
  "hhea",
  "hmtx",
  "maxp",
  "name",
  "OS/2",
  "post",
  "cvt ",
  "fpgm",
  "glyf",
  "loca",
  "prep",
  "CFF ",
  "VORG",
  "EBDT",
  "EBLC",
  "gasp",
  "hdmx",
  "kern",
  "LTSH",
  "PCLT",
  "VDMX",
  "vhea",
  "vmtx",
  "BASE",
  "GDEF",
  "GPOS",
  "GSUB",
  "EBSC",
  "JSTF",
  "MATH",
  "CBDT",
  "CBLC",
  "COLR",
  "CPAL",
  "SVG ",
  "sbix",
  "acnt",
  "avar",
  "bdat",
  "bloc",
  "bsln",
  "cvar",
  "fdsc",
  "feat",
  "fmtx",
  "fvar",
  "gvar",
  "hsty",
  "just",
  "lcar",
  "mort",
  "morx",
  "opbd",
  "prop",
  "trak",
  "Zapf",
  "Silf",
  "Glat",
  "Gloc",
  "Feat",
  "Sill",
];

export function woff2Cmap(buf) {
  const n = buf.readUInt16BE(12);
  const compressed = buf.readUInt32BE(20);
  let p = 48;
  const base128 = () => {
    let v = 0;
    for (let i = 0; i < 5; i++) {
      const b = buf[p++];
      v = v * 128 + (b & 127);
      if (!(b & 128)) break;
    }
    return v;
  };
  const tables = [];
  for (let i = 0; i < n; i++) {
    const flags = buf[p++];
    let tag = TAGS[flags & 63];
    if ((flags & 63) === 63) {
      tag = buf.toString("latin1", p, p + 4);
      p += 4;
    }
    const version = flags >> 6;
    const orig = base128();
    const transformed =
      tag === "glyf" || tag === "loca" ? version === 0 : version !== 0;
    tables.push({ tag, length: transformed ? base128() : orig });
  }
  const data = brotliDecompressSync(buf.subarray(p, p + compressed));
  let off = 0;
  const cmapTable = tables.find((t) => {
    if (t.tag === "cmap") return true;
    off += t.length;
    return false;
  });
  const c = data.subarray(off, off + cmapTable.length);
  const covered = new Set();
  const subtables = c.readUInt16BE(2);
  for (let i = 0; i < subtables; i++) {
    const s = c.readUInt32BE(4 + i * 8 + 4);
    const format = c.readUInt16BE(s);
    if (format === 4) {
      const segs = c.readUInt16BE(s + 6) / 2;
      const ends = s + 14;
      const starts = ends + segs * 2 + 2;
      for (let k = 0; k < segs; k++) {
        const end = c.readUInt16BE(ends + k * 2);
        for (
          let u = c.readUInt16BE(starts + k * 2);
          u <= end && u < 0xffff;
          u++
        )
          covered.add(u);
      }
    } else if (format === 12) {
      const groups = c.readUInt32BE(s + 12);
      for (let k = 0; k < groups; k++) {
        const g = s + 16 + k * 12;
        for (let u = c.readUInt32BE(g); u <= c.readUInt32BE(g + 4); u++)
          covered.add(u);
      }
    }
  }
  return covered;
}

function interRanges(css) {
  const out = [];
  for (const face of css.match(/@font-face\s*\{[^}]+\}/g) ?? []) {
    if (!face.includes("Inter Variable")) continue;
    const range = face.match(/unicode-range\s*:([^;]+);/)[1];
    for (const m of range.matchAll(/U\+([0-9A-F]+)(?:-([0-9A-F]+))?/gi)) {
      out.push([parseInt(m[1], 16), parseInt(m[2] ?? m[1], 16)]);
    }
  }
  return out;
}

export function uncovered(text, ranges, covered) {
  const missing = new Set();
  for (const ch of text) {
    const u = ch.codePointAt(0);
    if (u < 0x21 || (u >= 0x7f && u <= 0xa0 && u !== 0xa0)) continue; // controls
    if (u === 0xa0 || u === 0x200b || u === 0xfeff) continue; // invisible spacing
    if (ranges.some(([a, b]) => u >= a && u <= b) && !covered.has(u))
      missing.add(u);
  }
  return [...missing];
}

const css = readFileSync("src/styles/global.css", "utf8");
const ranges = interRanges(css);
const covered = new Set();
for (const f of ["latin", "vietnamese"]) {
  for (const u of woff2Cmap(
    readFileSync(`public/fonts/inter-${f}-wght-v5.3.0.woff2`),
  ))
    covered.add(u);
}

function* htmlFiles(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) yield* htmlFiles(p);
    else if (e.name.endsWith(".html")) yield p;
  }
}

test("instanced Inter covers every Inter-range character in built HTML", () => {
  if (!existsSync("dist")) return; // architecture tests may run before build
  const decode = (s) =>
    s
      .replace(/&#x([0-9a-f]+);/gi, (_, h) =>
        String.fromCodePoint(parseInt(h, 16)),
      )
      .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
      .replace(/&nbsp;/g, " ")
      .replace(
        /&(amp|lt|gt|quot|apos|middot|mdash|ndash|hellip|rsquo|lsquo|ldquo|rdquo|copy|times|rarr|larr);/g,
        "·",
      );
  let pages = 0;
  for (const file of htmlFiles("dist")) {
    const text = decode(
      readFileSync(file, "utf8")
        .replace(/<(script|style)[\s\S]*?<\/\1>/g, " ")
        .replace(/<[^>]+>/g, " "),
    );
    pages += 1;
    assert.deepEqual(
      uncovered(text, ranges, covered).map((u) => `U+${u.toString(16)}`),
      [],
      `${file} uses characters the Inter subsets lack`,
    );
  }
  assert.ok(pages > 0);
});

test("negative proof: a font missing a character is detected", () => {
  assert.ok(
    covered.has(0x41) && covered.has(0x1ea1),
    "sanity: A and ạ covered",
  );
  const reduced = new Set(covered);
  reduced.delete(0x1ea1);
  assert.deepEqual(uncovered("Việt nạm", ranges, reduced), [0x1ea1]);
  assert.deepEqual(uncovered("Việt nạm", ranges, covered), []);
});
