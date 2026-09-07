export const BRAND_KIT = {
  canonical: {
    name: "BlueSkyzLabs_Brand_Kit_Production_v4",
    version: "v4",
    assetRoot: "/brand/blueskyz/v4",
    archive: "BlueSkyzLabs_Brand_Kit_Production_v4.zip",
    expectedSha256:
      "9534d34ef91a039f59da916426f4ca465c142d743c0b263671e9d0411693b75d",
  },
  runtime: {
    source: "legacy-r4d-fallback",
    assetRoot: "/brand/blueskyz/r4d",
    reason:
      "Exact Production v4 archive bytes are not yet imported into this repository.",
  },
} as const;

const legacyRoot = BRAND_KIT.runtime.assetRoot;

/**
 * Temporary runtime projection only. Production v4 is canonical; replace this
 * map with checksum-verified v4 exports once the canonical archive is imported.
 */
export const BRAND_ASSETS = {
  lockupHorizontalDark: `${legacyRoot}/lockup_horizontal_dark.svg`,
  lockupHorizontalLight: `${legacyRoot}/lockup_horizontal_light.svg`,
  materialExpression: `${legacyRoot}/symbol_material_expression.svg`,
  faviconSvg: `${legacyRoot}/micro_mark_ink.svg`,
  fallbackThemeColor: "#0B1020",
} as const;
