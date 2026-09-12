import { expect, test } from "@playwright/test";

/**
 * Wave H13 — WCAG 1.4.12 (Text spacing).
 * Classic overrides (line-height 1.5, letter-spacing 0.12em, word-spacing
 * 0.16em, paragraph spacing 2em) must not clip or overflow content.
 * The probe pass found no defect; this guard keeps it that way.
 */
const ROUTES = [
  "/en/",
  "/vi/",
  "/en/about/",
  "/en/products/",
  "/en/contact/",
  "/en/security/",
  "/en/privacy/",
  "/en/decision-room/",
  "/en/evidence/security-reporting-is-private/",
];

test.use({ viewport: { width: 390, height: 900 } });

for (const route of ROUTES) {
  test(`${route} survives text-spacing overrides`, async ({ page }) => {
    await page.goto(route);
    const result = await page.evaluate(async () => {
      const style = document.createElement("style");
      style.textContent =
        "* { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }";
      document.head.appendChild(style);
      await new Promise((resolve) =>
        requestAnimationFrame(() => resolve(null)),
      );
      return document.documentElement.scrollWidth - window.innerWidth;
    });
    expect(result).toBeLessThanOrEqual(1);
  });
}
