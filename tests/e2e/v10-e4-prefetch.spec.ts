import { expect, test } from "@playwright/test";

/*
 * v10 card E4 (M02): opt-in navigation prefetch.
 *
 * The experiment sanctions prefetch only (never prerender) for a tiny
 * allowlist derived from the shared nav (`getNav`) at moderate eagerness.
 * The Speculation Rules API is Chromium-only; other engines parse and ignore
 * the script, so these assertions run on chromium and the rule set stays
 * inert elsewhere.
 */

const EN_NAV = ["/en/products/", "/en/about/", "/en/contact/"];

test.describe("v10 E4 — navigation prefetch (M02)", () => {
  test.skip(
    ({ browserName }) => browserName !== "chromium",
    "Speculation Rules are Chromium-only",
  );

  test("the rule set is prefetch-only and allowlisted to the shared nav", async ({
    page,
  }) => {
    await page.goto("/en/");
    const count = await page.locator('script[type="speculationrules"]').count();
    test.skip(
      count === 0,
      "rules are emitted on production-origin builds only; this e2e build is non-production",
    );
    const raw = await page
      .locator('script[type="speculationrules"]')
      .textContent();
    expect(
      raw,
      "the speculationrules script must be present on /en/",
    ).toBeTruthy();
    const parsed = JSON.parse(raw as string);
    expect(parsed.prerender, "M02 forbids prerender").toBeUndefined();
    expect(parsed.prefetch).toHaveLength(1);
    expect(parsed.prefetch[0].urls).toEqual(EN_NAV);
    expect(parsed.prefetch[0].eagerness).toBe("moderate");
  });

  test("the allowlisted destination still navigates from the nav link", async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, "the desktop header nav is hidden on mobile viewports");
    await page.goto("/en/");
    const link = page.locator('header a[href="/en/products/"]').first();
    await link.hover();
    await page.waitForTimeout(1000);
    await link.click();
    await expect(page).toHaveURL(/\/en\/products\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
