import { test, expect } from "@playwright/test";
import { startFixtureServer } from "./helpers/parity-fixture";

/**
 * Fixture-backed hierarchy test for C2 P3 — Product House.
 * Renders real ProductHouse / ProductCard components with synthetic
 * fixture records via the throwaway parity fixture app (tests/e2e/fixtures/parity-app).
 * Never asserts media-transition sibling attributes.
 */

test.describe("C2 Product House — fixture-backed hierarchy", () => {
  let origin = "";
  let closeServer: () => Promise<void>;

  test.beforeAll(async () => {
    const server = await startFixtureServer();
    origin = server.origin;
    closeServer = server.close;
  });

  test.afterAll(async () => {
    await closeServer?.();
  });

  test("fixture EN renders the hero tier as a distinct block above the grid", async ({
    page,
  }) => {
    await page.goto(`${origin}/product-acts/`);
    const cards = page.locator("[data-product-card]");
    await expect(cards).toHaveCount(3);

    // The hero leads the act.
    const tiers = await cards.evaluateAll((els) =>
      els.map((el) => el.getAttribute("data-product-tier")),
    );
    expect(tiers[0]).toBe("hero");

    // The hero is NOT a tile inside the secondary grid: it sits outside the
    // grid container, so the tiers cannot read as one equal-weight grid.
    // (The fixture app is unstyled by design — visual hierarchy is a CSS
    // concern asserted on the styled surfaces, not here.)
    const heroInsideGrid = await page
      .locator('[data-product-tier="hero"]')
      .evaluate((el) => el.closest(".grid.gap-4") !== null);
    expect(heroInsideGrid).toBe(false);

    const grid = page.locator(".grid.gap-4");
    await expect(grid).toHaveCount(1);
    const gridTiers = await grid
      .locator("[data-product-card]")
      .evaluateAll((els) =>
        els.map((el) => el.getAttribute("data-product-tier")).sort(),
      );
    expect(gridTiers).toEqual(["ecosystem", "featured"]);
  });

  test("fixture EN shows exactly 3 product cards with correct localized profile links", async ({
    page,
  }) => {
    await page.goto(`${origin}/product-acts/`);
    const cards = page.locator("[data-product-card]");
    await expect(cards).toHaveCount(3);

    // Every card must carry the continuity link pointing at the canonical
    // localized profile path.
    const links = await cards
      .locator('a[data-product-continuity="card"]')
      .evaluateAll((els) => els.map((el) => el.getAttribute("href")));
    // Fixture records have slugs fixture-flagship, fixture-secondary, fixture-ecosystem.
    const expectedHrefs = [
      "/en/products/fixture-flagship/",
      "/en/products/fixture-secondary/",
      "/en/products/fixture-ecosystem/",
    ];
    for (const href of expectedHrefs) {
      expect(links).toContain(href);
    }
  });

  test("fixture EN action labels are literal from fixture records (not cinematic)", async ({
    page,
  }) => {
    await page.goto(`${origin}/product-acts/`);
    // Fixture primary actions have label "Contact" (not invented copy).
    const primaryActions = page
      .locator("[data-product-card] a")
      .filter({ hasText: "Contact" });
    await expect(primaryActions).toHaveCount(3);
  });

  test("fixture VI does not contain EN-only copy leaks", async ({ page }) => {
    await page.goto(`${origin}/product-acts-vi/`);
    const bodyText = await page.locator("body").textContent();
    // These EN strings must not appear on the VI page.
    expect(bodyText ?? "").not.toContain("View profile");
    expect(bodyText ?? "").not.toContain("Explore all products");
  });

  test("fixture VI labels are localized (different from EN)", async ({
    page,
  }) => {
    await page.goto(`${origin}/product-acts-vi/`);
    await expect(page.getByText("Sản phẩm nổi bật")).toBeVisible();
    await expect(page.getByText("Khám phá tất cả sản phẩm")).toBeVisible();
    await expect(page.getByText("Xem hồ sơ").first()).toBeVisible();
  });

  test("fixture EN keeps every tier reachable through ordinary links", async ({
    page,
  }) => {
    await page.goto(`${origin}/product-acts/`);
    // No hidden tier: every product card exposes a usable profile link.
    const linked = await page
      .locator("[data-product-card]")
      .evaluateAll((els) =>
        els.map(
          (el) =>
            el.querySelector('a[href*="/products/"]')?.getAttribute("href") ??
            "",
        ),
      );
    expect(linked).toHaveLength(3);
    for (const href of linked) {
      expect(href).toMatch(/^\/en\/products\/[a-z0-9-]+\/$/);
    }
  });
});
