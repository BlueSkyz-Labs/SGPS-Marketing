import { expect, test } from "@playwright/test";

/**
 * C2 — six-act homepage narrative.
 * The homepage must be product-led and static-first: hero and every narrative
 * act are present in both locales at desktop and 390px, and with an empty
 * public registry the product acts fall back honestly — no fabricated flagship
 * or product card may appear.
 */
const LOCALES = [
  { path: "/en/", lang: "en" },
  { path: "/vi/", lang: "vi" },
] as const;

const ONE_HOUSE_CONCEPTS = {
  en: [
    "Clarity",
    "Human agency",
    "Purposeful intelligence",
    "Trust by design",
  ],
  vi: [
    "Rõ ràng",
    "Con người giữ quyền chủ động",
    "Trí tuệ có mục đích",
    "Tin cậy ngay từ thiết kế",
  ],
} as const;

const VIEWPORTS = [
  { name: "desktop", width: 1280, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

for (const viewport of VIEWPORTS) {
  test.describe(`${viewport.name} (${viewport.width}px)`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    for (const locale of LOCALES) {
      test(`${locale.path} renders the six-act narrative`, async ({ page }) => {
        await page.goto(locale.path);

        // Act I — Arrival: H1 and the primary action are immediately usable.
        await expect(page.locator("h1").first()).toBeVisible();
        await expect(page.locator("main a").first()).toBeVisible();

        // Act II — product acts exist as sections.
        await expect(page.locator("[data-product-house]")).toHaveCount(1);

        // Acts III–VI — meaning, trust, human, action.
        await expect(
          page.getByRole("heading", { level: 2 }).first(),
        ).toBeVisible();
        const headings = await page.locator("main h2").allTextContents();
        expect(headings.length).toBeGreaterThanOrEqual(3);

        // Anchors remain the authority: at least one real link per act region.
        const links = await page.locator("main a[href^='/']").count();
        expect(links).toBeGreaterThan(2);
      });

      test(`${locale.path} presents One House as plain-language editorial philosophy`, async ({
        page,
      }) => {
        await page.goto(locale.path);

        const oneHouse = page.locator("[data-one-house-editorial]");
        await expect(oneHouse).toBeVisible();
        await expect(oneHouse.locator("[data-one-house-concept]")).toHaveCount(4);

        for (const label of ONE_HOUSE_CONCEPTS[locale.lang]) {
          await expect(
            oneHouse.getByRole("heading", { level: 3, name: label }),
          ).toBeVisible();
        }

        // C2 replaces the equal framework matrix on the homepage with an
        // editorial interlude. The matrix may continue to exist elsewhere.
        await expect(page.locator("[data-principle-matrix]")).toHaveCount(0);

        const text = await oneHouse.textContent();
        expect(text ?? "").not.toMatch(/every product.*AI|mọi sản phẩm.*AI/i);
      });

      test(`${locale.path} does not fabricate a product when the registry is empty`, async ({
        page,
      }) => {
        await page.goto(locale.path);
        // Empty public registry: the flagship act renders nothing at all…
        await expect(page.locator("[data-flagship-theatre]")).toHaveCount(0);
        // …and no product card is invented.
        await expect(page.locator("[data-product-card]")).toHaveCount(0);
        // The honest fallback statement is present instead.
        await expect(page.locator("[data-product-house]")).toContainText(
          /proof|bằng chứng/i,
        );
        // With an empty registry, no product cards exist and no hierarchy tier is emitted.
        await expect(page.locator("[data-product-card]")).toHaveCount(0);
        await expect(page.locator('[data-product-tier="hero"]')).toHaveCount(0);
      });

      test(`${locale.path} does not scroll sideways`, async ({ page }) => {
        await page.goto(locale.path);
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth,
        );
        expect(overflow).toBeLessThanOrEqual(1);
      });
    }
  });
}

test("the demoted discovery surfaces are re-homed, not deleted", async ({
  page,
}) => {
  // Product discovery/comparison still works: the lens and the exploration
  // tool render on the product index, wired to the site-wide journey bar.
  await page.goto("/en/products/");
  await expect(page.locator("[data-intent-lens]")).toBeVisible();
  await expect(page.locator("[data-atlas]")).toBeVisible();
  await expect(page.locator("[data-journey-bar]")).toBeVisible();
  // …and they are absent from the homepage narrative.
  await page.goto("/en/");
  await expect(page.locator("[data-intent-lens]")).toHaveCount(0);
  await expect(page.locator("[data-atlas]")).toHaveCount(0);

  // The command navigator (power-user entry point) still works.
  await page.keyboard.press("Control+k");
  await expect(page.locator("[data-command-navigator]")).toBeVisible();
});
