import { expect, test } from "@playwright/test";

/**
 * Wave H12 — WCAG 1.4.4 (Resize text): at 200% text zoom on a 390px viewport
 * the page must not scroll sideways. Found live: the contact cards' grid items
 * could not shrink (min-width: auto), the source-trace steps pinned their
 * min-content, and the security h1's longest word could not break ("Report
 * privately, responsibly"). All three fixed in CSS; this spec is the guard.
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
  "/en/privacy/",
  "/vi/privacy/",
  "/en/security/",
  "/vi/security/",
  "/en/decision-room/",
  "/vi/decision-room/",
  "/en/evidence/security-reporting-is-private/",
  "/vi/evidence/security-reporting-is-private/",
];

test.describe("text zoom 200%", () => {
  test.use({ viewport: { width: 390, height: 900 } });

  for (const route of ROUTES) {
    test(`${route} does not scroll sideways at 200% text`, async ({ page }) => {
      await page.goto(route);
      const result = await page.evaluate(async () => {
        document.documentElement.style.fontSize = "200%";
        await new Promise((resolve) =>
          requestAnimationFrame(() => resolve(null)),
        );
        const doc = document.documentElement;
        let offender: string | null = null;
        const overflow = doc.scrollWidth - window.innerWidth;
        if (overflow > 1) {
          // Decorative bleed inside an overflow-hidden ancestor cannot create
          // document scroll; report the widest element that is NOT clipped.
          const isClipped = (el: Element): boolean => {
            let node = el.parentElement;
            while (node && node !== document.documentElement) {
              const cs = getComputedStyle(node);
              if (/(hidden|clip|auto|scroll)/.test(cs.overflowX)) return true;
              node = node.parentElement;
            }
            return false;
          };
          const candidates = [
            ...document.querySelectorAll<HTMLElement>("body *"),
          ]
            .map((el) => ({ el, right: el.getBoundingClientRect().right }))
            .filter((entry) => entry.right > window.innerWidth + 1)
            .sort((a, b) => b.right - a.right);
          const widest =
            candidates.find((entry) => !isClipped(entry.el)) ?? candidates[0];
          if (widest) {
            offender = `${widest.el.tagName.toLowerCase()}.${[...widest.el.classList].slice(0, 3).join(".")} (right ${Math.round(widest.right)}px${isClipped(widest.el) ? ", clipped" : ""})`;
          }
        }
        return { overflow, offender };
      });
      expect(
        result.overflow,
        `overflow ${result.overflow}px${result.offender ? ` — widest: ${result.offender}` : ""}`,
      ).toBeLessThanOrEqual(1);
    });
  }
});
