import { expect, test } from "@playwright/test";

/*
 * C3-E Task 5 (deterministic step): the Product Concierge surface on /verify/.
 *
 * The server-rendered corpus list is the no-JS baseline — every record is an
 * ordinary same-origin link. The tiny client module only filters that list.
 * No model, no network: these tests never exercise a provider.
 */

test.describe("C3-E concierge surface (deterministic)", () => {
  test("the corpus navigation renders as same-origin links on /verify/", async ({
    page,
  }) => {
    await page.goto("/en/verify/");
    const surface = page.locator("[data-concierge]");
    await expect(surface).toBeVisible();

    const items = surface.locator("[data-concierge-item]");
    expect(await items.count()).toBeGreaterThanOrEqual(7);

    const hrefs = await surface
      .locator("a")
      .evaluateAll((links) =>
        links.map((link) => link.getAttribute("href") ?? ""),
      );
    expect(hrefs.length).toBeGreaterThanOrEqual(7);
    for (const href of hrefs) {
      expect(href.startsWith("/en/")).toBe(true);
    }
  });

  test("typing filters the list and hides unrelated records", async ({
    page,
  }) => {
    await page.goto("/en/verify/");
    const input = page.locator("[data-concierge-input]");
    await input.fill("security");

    const securityItem = page.locator(
      '[data-concierge-item]:has(a[href="/en/evidence/security-reporting-is-private/"])',
    );
    await expect(securityItem).toBeVisible();

    const sotroItem = page.locator(
      '[data-concierge-item]:has(a[href="/en/products/sotro/"])',
    );
    await expect(sotroItem).toBeHidden();
  });

  test("no match shows the empty state and announces it", async ({ page }) => {
    await page.goto("/en/verify/");
    const input = page.locator("[data-concierge-input]");
    await input.fill("zzzzzz");

    await expect(page.locator("[data-concierge-empty]")).toBeVisible();
    await expect(page.locator("[data-concierge-live]")).toHaveText(
      "No results",
    );
  });

  test("clearing the input restores the full baseline list", async ({
    page,
  }) => {
    await page.goto("/en/verify/");
    const input = page.locator("[data-concierge-input]");
    await input.fill("security");
    await input.fill("");
    const items = page.locator("[data-concierge-item]");
    expect(await items.count()).toBeGreaterThanOrEqual(7);
    await expect(page.locator("[data-concierge-empty]")).toBeHidden();
  });

  test("the filter is diacritic-insensitive on the Vietnamese surface", async ({
    page,
  }) => {
    await page.goto("/vi/verify/");
    const surface = page.locator("[data-concierge]");
    await expect(surface).toBeVisible();
    await page.locator("[data-concierge-input]").fill("so tro");
    const sotroItem = page.locator(
      '[data-concierge-item]:has(a[href="/vi/products/sotro/"])',
    );
    await expect(sotroItem).toBeVisible();
  });

  test("keyboard: focusing the input and typing filters without a mouse", async ({
    page,
  }) => {
    await page.goto("/en/verify/");
    await page.locator("[data-concierge-input]").focus();
    await page.keyboard.type("privacy");
    const privacyItem = page.locator(
      '[data-concierge-item]:has(a[href="/en/evidence/privacy-no-tracking-on-this-site/"])',
    );
    await expect(privacyItem).toBeVisible();
  });

  test("no-JS: the full corpus navigation still meets the content contract", async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/en/verify/");
    const items = page.locator("[data-concierge-item]");
    expect(await items.count()).toBeGreaterThanOrEqual(7);
    const visible = await items.evaluateAll(
      (nodes) => nodes.filter((node) => !(node as HTMLElement).hidden).length,
    );
    expect(visible).toBeGreaterThanOrEqual(7);
    await context.close();
  });
});
