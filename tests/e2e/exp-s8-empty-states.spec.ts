import { expect, test } from "@playwright/test";

const LOCALES = ["en", "vi", "zh", "zh-hant"] as const;
const EMAIL =
  /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/;
const PHONE = /(?:\+\d{1,3}[ .-]?)\(?\d{1,4}\)?[ .-]\d{3}[ .-]?\d{3,4}/;
const FOUNDER = /Tony Nguyen|Founder|\bCEO\b|Nhà sáng lập|创始人|創辦人|執行長/;

const words = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

for (const lang of LOCALES) {
  test.describe(`S8 empty states /${lang}/`, () => {
    test("contact: one primary action to a real route, no invented mailbox", async ({
      page,
    }) => {
      await page.goto(`/${lang}/contact/`);
      const main = page.locator("main");
      const text = await main.innerText();
      expect(words(text), "contact visible words").toBeLessThanOrEqual(100);
      expect(text).not.toMatch(EMAIL);
      expect(text).not.toMatch(PHONE);
      await expect(page.locator('main a[href^="mailto:"]')).toHaveCount(0);
      await expect(page.locator('main a[href^="tel:"]')).toHaveCount(0);
      const primary = page.locator("main [data-safe-action] a");
      await expect(primary).toHaveCount(1);
      await expect(primary).toHaveAttribute(
        "href",
        /^https:\/\/github\.com\/BlueSkyz-Labs\/SGPS-Marketing\/security\/advisories\/new$/,
      );
      await expect(page.locator("[data-contact-signin]")).not.toHaveCount(0);
      await expect(
        page.locator('[data-contact-lane="business-state"] a'),
      ).toHaveAttribute("href", new RegExp(`^/${lang}/about/$`));
    });

    test("about: at most 150 words, no founder line", async ({ page }) => {
      await page.goto(`/${lang}/about/`);
      const text = await page.locator("main").innerText();
      expect(words(text), "about visible words").toBeLessThanOrEqual(150);
      expect(text).not.toMatch(FOUNDER);
      expect(text).not.toMatch(EMAIL);
    });

    test("product without captures shows identity art, no device frame, status once", async ({
      page,
    }) => {
      await page.goto(`/${lang}/products/sotam/`);
      const stage = page.locator("[data-no-capture]");
      await expect(stage).toHaveCount(1);
      await expect(
        stage.locator('[data-media-kind="identity-art"]'),
      ).toHaveCount(1);
      await expect(
        page.locator(".showcase__device, .showcase__phone"),
      ).toHaveCount(0);
      await expect(page.locator("[data-product-status]")).toHaveCount(1);
      await expect(page.locator("[data-product-ladder] details")).toHaveCount(
        1,
      );
      await expect(
        page.locator("[data-product-ladder] details"),
      ).not.toHaveAttribute("open", "");
      await expect(page.locator("[data-product-ladder] li")).toHaveCount(8);
    });
  });
}

test("negative proof: the word-count detector rejects 151 words", () => {
  expect(words(Array(151).fill("w").join(" "))).toBeGreaterThan(150);
  expect(EMAIL.test("a@b.co")).toBe(true);
  expect(FOUNDER.test("Tony Nguyen — Founder & CEO")).toBe(true);
});
