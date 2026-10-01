/**
 * Sổ Trọ endorsed-lockup builder (Owner decision 2026-10-01, DEVIATION from
 * Brand Kit v4 — see docs/brand/DEVIATION_SOTRO_PRODUCT_ICON_2026-10-01.md).
 *
 * Pure string transform: take the kit's `sotro_endorsed_lockup_{light,dark}.svg`
 * and replace ONLY the blue-house glyph group with the Owner-approved red-book
 * app icon (the Sotro repo's `public/icons/icon.svg`, 512 viewBox), placed in
 * the same 275.2 x 275.2 box at the same origin (translate(40 70), 4.3 x 64).
 * Every other byte (product name, descriptor, "A BlueSkyz Labs product",
 * viewBox, aria-label, fills) is the kit's. Used by the generator and by the
 * architecture guard, so the committed lockups are provably derivable.
 */

const HOUSE_GROUP = /<g transform="translate\(40 70\) scale\(4\.3\)">.*?<\/g>/s;
const ICON_BOX = 64 * 4.3; // 275.2 user units, the kit glyph box

/** Inner markup of the app icon: no xmlns/size attributes, no comments, ids namespaced. */
export function iconInner(iconSvg) {
  const open = iconSvg.match(/<svg\b[^>]*>/);
  if (!open || !/viewBox="0 0 512 512"/.test(open[0])) {
    throw new Error("Sổ Trọ icon must be an SVG with viewBox 0 0 512 512");
  }
  const body = iconSvg
    .slice(open.index + open[0].length, iconSvg.lastIndexOf("</svg>"))
    .replace(/<!--.*?-->/gs, "")
    .replace(/>\s+</g, "><")
    .trim();
  return body
    .replace(
      /\b(id|href|xlink:href)="(#?)(bgRuby|goldLedger|shadow)"/g,
      '$1="$2sotro-$3"',
    )
    .replace(/url\(#(bgRuby|goldLedger|shadow)\)/g, "url(#sotro-$1)");
}

export function buildSotroLockup(kitLockupSvg, iconSvg) {
  if (!HOUSE_GROUP.test(kitLockupSvg)) {
    throw new Error("kit lockup no longer starts with the house glyph group");
  }
  const nested =
    `<svg x="40" y="70" width="${ICON_BOX}" height="${ICON_BOX}" viewBox="0 0 512 512">` +
    iconInner(iconSvg) +
    "</svg>";
  return kitLockupSvg.replace(HOUSE_GROUP, () => nested);
}

/**
 * Same layout with the raster app icon embedded, for rendering large identity
 * art. The raster is clipped to the same 25 % corner radius as the app's own
 * vector (rx 128 of 512) so the vector and raster lockups read as one mark.
 */
export function buildSotroLockupWithRaster(kitLockupSvg, rasterDataUri) {
  if (!HOUSE_GROUP.test(kitLockupSvg)) {
    throw new Error("kit lockup no longer starts with the house glyph group");
  }
  const image =
    `<clipPath id="sotro-icon-clip"><rect x="40" y="70" width="${ICON_BOX}" height="${ICON_BOX}" rx="${ICON_BOX / 4}"/></clipPath>` +
    `<image x="40" y="70" width="${ICON_BOX}" height="${ICON_BOX}" clip-path="url(#sotro-icon-clip)" href="${rasterDataUri}"/>`;
  return kitLockupSvg.replace(HOUSE_GROUP, () => image);
}
