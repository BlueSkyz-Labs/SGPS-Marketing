import { expect, test } from "@playwright/test";

test.describe("verification deep links", () => {
  test("claim anchor exists on the security surface and lands below the header", async ({
    page,
  }) => {
    await page.goto("/en/security/#claim-security-reporting-is-private");
    const anchor = page.locator("#claim-security-reporting-is-private");
    await expect(anchor).toBeVisible();
    // The anchor is a real entry (not a hidden shim target).
    await expect(anchor).toHaveAttribute("data-integrity-entry");
    const top = await anchor.evaluate(
      (element) => element.getBoundingClientRect().top,
    );
    expect(top).toBeGreaterThanOrEqual(0);
    expect(top).toBeLessThan(140);
  });

  test("evidence anchors deep-link to real evidence steps", async ({
    page,
  }) => {
    await page.goto("/en/security/#claim-security-reporting-is-private");
    const evidence = page.locator("#evidence-ev-security-route");
    await expect(evidence).toBeVisible();
    await expect(evidence).toHaveAttribute("data-trace-step", "evidence");
  });

  test("passport heading exposes the same stable claim anchor", async ({
    page,
  }) => {
    await page.goto("/en/evidence/security-reporting-is-private/");
    const heading = page.locator("#claim-security-reporting-is-private");
    await expect(heading).toBeVisible();
    await expect(heading).toHaveRole("heading");
    // Evidence list items carry their stable ids too.
    await expect(page.locator("#evidence-ev-security-advisory")).toBeVisible();
  });

  test("deep links work with JavaScript disabled", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/en/security/#claim-security-reporting-is-private");
    await expect(
      page.locator("#claim-security-reporting-is-private"),
    ).toBeVisible();
    await context.close();
  });

  test("VI deep links preserve locale and evidence context", async ({
    page,
  }) => {
    await page.goto("/vi/security/#claim-security-reporting-is-private");
    const anchor = page.locator("#claim-security-reporting-is-private");
    await expect(anchor).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "vi");
    await expect(page.locator("#evidence-ev-security-route")).toBeVisible();
  });

  test("privacy canvas mirrors the contract", async ({ page }) => {
    await page.goto("/en/privacy/#claim-privacy-no-tracking-on-this-site");
    await expect(
      page.locator("#claim-privacy-no-tracking-on-this-site"),
    ).toBeVisible();
    await expect(page.locator("#evidence-ev-privacy-route")).toBeVisible();
  });

  test("anchor ids are collision-safe and slug-stable", async ({ page }) => {
    await page.goto("/en/security/");
    const ids = await page
      .locator('[id^="claim-"], [id^="evidence-"]')
      .evaluateAll((elements) => elements.map((element) => element.id));
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) {
      expect(id).toMatch(/^(claim|evidence)-[a-z0-9-]+$/);
    }
  });
});
