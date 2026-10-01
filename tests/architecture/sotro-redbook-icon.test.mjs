/**
 * Sổ Trọ product mark guard — Owner DEVIATION from Brand Kit v4 (2026-10-01).
 * Record: docs/brand/DEVIATION_SOTRO_PRODUCT_ICON_2026-10-01.md.
 *
 * The website's Sổ Trọ mark is the Owner-approved red-leather "Cuốn Sổ Đỏ Vàng
 * Kim" app icon. This guard (1) fails if any published or built file is still a
 * blue-house Sổ Trọ asset (by content hash and by glyph signature), (2) proves
 * the committed lockups are the kit layout with only the glyph replaced, and
 * (3) pins the icon files to their documented source and sizes.
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { buildSotroLockup } from "../../docs/brand/sotro-icon/sotro-lockup.mjs";

const KIT_LOCKUPS =
  "brand/blueskyz-production-v4/06_PRODUCT_BRANDS/01_LOCKUPS_SVG";
const PRODUCTS = "public/brand/blueskyz/v4/products";

/** sha256 of every blue-house Sổ Trọ asset that shipped before the decision (c518a0e). */
const OLD_BLUE_HOUSE_SHA256 = new Map([
  [
    "fddcc299444795844acc12c06fbff43947139fb0ebb97f88939661ca78585c3f",
    "products/sotro/icon.png (kit REFERENCE extraction)",
  ],
  [
    "60b6461b278537a852f10ecc5e1222b3ac3d29360350442264ba56768f9a49bf",
    "sotro.svg / products/sotro/icon.svg (kit product icon)",
  ],
  [
    "b54635276bb0da878ce42ff49bab9d1d585b01743e5797fb83da3d4f4da810d0",
    "products/sotro/identity.png (kit dark lockup PNG)",
  ],
  [
    "b839885effe4db4ac529d0f20abf0774eaf99895a4d80082b15c99f07b0a43b5",
    "sotro_endorsed_lockup_light.svg (kit)",
  ],
  [
    "51a326b0651c616083b22dbe8ab874652cbe8706d3dfe9b97b19ed342169cdd4",
    "sotro_endorsed_lockup_dark.svg (kit)",
  ],
]);
/** Path data of the kit's blue-house glyph. */
const HOUSE_SIGNATURE = "M8 29 32 9l24 20v26H8Z";
/** sha256 of the Sotro app repo public/icons/icon.svg that the vector files copy. */
const APP_ICON_SVG_SHA256 =
  "974982e146e549b838e602e6c92899143aa186b33bff646e89be8dc05ac43fff";

const sha = (buffer) => createHash("sha256").update(buffer).digest("hex");

