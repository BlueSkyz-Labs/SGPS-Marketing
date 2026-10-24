/** Shared page shell for journal art: brand fonts, palette, engraving hatches. */
import { STAMP_CSS } from "./stamp.mjs";

const FONT_DIR = new URL("../../public/fonts/", import.meta.url).href;

export const INK = "#0b1020";
export const COBALT = "#2564ff";
export const PORCELAIN = "#f7f8fa";
export const TINT = "#eef2ff";

/** SVG <defs> with engraving hatches reused by every illustration. */
export const HATCH_DEFS = `
<pattern id="h-fine" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 3H6" stroke="${INK}" stroke-width="1.1"/></pattern>
<pattern id="h-mid" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 3H6" stroke="${INK}" stroke-width="2.2"/></pattern>
<pattern id="h-diag" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 3.5H7" stroke="${INK}" stroke-width="1.4"/></pattern>
<pattern id="h-cross" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><path d="M0 3.5H7M3.5 0V7" stroke="${INK}" stroke-width="1.3"/></pattern>
<pattern id="h-cobalt" width="6" height="6" patternUnits="userSpaceOnUse"><path d="M0 3H6" stroke="${COBALT}" stroke-width="1.6"/></pattern>`;

export function page({ width, height, css = "", body }) {
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face { font-family: "Inter Variable"; font-weight: 100 900; src: url("${FONT_DIR}inter-latin-wght-v5.3.0.woff2") format("woff2"); }
@font-face { font-family: "Inter Variable"; font-weight: 100 900; src: url("${FONT_DIR}inter-vietnamese-wght-v5.3.0.woff2") format("woff2");
  unicode-range: U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: ${width}px; height: ${height}px; }
body { position: relative; overflow: hidden; background: ${PORCELAIN}; color: ${INK};
  font-family: "Inter Variable", sans-serif; font-feature-settings: "tnum" 1; -webkit-font-smoothing: antialiased; }
${STAMP_CSS}
${css}
</style></head><body>${body}</body></html>`;
}
