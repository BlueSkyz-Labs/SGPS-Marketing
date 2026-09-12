import { expect, test } from "@playwright/test";

test.describe("executive-to-evidence reading depth", () => {
  test("executive summary stays visible while evidence is disclosed", async ({
    page,
  }) => {
    await page.goto("/en/security/");
    const details = page
      .locator(
        '[data-integrity-lens][data-surface="security"] [data-evidence-details]',
      )
      .first();
    const executive = details.locator(".evidence-details__summary");
    await expect(executive).toBeVisible();
    const toggle = details.locator("details > summary");
    await expect(toggle).toBeVisible();
    const evidenceLink = details.locator(".evidence-details__list a").first();
    await expect(evidenceLink).toBeHidden();
    await toggle.click();
    await expect(evidenceLink).toBeVisible();
  });

  test("trust ledger rows expose evidence through the same control", async ({
    page,
  }) => {
    await page.goto("/en/");
    const ledger = page.locator("[data-trust-ledger]");
    await expect(ledger).toBeVisible();
    const firstRow = ledger.locator("[data-trust-surface]").first();
    await expect(firstRow.locator(".evidence-details__summary")).toBeVisible();
    await firstRow.getByText("See the evidence").click();
    await expect(
      firstRow.locator(".evidence-details__list a").first(),
    ).toBeVisible();
  });

  test("print output keeps the evidence readable (chromium)", async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "print reveal verified on chromium");
    await page.goto("/en/security/");
    await page.emulateMedia({ media: "print" });
    const evidenceLink = page
      .locator(
        '[data-integrity-lens][data-surface="security"] .evidence-details__list a',
      )
      .first();
    await expect(evidenceLink).toBeVisible();
  });

  test("VI evidence depth is localized", async ({ page }) => {
    await page.goto("/vi/privacy/");
    const details = page
      .locator(
        '[data-integrity-lens][data-surface="privacy"] [data-evidence-details]',
      )
      .first();
    await expect(details.getByText("Xem bằng chứng")).toBeVisible();
  });
});

test.describe("evidence depth without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("native details disclose evidence statically", async ({ page }) => {
    await page.goto("/en/security/");
    const details = page
      .locator('[data-integrity-lens][data-surface="security"] details')
      .first();
    await expect(details).toBeVisible();
    await details.locator("summary").click();
    await expect(
      details.locator(".evidence-details__list a").first(),
    ).toBeVisible();
  });
});
