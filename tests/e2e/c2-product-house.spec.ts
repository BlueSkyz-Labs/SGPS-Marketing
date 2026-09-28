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

  test("fixture EN does not repeat the flagship in the continuation grid", async ({
    page,
  }) => {
    await page.goto(`${origin}/product-acts/`);
    const cards = page.locator("[data-product-card]");
    await expect(cards).toHaveCount(2);

    const tiers = await cards.evaluateAll((els) =>
      els.map((el) => el.getAttribute("data-product-tier")),
    );
    expect(tiers).toEqual(["featured", "ecosystem"]);
    await expect(
      page.locator("[data-flagship-theatre] h2").first(),
    ).toContainText("Fixture Flagship");
    await expect(cards.filter({ hasText: "Fixture Flagship" })).toHaveCount(0);
    await expect(page.locator("#product-house-title")).toHaveText(
      "The rest of the house, in development",
    );

    const grid = page.locator(".grid.gap-4");
    await expect(grid).toHaveCount(1);
    await expect(grid.locator("[data-product-card]")).toHaveCount(2);
  });

  test("continuation keeps canonical links for the remaining products", async ({
    page,
  }) => {
    await page.goto(`${origin}/product-acts/`);
    const cards = page.locator("[data-product-card]");
    await expect(cards).toHaveCount(2);

    // Every card must carry the continuity link pointing at the canonical
    // localized profile path.
    const links = await cards
      .locator('a[data-product-continuity="card"]')
      .evaluateAll((els) => els.map((el) => el.getAttribute("href")));
    // Fixture records have slugs fixture-flagship, fixture-secondary, fixture-ecosystem.
    const expectedHrefs = [
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
    await expect(primaryActions).toHaveCount(2);
  });

  test("fixture VI does not contain EN-only copy leaks", async ({ page }) => {
    await page.goto(`${origin}/product-acts-vi/`);
    const bodyText = await page.locator("body").textContent();
    // These EN strings must not appear on the VI page.
    expect(bodyText ?? "").not.toContain("View profile");
    expect(bodyText ?? "").not.toContain(
      "The rest of the house, in development",
    );
  });

  test("fixture VI labels are localized (different from EN)", async ({
    page,
  }) => {
    await page.goto(`${origin}/product-acts-vi/`);
    await expect(
      page.getByText("Những sản phẩm khác đang được phát triển"),
    ).toBeVisible();
    await expect(
      page.getByText(
        "Mỗi sản phẩm hiển thị đúng giai đoạn đã ghi nhận — ý tưởng, nguyên mẫu hay phát triển — cùng nền tảng và bước tiếp theo trung thực.",
      ),
    ).toBeVisible();
    await expect(page.getByText("Xem hồ sơ").first()).toBeVisible();
    const status = page.locator("[data-product-status]").first();
    await expect(status).toHaveText("Đang phát triển");
    await expect(status).toHaveAttribute(
      "data-product-status",
      "In development",
    );
  });

  test("fixture ZH status is localized without changing its canonical value", async ({
    page,
  }) => {
    await page.goto(`${origin}/product-acts-zh/`);
    const status = page.locator("[data-product-status]").first();
    await expect(status).toHaveText("开发中");
    await expect(status).toHaveAttribute(
      "data-product-status",
      "In development",
    );
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
    expect(linked).toHaveLength(2);
    for (const href of linked) {
      expect(href).toMatch(/^\/en\/products\/[a-z0-9-]+\/$/);
    }
  });
});
