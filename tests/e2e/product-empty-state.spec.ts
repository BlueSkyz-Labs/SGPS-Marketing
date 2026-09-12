import { expect, test } from "@playwright/test";

const FORBIDDEN_PHRASING = [
  /has no products/i,
  /no products/i,
  /không có sản phẩm/i,
  /chưa có sản phẩm/i,
];

test.describe("proof-first product empty state", () => {
  test("EN empty registry explains the proof-backed publication rule", async ({
    page,
  }) => {
    await page.goto("/en/products/");
    await expect(page.locator("[data-proof-first-empty-state]")).toBeVisible();
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "Publication requires proof",
      }),
    ).toBeVisible();
    await expect(page.locator("[data-product-card]")).toHaveCount(0);
    const componentText = await page
      .locator("[data-proof-first-empty-state]")
      .innerText();
    for (const phrase of FORBIDDEN_PHRASING) {
      expect(componentText).not.toMatch(phrase);
    }
    const body = await page.locator("body").innerText();
    expect(body).not.toMatch(/has no products|không có sản phẩm/i);
  });

  test("EN empty state offers locale-correct internal actions", async ({
    page,
  }) => {
    await page.goto("/en/products/");
    const links = page.locator("[data-proof-first-empty-state] a");
    await expect(links).toHaveCount(2);
    await expect(links.first()).toHaveAttribute("href", "/en/about/");
    await expect(links.last()).toHaveAttribute("href", "/en/security/");
  });

  test("VI empty registry mirrors the contract in Vietnamese", async ({
    page,
  }) => {
    await page.goto("/vi/products/");
    await expect(
      page.getByRole("heading", { level: 2, name: "Công bố cần bằng chứng" }),
    ).toBeVisible();
    const links = page.locator("[data-proof-first-empty-state] a");
    await expect(links.first()).toHaveAttribute("href", "/vi/about/");
    await expect(links.last()).toHaveAttribute("href", "/vi/security/");
    const componentText = await page
      .locator("[data-proof-first-empty-state]")
      .innerText();
    for (const phrase of FORBIDDEN_PHRASING) {
      expect(componentText).not.toMatch(phrase);
    }
    const body = await page.locator("body").innerText();
    expect(body).not.toMatch(/has no products|không có sản phẩm/i);
  });

  test("320px keeps the empty state readable", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto("/en/products/");
    await expect(page.locator("[data-proof-first-empty-state]")).toBeVisible();
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  });
});

test.describe("proof-first empty state without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("content and actions render without client scripting", async ({
    page,
  }) => {
    await page.goto("/en/products/");
    await expect(
      page.getByRole("heading", {
        level: 2,
        name: "Publication requires proof",
      }),
    ).toBeVisible();
    await expect(
      page.locator("[data-proof-first-empty-state] a").first(),
    ).toBeVisible();
  });
});
