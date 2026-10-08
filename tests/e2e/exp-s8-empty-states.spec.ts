import { expect, test } from "@playwright/test";

const LOCALES = ["en", "vi", "zh", "zh-hant"] as const;
const FOUNDER_TITLE: Record<(typeof LOCALES)[number], string> = {
  en: "Founder & CEO",
  vi: "Nhà sáng lập kiêm CEO",
  zh: "创始人兼首席执行官",
  "zh-hant": "創辦人兼執行長",
};
const MISSION = {
  en: /We build intelligent products that empower people and elevate the way work gets done\./,
  vi: /Chúng tôi xây dựng sản phẩm thông minh/,
  zh: /我们打造智能化产品/,
  "zh-hant": /我們打造智慧化產品/,
} as const;
const EMAIL =
  /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/;
const PHONE = /(?:\+\d{1,3}[ .-]?)\(?\d{1,4}\)?[ .-]\d{3}[ .-]?\d{3,4}/;
const FOUNDER = /Tony Nguyen|Founder|\bCEO\b|Nhà sáng lập|创始人|創辦人|執行長/;

const words = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

// The plan budgets are English words. Vietnamese separates every syllable with
// a space (about 1.6x the English token count) and Chinese has no spaces, so
// those locales are measured in their own unit against a scaled budget.
function size(lang: string, text: string) {
  return lang === "zh" || lang === "zh-hant"
    ? text.replace(/\s/g, "").length
    : words(text);
}
function budget(lang: string, englishWords: number) {
  if (lang === "vi") return Math.round(englishWords * 1.6);
  if (lang === "zh" || lang === "zh-hant") return englishWords * 2;
  return englishWords;
}

for (const lang of LOCALES) {
  test.describe(`S8 empty states /${lang}/`, () => {
    test("contact: one primary action to a real route, no invented mailbox", async ({
      page,
    }) => {
      await page.goto(`/${lang}/contact/`);
      const main = page.locator("main");
      const text = await main.innerText();
      expect(size(lang, text), "contact visible size").toBeLessThanOrEqual(
        budget(lang, 100),
      );
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

    test("about: owner-confirmed identity, mission, and registry products", async ({
      page,
    }) => {
      await page.goto(`/${lang}/about/`);
      const text = await page.locator("main").innerText();
      expect(size(lang, text), "about visible size").toBeLessThanOrEqual(
        budget(lang, 150),
      );
      const normalizedText = text.toLocaleLowerCase();
      expect(normalizedText).toContain("tony nguyen");
      expect(normalizedText).toContain(FOUNDER_TITLE[lang].toLocaleLowerCase());
      expect(text).toContain("2026");
      expect(text).toMatch(MISSION[lang]);
      expect(text).toMatch(FOUNDER);
      expect(text).not.toMatch(EMAIL);
      const products = page.locator(
        "[data-about-composition] [data-about-product]",
      );
      await expect(products).toHaveCount(2);
      await expect(
        page.locator(
          "[data-about-composition] [data-product-status='In development']",
        ),
      ).toHaveCount(2);
    });

    test("product without captures shows no artwork, no device frame, status once", async ({
      page,
    }) => {
      await page.goto(`/${lang}/products/sotam/`);
      const stage = page.locator("[data-no-capture]");
      await expect(stage).toHaveCount(1);
      // v8 W3 (OG-3): the Sổ Tâm artwork carries an unconfirmed tagline, so no
      // artwork renders; only the status-honest line remains.
      await expect(stage.locator("img, [data-media-kind]")).toHaveCount(0);
      await expect(page.locator("[data-product-visual]")).toHaveCount(0);
      await expect(
        page.locator(".showcase__device, .showcase__phone"),
      ).toHaveCount(0);
      await expect(page.locator("[data-product-status]")).toHaveCount(1);
      // v7 D-13: the current stage only; no "next" line, no stage list.
      await expect(page.locator("[data-product-ladder]")).toHaveCount(1);
      await expect(page.locator("[data-product-ladder] strong")).toHaveCount(1);
      await expect(page.locator("[data-product-ladder] details")).toHaveCount(
        0,
      );
      await expect(page.locator("[data-product-ladder] li")).toHaveCount(0);
      await expect(page.locator("[data-product-ladder]")).not.toContainText(
        /next in the ladder|giai đoạn kế tiếp|下一阶段|下一階段|all stages|tất cả giai đoạn/i,
      );
    });
  });
}

test("negative proof: the word-count detector rejects 151 words", () => {
  expect(words(Array(151).fill("w").join(" "))).toBeGreaterThan(150);
  expect(EMAIL.test("a@b.co")).toBe(true);
  expect(FOUNDER.test("Tony Nguyen — Founder & CEO")).toBe(true);
});
