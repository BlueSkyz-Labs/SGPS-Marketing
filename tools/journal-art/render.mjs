#!/usr/bin/env node
/**
 * Journal art renderer (press standard R3, docs/editorial/JOURNAL_PRESS_STANDARD.md).
 *
 *   node tools/journal-art/render.mjs [post-id ...]
 *
 * Renders every figure template in tools/journal-art/figures/ with the local
 * Chromium at 2x, encodes WebP with the BlueSkyz Labs XMP rights packet and
 * writes public/images/journal/<post>/<name>.<lang>.webp plus the SHA-256
 * manifest src/data/journal-art.json. The stamp is part of the rendered pixels.
 */
import { createHash } from "node:crypto";
import {
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
  existsSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "@playwright/test";
import sharp from "sharp";
import { SITE_ORIGIN, artPath, MANIFEST_PATH } from "./paths.mjs";
import { xmpPacket } from "./stamp.mjs";

const only = new Set(process.argv.slice(2));
const figDir = new URL("./figures/", import.meta.url);
const figures = [];
for (const file of readdirSync(figDir)
  .filter((f) => f.endsWith(".mjs"))
  .sort()) {
  const mod = await import(new URL(file, figDir).href);
  figures.push(
    ...mod.FIGURES.map((f) => ({
      ...f,
      template: `tools/journal-art/figures/${file}`,
    })),
  );
}

const manifest = existsSync(MANIFEST_PATH)
  ? JSON.parse(readFileSync(MANIFEST_PATH, "utf8"))
  : {};
const browser = await chromium.launch();
const ctx = await browser.newContext({ deviceScaleFactor: 2 });
const pg = await ctx.newPage();
for (const fig of figures) {
  if (only.size && !only.has(fig.post)) continue;
  const out = artPath(fig.post, fig.name, fig.lang);
  const tmp = join(
    tmpdir(),
    `journal-art-${fig.post}-${fig.name}-${fig.lang}.html`,
  );
  writeFileSync(tmp, fig.html());
  await pg.setViewportSize({ width: fig.width, height: fig.height });
  await pg.goto(pathToFileURL(tmp).href);
  await pg.evaluate(() => document.fonts.ready);
  const png = await pg.screenshot({ type: "png", fullPage: false });
  const webStatement = `${SITE_ORIGIN}/${fig.lang}/journal/${fig.post}/`;
  const xmp = xmpPacket({ year: fig.year, title: fig.title, webStatement });
  // Every variant is cut from the same stamped render and carries the rights packet.
  const variants = [
    [
      out,
      (img) =>
        img
          .resize({ width: Math.min(fig.width * 2, 2400) })
          .webp({ quality: 86, effort: 6 }),
    ],
    [
      out.replace(/\.webp$/, "-1200.webp"),
      (img) => img.resize({ width: 1200 }).webp({ quality: 84, effort: 6 }),
    ],
    // Phones (100vw at 1.75-2x) pick this instead of the 1200 px cut.
    [
      out.replace(/\.webp$/, "-800.webp"),
      (img) => img.resize({ width: 800 }).webp({ quality: 84, effort: 6 }),
    ],
  ];
  if (fig.name === "hero") {
    variants.push([
      out.replace(/\.webp$/, ".og.jpg"),
      (img) => img.resize({ width: 1200 }).jpeg({ quality: 86, mozjpeg: true }),
    ]);
  }
  rmSync(tmp);
  mkdirSync(dirname(out), { recursive: true });
  for (const [file, encode] of variants) {
    const buf = await encode(sharp(png).withXmp(xmp)).toBuffer();
    writeFileSync(file, buf);
    const meta = await sharp(buf).metadata();
    manifest[`/${file.replace(/^public\//, "")}`] = {
      sha256: createHash("sha256").update(buf).digest("hex"),
      width: meta.width,
      height: meta.height,
      template: fig.template,
      rightsHolder: "BlueSkyz Labs",
    };
    console.log(
      `${file}  ${meta.width}x${meta.height}  ${(buf.length / 1024).toFixed(0)} KiB`,
    );
  }
}
await browser.close();
const sorted = Object.fromEntries(
  Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)),
);
writeFileSync(MANIFEST_PATH, `${JSON.stringify(sorted, null, 2)}\n`);
