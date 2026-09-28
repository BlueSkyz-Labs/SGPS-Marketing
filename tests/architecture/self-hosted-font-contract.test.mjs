import assert from "node:assert/strict";
import { readFileSync, statSync } from "node:fs";
import { test } from "node:test";

const css = readFileSync("src/styles/global.css", "utf8");
const layout = readFileSync("src/layouts/BaseLayout.astro", "utf8");
const fontFaces = css.match(/@font-face\s*\{[^}]+\}/g) ?? [];

test("self-hosted Inter subsets are licensed and preloaded before locale text paints", () => {
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
  assert.match(css, /size-adjust\s*:\s*107%/);
  // Latin is used in brand/navigation text in all three locales, including VI.
  // VI additionally preloads its diacritic subset rather than shifting after paint.
  assert.match(
    layout,
    /<link\s+rel="preload"\s+href="\/fonts\/inter-latin-opsz-v5\.3\.0\.woff2"\s+as="font"\s+type="font\/woff2"\s+crossorigin/,
  );
  assert.match(
    layout,
    /currentLang === "vi"\s*\?\s*\(\s*<link\s+rel="preload"\s+href="\/fonts\/inter-vietnamese-opsz-v5\.3\.0\.woff2"\s+as="font"\s+type="font\/woff2"\s+crossorigin/,
  );
});