function walk(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

/** Returns "<file>: <reason>" for every blue-house Sổ Trọ asset among `files`. */
export function blueHouseOffenders(files, read = readFileSync) {
  const offenders = [];
  for (const file of files) {
    if (!/sotro/i.test(file) && !/\.(png|svg)$/i.test(file)) continue;
    const bytes = read(file);
    const hit = OLD_BLUE_HOUSE_SHA256.get(sha(bytes));
    if (hit) offenders.push(`${file}: identical to old ${hit}`);
    else if (
      /sotro/i.test(file) &&
      /\.svg$/i.test(file) &&
      bytes.toString("utf8").includes(HOUSE_SIGNATURE)
    ) {
      offenders.push(`${file}: contains the blue-house glyph`);
    }
  }
  return offenders;
}

function pngHeader(path) {
  const b = readFileSync(path);
  assert.equal(b.subarray(1, 4).toString(), "PNG", `${path} must be a PNG`);
  return {
    width: b.readUInt32BE(16),
    height: b.readUInt32BE(20),
    colorType: b[25],
  };
}

test("no published or built file is still a blue-house Sotro asset", () => {
  const roots = ["public", ...(existsSync("dist") ? ["dist"] : [])];
  assert.deepEqual(blueHouseOffenders(roots.flatMap(walk)), []);
});

test("no page or source references the kit's blue-house Sổ Trọ paths", () => {
  const files = [
    ...walk("src"),
    ...(existsSync("dist") ? walk("dist") : []),
  ].filter((f) => /\.(astro|ts|mjs|css|yaml|json|html)$/.test(f));
  const offenders = files.filter((f) => {
    const text = readFileSync(f, "utf8");
    return /REFERENCE_sotro|06_PRODUCT_BRANDS[^"'\s]*sotro|03_PRODUCT_ICONS[^"'\s]*sotro/.test(
      text,
    );
  });
  assert.deepEqual(offenders, []);
});

test("negative proof: the offender scan catches an old asset and a house glyph", () => {
  const kitLockup = `${KIT_LOCKUPS}/sotro_endorsed_lockup_light.svg`;
  assert.equal(
    blueHouseOffenders([kitLockup]).length,
    1,
    "old kit lockup by hash",
  );
  const mutated = () =>
    Buffer.from(`<svg><path d="${HOUSE_SIGNATURE}"/></svg>`);
  assert.equal(
    blueHouseOffenders(["public/x/sotro_new.svg"], mutated).length,
    1,
    "house glyph by signature",
  );
  assert.deepEqual(blueHouseOffenders(["public/products/sotro/icon.svg"]), []);
});

test("vector icon files are byte copies of the Owner-approved app icon.svg", () => {
  for (const path of [
    "public/products/sotro/icon.svg",
    `${PRODUCTS}/sotro.svg`,
  ]) {
    assert.equal(sha(readFileSync(path)), APP_ICON_SVG_SHA256, path);
  }
});

test("raster icon and identity art have the documented sizes", () => {
  const icon = pngHeader("public/products/sotro/icon.png");
  assert.equal(icon.width, 256);
  assert.equal(icon.height, 256);
  // >= 2x the largest rendered icon (112 px tile with padding => 92 px content).
  assert.ok(icon.width >= 2 * 92);
  const identity = pngHeader("public/products/sotro/identity.png");
  assert.equal(identity.width, 1800);
  assert.equal(identity.height, 504);
});

test("endorsed lockups are the kit layout with only the glyph replaced", () => {
  const icon = readFileSync("public/products/sotro/icon.svg", "utf8");
  for (const variant of ["light", "dark"]) {
    const kit = readFileSync(
      `${KIT_LOCKUPS}/sotro_endorsed_lockup_${variant}.svg`,
      "utf8",
    );
    const published = readFileSync(
      `${PRODUCTS}/sotro_endorsed_lockup_${variant}.svg`,
      "utf8",
    );
    assert.equal(published, buildSotroLockup(kit, icon), `${variant} lockup`);
    // Everything after the glyph group is the kit's, byte for byte.
    const tail = (svg) => svg.slice(svg.indexOf("</g>") + 4);
    const publishedTail = published.slice(published.indexOf("</svg>") + 6);
    assert.equal(publishedTail, tail(kit), `${variant} lockup text paths`);
    assert.ok(
      !published.includes(HOUSE_SIGNATURE),
      `${variant} lockup has no house`,
    );
    assert.match(published, /aria-label="Sổ Trọ - A BlueSkyz Labs product"/);
    assert.match(published, /viewBox="0 0 1500 420"/);
  }
});

test("negative proof: the kit blue-house lockup is not accepted as the published lockup", () => {
  const icon = readFileSync("public/products/sotro/icon.svg", "utf8");
  const kit = readFileSync(
    `${KIT_LOCKUPS}/sotro_endorsed_lockup_light.svg`,
    "utf8",
  );
  assert.notEqual(kit, buildSotroLockup(kit, icon));
  assert.throws(() => buildSotroLockup("<svg></svg>", icon));
  assert.throws(() => buildSotroLockup(kit, '<svg viewBox="0 0 64 64"></svg>'));
});

test("the other four products keep their kit marks (byte-identical product icons and lockups)", () => {
  for (const product of ["apexagent", "fluentarc", "sotam", "vungtaylai"]) {
    assert.equal(
      sha(readFileSync(`${PRODUCTS}/${product}.svg`)),
      sha(
        readFileSync(
          `brand/blueskyz-production-v4/03_ICONS/03_PRODUCT_ICONS/${product}.svg`,
        ),
      ),
      product,
    );
  }
});

test("the deviation is recorded with date, decision and reason", () => {
  const doc = readFileSync(
    "docs/brand/DEVIATION_SOTRO_PRODUCT_ICON_2026-10-01.md",
    "utf8",
  );
  for (const needle of [
    "2026-10-01",
    "Owner",
    "Brand Guidelines v4",
    "2026-08-10",
    "masterbrand",
    "2x",
  ]) {
    assert.ok(
      doc.toLowerCase().includes(needle.toLowerCase()),
      `deviation record mentions ${needle}`,
    );
  }
});
