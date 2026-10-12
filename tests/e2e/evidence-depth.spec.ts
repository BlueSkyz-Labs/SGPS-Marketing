import { expect, test } from "@playwright/test";

test.describe("executive-to-evidence reading depth", () => {
  test("executive summary stays visible while evidence is disclosed", async ({
    page,
  }) => {
    await page.goto("/en/verify/");
    const details = page
      .locator(
        '[data-trust-ledger] [data-trust-surface="security"] [data-evidence-details]',
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

  test("the home carries no ledger rows; /verify stays one footer link away", async ({
    page,
  }) => {
    // Experience v6 S1 moved the ledger rows to /verify (S3); Owner 2026-10-12
    // also removed the home proof band, leaving the footer Verify link.
    // Evidence disclosure stays covered on /security/ and /privacy/ above/below.
    await page.goto("/en/");
    await expect(page.locator("[data-trust-ledger]")).toHaveCount(0);
    await expect(page.locator("[data-trust-band]")).toHaveCount(0);
    await expect(page.locator('footer a[href="/en/verify/"]')).toHaveCount(1);
  });

  test("print output keeps the evidence readable (chromium)", async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "print reveal verified on chromium");
    await page.goto("/en/verify/");
    await page.emulateMedia({ media: "print" });
    const evidenceLink = page
      .locator(
        '[data-trust-ledger] [data-trust-surface="security"] .evidence-details__list a',
      )
      .first();
    await expect(evidenceLink).toBeVisible();
  });

  test("VI evidence depth is localized", async ({ page }) => {
    await page.goto("/vi/verify/");
    const details = page
      .locator(
        '[data-trust-ledger] [data-trust-surface="privacy"] [data-evidence-details]',
      )
      .first();
    await expect(details.locator("summary")).toBeVisible();
  });
});

test.describe("evidence depth without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("native details disclose evidence statically", async ({ page }) => {
    await page.goto("/en/verify/");
    const details = page
      .locator('[data-trust-ledger] [data-trust-surface="security"] details')
      .first();
    await expect(details).toBeVisible();
    await details.locator("summary").click();
    await expect(
      details.locator(".evidence-details__list a").first(),
    ).toBeVisible();
  });
});
