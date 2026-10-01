/**
 * Screenshot capture for the 2026-10-01 brand sync (Sổ Trọ icon + conformance fixes).
 *   node docs/brand/evidence/2026-10-01/capture.mjs [baseUrl] [outDir]
 * Needs `astro preview --port 4329` serving the built site and a Chromium build:
 * set CHROMIUM (default /opt/pw-browsers/chromium-1194/chrome-linux/chrome).
 * Pages: /en/ (home), /en/products/, /en/products/sotro/; 1440, 390, 320 px; light and dark.
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const base = process.argv[2] ?? "http://127.0.0.1:4329";
const out = process.argv[3] ?? "docs/brand/evidence/2026-10-01";
const pages = [
  ["home", "/en/"],
  ["products", "/en/products/"],
  ["sotro", "/en/products/sotro/"],
];
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({
  executablePath:
    process.env.CHROMIUM ??
    "/opt/pw-browsers/chromium-1194/chrome-linux/chrome",
});
for (const width of [1440, 390, 320]) {
  for (const scheme of ["light", "dark"]) {
    const context = await browser.newContext({
      viewport: { width, height: 900 },
      colorScheme: scheme,
      reducedMotion: "reduce",
    });
    for (const [name, path] of pages) {
      const page = await context.newPage();
      await page.goto(base + path, { waitUntil: "networkidle" });
      await page.evaluate(() => document.fonts.ready);
      // Scroll through the page so lazy images and below-the-fold media load.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) {
          window.scrollTo(0, y);
          await new Promise((resolve) => setTimeout(resolve, 60));
        }
        window.scrollTo(0, 0);
      });
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(300);
      await page.screenshot({
        path: `${out}/${name}-${width}-${scheme}.jpg`,
        type: "jpeg",
        quality: 50,
        fullPage: true,
      });
      await page.close();
    }
    await context.close();
  }
}
await browser.close();
