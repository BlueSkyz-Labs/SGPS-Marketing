import { expect, test } from "@playwright/test";

/**
 * AI-review fixes to zh / zh-Hant copy (not native-speaker evidence).
 * Each guard asserts the corrected string renders and the old one is absent.
 */
test.describe("zh-Hant Sổ Trọ guide uses Taiwan-standard wording", () => {
  test("pairing step uses 並 and avoids mainland / mis-converted terms", async ({
    page,
  }) => {
    await page.goto("/zh-hant/products/sotro/guide/");
    const main = page.locator("main");
    await expect(main).toContainText("並為其手機建立配對碼或連結");
    await expect(main).toContainText("電表");
    await expect(main).toContainText("結帳");
    await expect(main).not.toContainText("併為其手機");
    await expect(main).not.toContainText("電錶");
    await expect(main).not.toContainText("結賬");
    await expect(main).not.toContainText("後臺");
  });
});

test.describe("contact title no longer implies business cooperation", () => {
  for (const [lang, fixed, old] of [
    ["zh", "联系我们：商务与一般咨询", "商务合作与一般咨询"],
    ["zh-hant", "聯絡我們：商務與一般洽詢", "商務合作與一般洽詢"],
  ] as const) {
    test(`${lang}: corrected contact title`, async ({ page }) => {
      await page.goto(`/${lang}/contact/`);
      await expect(page).toHaveTitle(new RegExp(fixed));
      await expect(page).not.toHaveTitle(new RegExp(old));
    });
  }
});

test.describe("zh claim terminology on evidence surfaces", () => {
  test("zh evidence page says 声明, not 说法", async ({ page }) => {
    await page.goto("/zh/evidence/security-reporting-is-private/");
    await expect(page.locator("[data-passport-page-title]")).toHaveText(
      "这项声明的证据",
    );
    await expect(page.locator("main")).not.toContainText("这条说法的证据");
  });
  test("zh-Hant 404 description reads naturally", async ({ page }) => {
    await page.goto("/zh-hant/404/");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      "找不到你要瀏覽的頁面。",
    );
  });
});
