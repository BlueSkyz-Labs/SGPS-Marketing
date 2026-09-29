import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { test } from "node:test";

const css = readFileSync("src/styles/global.css", "utf8");
const layout = readFileSync("src/layouts/BaseLayout.astro", "utf8");
const fontFaces = css.match(/@font-face\s*\{[^}]+\}/g) ?? [];

test("self-hosted Inter subsets are licensed, subsetted and discovered once", () => {
  const latin = "public/fonts/inter-latin-opsz-v5.3.0.woff2";
  const vietnamese = "public/fonts/inter-vietnamese-opsz-v5.3.0.woff2";
  assert.ok(statSync(latin).size + statSync(vietnamese).size <= 100_000);
  assert.match(
    readFileSync("public/fonts/OFL.txt", "utf8"),
    /SIL OPEN FONT LICENSE Version 1\.1/,
  );
  for (const subset of ["latin", "vietnamese"]) {
    assert.ok(
      fontFaces.some(
        (face) =>
          face.includes(`inter-${subset}-opsz-v5.3.0.woff2`) &&
          /unicode-range\s*:/.test(face),
      ),
      `${subset} Inter face must be subsetted by unicode range`,
    );
  }
  // size-adjust is calibrated against the self-hosted Inter (h1 473 px at
  // 107 % vs 506 px for Inter = +6.98 %), so the fallback wraps like Inter for
  // the hero; the engine-aware preload below is what keeps Chromium CLS at 0.
  assert.match(css, /size-adjust\s*:\s*114\.5%/);
  // Fonts must not be preloaded straight from the HTML: WebKit downloads any
  // preloaded subset twice, and Firefox downloads one twice without
  // `crossorigin`. public/theme-init.js injects the preload only for engines
  // that reuse it (measured 2026-09-29: 177 KB doubled vs 88 KB single /vi/).
  assert.doesNotMatch(
    layout,
    /rel="preload"[^>]*as="font"/,
    "font preloads double-fetch on WebKit; inject them engine-aware instead",
  );
  assert.doesNotMatch(layout, /inter-(latin|vietnamese)-opsz-v5\.3\.0\.woff2/);
  const bootstrap = readFileSync("public/theme-init.js", "utf8");
  assert.match(
    bootstrap,
    /AppleWebKit/,
    "theme-init.js must gate the font preload on the engine that reuses it",
  );
  assert.match(bootstrap, /rel = "preload"/);
  assert.match(bootstrap, /inter-\$\{subset\}-opsz-v5\.3\.0\.woff2/);
});
