import { expect, test } from "@playwright/test";

// CX audit H1: Support must not be a dead end. With a published support
// mailbox (Owner 2026-10-18, A-02) the mailbox is the single primary action;
// Security stays a secondary link for vulnerability reports only, and the Sổ
// Trọ guide button no longer promises "support".

const LANGS = ["en", "vi", "zh", "zh-hant"] as const;
const SUPPORT_WORDS = /support|hỗ trợ|支持|支援/i;
const SUPPORT_MAILTO = "mailto:support@blueskyzlabs.com";

for (const lang of LANGS) {
  test.describe(`CX1 support path /${lang}/`, () => {
    test("Support: first CTA is the support mailbox, Security is secondary", async ({
      page,
    }) => {
      await page.goto(`/${lang}/support/`);
      const actions = page.locator("main [data-support-actions] a");
      await expect(actions).toHaveCount(2);
      expect(await actions.nth(0).getAttribute("href")).toBe(SUPPORT_MAILTO);
      expect(await actions.nth(1).getAttribute("href")).toBe(
        `/${lang}/security/`,
      );
      await expect(page.locator("[data-support-primary]")).toHaveAttribute(
        "href",
        SUPPORT_MAILTO,
      );
      await expect(page.locator("main .btn--primary")).toHaveCount(1);
    });

    test("Support: one mailbox, no response-time promise", async ({ page }) => {
      await page.goto(`/${lang}/support/`);
      const text = (await page.locator("main").innerText()).toLowerCase();
      expect(text).not.toMatch(/24 ?h|48 ?h|within|trong vòng|小时内|小時內/);
      const mailtos = page.locator("main a[href^='mailto:']");
      await expect(mailtos).toHaveCount(1);
      await expect(mailtos).toHaveAttribute("href", SUPPORT_MAILTO);
    });

    test("Contact destination is a real page, not a dead end", async ({
      page,
    }) => {
      const res = await page.goto(`/${lang}/contact/`);
      expect(res?.status()).toBe(200);
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
  expect(firstHref(["/en/security/", SUPPORT_MAILTO])).not.toBe(SUPPORT_MAILTO);
  expect(firstHref(["/en/contact/", "/en/security/"])).not.toBe(SUPPORT_MAILTO);
  expect("mailto:security@blueskyzlabs.com").not.toBe(SUPPORT_MAILTO);
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
