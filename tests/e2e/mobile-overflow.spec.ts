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

const VIEWPORTS = [
  { name: "320px narrow phone", width: 320, height: 780 },
  { name: "390px phone", width: 390, height: 844 },
  { name: "foldable cover compact portrait", width: 360, height: 780 },
  { name: "foldable cover large portrait", width: 402, height: 874 },
  { name: "foldable cover landscape", width: 780, height: 360 },
  { name: "foldable inner compact portrait", width: 720, height: 960 },
  { name: "foldable inner large portrait", width: 840, height: 1120 },
  { name: "foldable inner landscape", width: 1024, height: 768 },
  { name: "foldable inner short landscape", width: 840, height: 600 },
];

const FOLDABLE_ROUTES = ["en", "vi", "zh", "zh-hant"].flatMap((lang) => [
  `/${lang}/`,
  `/${lang}/about/`,
  `/${lang}/products/`,
  `/${lang}/products/sotro/`,
  `/${lang}/products/sotam/`,
]);

async function expectNoHorizontalOverflow(
  page: import("@playwright/test").Page,
) {
  const result = await page.evaluate(() => {
    const doc = document.documentElement;
    const overflow = doc.scrollWidth - window.innerWidth;
    let offender: string | null = null;
    if (overflow > 1) {
      const widest = [...document.querySelectorAll<HTMLElement>("body *")]
        .map((el) => ({ el, right: el.getBoundingClientRect().right }))
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
}

for (const viewport of VIEWPORTS) {
  test.describe(`${viewport.name} sweep`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    for (const route of ROUTES) {
      test(`${route} does not scroll sideways`, async ({ page }) => {
        await page.goto(route);
        await expectNoHorizontalOverflow(page);
      });
    }
  });
}

for (const viewport of VIEWPORTS.slice(2)) {
  test.describe(`${viewport.name} high-traffic routes`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    for (const route of FOLDABLE_ROUTES) {
      test(`${route} does not scroll sideways`, async ({ page }) => {
        await page.goto(route);
        await expectNoHorizontalOverflow(page);
      });
    }
  });
}
