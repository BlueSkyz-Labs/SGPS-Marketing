/**
 * Regenerates the Sổ Trọ website assets from the Owner-approved app icon.
 *
 *   node docs/brand/sotro-icon/build-sotro-assets.mjs <sotro-repo-checkout>
 *
 * Inputs (read-only): <sotro>/public/icons/icon.svg and icon-512.webp.
 * Kit inputs (read-only): brand/blueskyz-production-v4/06_PRODUCT_BRANDS/01_LOCKUPS_SVG/sotro_endorsed_lockup_*.svg
 * Outputs (website only; nothing under brand/ is written):
 *   public/products/sotro/icon.svg                         vector, byte copy of the app icon.svg
 *   public/brand/blueskyz/v4/products/sotro.svg            same bytes (product icon registry slot)
 *   public/products/sotro/icon.png                         256x256 opaque PNG (>= 2.7x the largest 92 px display size)
 *   public/brand/blueskyz/v4/products/sotro_endorsed_lockup_{light,dark}.svg   kit layout + red-book vector
 *   public/products/sotro/identity.png                     1800x504 dark endorsed lockup, raster icon (>= 2x)
 * `sharp` is resolved from the repo's installed dependency tree (no new dependency).
 */
import { copyFileSync, readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import {
  buildSotroLockup,
  buildSotroLockupWithRaster,
} from "./sotro-lockup.mjs";

const sotroRepo = process.argv[2];
if (!sotroRepo)
  throw new Error("usage: build-sotro-assets.mjs <sotro-repo-checkout>");
const require = createRequire(import.meta.url);
const sharp = (await import(process.env.SHARP_MODULE ?? "sharp")).default;
void require;

const KIT = "brand/blueskyz-production-v4/06_PRODUCT_BRANDS/01_LOCKUPS_SVG";
const iconSvgPath = join(sotroRepo, "public/icons/icon.svg");
const iconWebpPath = join(sotroRepo, "public/icons/icon-512.webp");
const iconSvg = readFileSync(iconSvgPath, "utf8");

copyFileSync(iconSvgPath, "public/products/sotro/icon.svg");
copyFileSync(iconSvgPath, "public/brand/blueskyz/v4/products/sotro.svg");

await sharp(iconWebpPath)
  .resize(256, 256, { kernel: "lanczos3" })
  .png({
    compressionLevel: 9,
    palette: true,
    quality: 95,
    effort: 10,
    dither: 0.6,
  })
  .toFile("public/products/sotro/icon.png");

for (const variant of ["light", "dark"]) {
  const kit = readFileSync(
    `${KIT}/sotro_endorsed_lockup_${variant}.svg`,
    "utf8",
  );
  writeFileSync(
    `public/brand/blueskyz/v4/products/sotro_endorsed_lockup_${variant}.svg`,
    buildSotroLockup(kit, iconSvg),
  );
}

const raster = await sharp(iconWebpPath).png().toBuffer();
const dataUri = `data:image/png;base64,${raster.toString("base64")}`;
const darkKit = readFileSync(`${KIT}/sotro_endorsed_lockup_dark.svg`, "utf8");
await sharp(Buffer.from(buildSotroLockupWithRaster(darkKit, dataUri)), {
  density: 72,
})
  .resize(1800, 504)
  .png({
    compressionLevel: 9,
    palette: true,
    quality: 95,
    effort: 10,
    dither: 0.6,
  })
  .toFile("public/products/sotro/identity.png");

console.log("Sổ Trọ assets regenerated");
