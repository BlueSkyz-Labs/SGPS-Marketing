import { expect, test } from "@playwright/test";

/**
 * CX6 (CX audit finding M3): "Personal Vault" is translated in the vi, zh
 * and zh-hant So Tam pages (Owner decision 2026-10-12). English keeps it.
 * The chosen terms need Owner review.
 */

const TERM = {
  vi: "kho cá nhân",
  zh: "个人保险库",
  "zh-hant": "個人保險庫",
} as const;

const VAULT_TOKEN = /\bvault\b/i;

for (const [locale, term] of Object.entries(TERM)) {
  test(`${locale} Sổ Tâm page has the localized vault term and no "Vault" token`, async ({
    page,
  }) => {
    await page.goto(`/${locale}/products/sotam/`);
    const text = await page.locator("main").innerText();
    expect(text).toContain(term);
    expect(text).not.toMatch(VAULT_TOKEN);
  });
}

test("en Sổ Tâm page keeps Personal Vault", async ({ page }) => {
  await page.goto("/en/products/sotam/");
  expect(await page.locator("main").innerText()).toContain("Personal Vault");
});

test("negative proof: the guard fails when the English token is restored", async ({
  page,
}) => {
  // The en page is the control: it legitimately contains "Vault", so the
  // same assertion used for vi/zh/zh-hant must reject it.
  await page.goto("/en/products/sotam/");
  const text = await page.locator("main").innerText();
  expect(text).toMatch(VAULT_TOKEN);
  expect(() => expect(text).not.toMatch(VAULT_TOKEN)).toThrow();
  // And a localized page with the old wording re-injected is rejected.
  const regressed = "Viết nhật ký trong Personal Vault riêng tư";
  expect(() => expect(regressed).not.toMatch(VAULT_TOKEN)).toThrow();
});
