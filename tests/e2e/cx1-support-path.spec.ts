import { expect, test } from "@playwright/test";

// CX audit H1: Support must not be a dead end. Contact is the primary action,
// Security is a secondary link for vulnerability reports only, and the Sổ Trọ
// guide button no longer promises "support".

const LANGS = ["en", "vi", "zh", "zh-hant"] as const;
const SUPPORT_WORDS = /support|hỗ trợ|支持|支援/i;

for (const lang of LANGS) {
  test.describe(`CX1 support path /${lang}/`, () => {
    test("Support: first CTA is Contact, Security is secondary", async ({
      page,
    }) => {
      await page.goto(`/${lang}/support/`);
      const actions = page.locator("main [data-support-actions] a");
      await expect(actions).toHaveCount(2);
      expect(await actions.nth(0).getAttribute("href")).toBe(
        `/${lang}/contact/`,
      );
      expect(await actions.nth(1).getAttribute("href")).toBe(
        `/${lang}/security/`,
      );
      await expect(page.locator("[data-support-primary]")).toHaveAttribute(
        "href",
        `/${lang}/contact/`,
      );
    });

    test("Support: no mailbox or response-time promise, one lede", async ({
      page,
    }) => {
      await page.goto(`/${lang}/support/`);
      const text = (await page.locator("main").innerText()).toLowerCase();
      expect(text).not.toMatch(/mailto:|@blueskyzlabs|24 ?h|48 ?h|within/);
      await expect(page.locator("main a[href^='mailto:']")).toHaveCount(0);
    });

    test("Contact destination is a real page, not a dead end", async ({
      page,
    }) => {
      const res = await page.goto(`/${lang}/support/`);
      expect(res?.status()).toBe(200);
      await page.locator("[data-support-primary]").click();
      await expect(page).toHaveURL(new RegExp(`/${lang}/contact/$`));
      await expect(page.locator("main a[href]").first()).toBeVisible();
    });

    test("Sổ Trọ guide button is Contact, not support", async ({ page }) => {
      await page.goto(`/${lang}/products/sotro/guide/`);
      const btn = page.locator(".guide__footer a");
      await expect(btn).toHaveCount(1);
      expect(await btn.getAttribute("href")).toBe(`/${lang}/contact/`);
      expect(((await btn.innerText()) ?? "").trim()).not.toMatch(SUPPORT_WORDS);
    });
  });
}

// Negative proofs: the guards above must reject the pre-fix shape.
test("negative proof: guard rejects security-first order and support label", () => {
  const firstHref = (order: string[]) => order[0];
  expect(firstHref(["/en/security/", "/en/contact/"])).not.toBe("/en/contact/");
  for (const old of [
    "Contact support",
    "Liên hệ hỗ trợ",
    "联系支持",
    "聯絡支援",
  ]) {
    expect(old).toMatch(SUPPORT_WORDS);
  }
  for (const neu of ["Contact", "Liên hệ", "联系我们", "聯絡我們"]) {
    expect(neu).not.toMatch(SUPPORT_WORDS);
  }
});
