import { expect, test } from "@playwright/test";

/**
 * Wave H8 — mobile overflow sweep.
 * Component specs check their own 320px behaviour; nothing swept *every*
 * public route. A single route that scrolls sideways on a 320px phone is a
 * real-user failure (Vietnam reality: small Android viewports are common).
 */
const ROUTES = [
  "/en/",
  "/vi/",
  "/en/about/",
  "/vi/about/",
  "/en/products/",
  "/vi/products/",
  "/en/contact/",
  "/vi/contact/",
  "/en/support/",
  "/vi/support/",
  "/en/privacy/",
  "/vi/privacy/",
  "/en/security/",
  "/vi/security/",
  "/en/decision-room/",
  "/vi/decision-room/",
  "/en/evidence/security-reporting-is-private/",
  "/vi/evidence/security-reporting-is-private/",
  "/en/404/",
  "/vi/404/",
];

const WIDTHS = [320, 390];

for (const width of WIDTHS) {
  test.describe(`${width}px sweep`, () => {
    test.use({ viewport: { width, height: 900 } });

    for (const route of ROUTES) {
      test(`${route} does not scroll sideways`, async ({ page }) => {
        await page.goto(route);
        const result = await page.evaluate(() => {
          const doc = document.documentElement;
          const overflow = doc.scrollWidth - window.innerWidth;
          let offender: string | null = null;
          if (overflow > 1) {
            const widest = [...document.querySelectorAll<HTMLElement>("body *")]
              .map((el) => ({
                el,
                right: el.getBoundingClientRect().right,
              }))
              .filter((entry) => entry.right > window.innerWidth + 1)
              .sort((a, b) => b.right - a.right)[0];
            if (widest) {
              offender = `${widest.el.tagName.toLowerCase()}.${[...widest.el.classList].slice(0, 3).join(".")} (right edge ${Math.round(widest.right)}px)`;
            }
          }
          return { overflow, offender };
        });
        expect(
          result.overflow,
          `horizontal overflow of ${result.overflow}px${result.offender ? ` — widest offender: ${result.offender}` : ""}`,
        ).toBeLessThanOrEqual(1);
      });
    }
  });
}
