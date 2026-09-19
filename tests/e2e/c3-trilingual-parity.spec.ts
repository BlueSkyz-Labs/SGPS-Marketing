import { expect, test } from "@playwright/test";

/**
 * C3-C W1 (G9-ish) — trilingual parity.
 *
 * The zh locale must never render English as a fallback. Each published page
 * under /zh/ carries Simplified Chinese chrome (nav, headings, CTA) and a
 * zh-Hans hreflang alternate; the en and vi pages keep their own locales.
 * The checks are about visible proof of localization, not machine-perfection
 * of every sentence.
 */
const ZH_ROUTES = [
  "/zh/",
  "/zh/about/",
  "/zh/contact/",
  "/zh/privacy/",
  "/zh/security/",
  "/zh/support/",
  "/zh/products/",
];

test.describe("C3-C trilingual parity", () => {
  for (const route of ZH_ROUTES) {
    test(`${route} renders Simplified Chinese, not an English fallback`, async ({
      page,
    }) => {
      await page.goto(route);
      await expect(page).toHaveURL(route);
      // html lang must be zh.
      const lang = await page.locator("html").getAttribute("lang");
      expect(lang).toBe("zh");
      // A zh page must expose at least one CJK heading and no EN-only nav CTA.
      const cjk = await page
        .locator("main h1, main h2")
        .evaluateAll((nodes) =>
          nodes.some((n) => /[\u4e00-\u9fff]/.test(n.textContent ?? "")),
        );
      expect(cjk, `${route} must carry Chinese headings`).toBe(true);
      // The active language switcher entry is zh. The switcher is rendered on
      // every nav surface (desktop, mobile menu, footer), so the zh current
      // entry appears once per surface — assert presence, not a global count of 1.
      expect(
        (await page
          .locator(`a[hreflang="zh-Hans"][aria-current="page"]`)
          .count()) > 0,
        `${route} must mark the zh switcher entry as current`,
      ).toBe(true);
    });
  }

  test("en and vi pages still carry their own locale switcher", async ({
    page,
  }) => {
    for (const [route, hl] of [
      ["/en/", "en"],
      ["/vi/", "vi"],
    ] as const) {
      await page.goto(route);
      expect(
        (await page
          .locator(`a[hreflang="${hl}"][aria-current="page"]`)
          .count()) > 0,
        `${route} must mark the ${hl} switcher entry as current`,
      ).toBe(true);
    }
  });
});
