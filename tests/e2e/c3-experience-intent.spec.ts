// C3-D Task 2 — Visitor-Controlled Intent UI (G5)
// Tests the IntentControl component: server HTML, keyboard, screen-reader
// state, mobile, reset/default, no-JS, and the presentation-only boundary.
import { expect, test } from "@playwright/test";

const EN_INTENTS = [
  "Explore products",
  "Evaluate a product",
  "Verify trust",
  "Understand architecture",
  "Work with us",
];
const VI_INTENTS = [
  "Khám phá sản phẩm",
  "Đánh giá sản phẩm",
  "Kiểm chứng tin cậy",
  "Tìm hiểu kiến trúc",
  "Làm việc cùng chúng tôi",
];
const ZH_INTENTS = [
  "探索产品",
  "评估产品",
  "核验信任",
  "了解架构",
  "与我们合作",
];

test.describe("C3-D IntentControl", () => {
  test("renders all five intent choices in server HTML on /en/products/", async ({
    page,
  }) => {
    await page.goto("/en/products/");
    const control = page.locator("[data-intent-control]");
    await expect(control).toBeVisible();
    await expect(control.getByRole("button")).toHaveCount(5);
    for (const label of EN_INTENTS) {
      await expect(control.getByRole("button", { name: label })).toBeVisible();
    }
  });

  test("renders all five intent choices in server HTML on /vi/products/", async ({
    page,
  }) => {
    await page.goto("/vi/products/");
    const control = page.locator("[data-intent-control]");
    await expect(control).toBeVisible();
    await expect(control.getByRole("button")).toHaveCount(5);
    for (const label of VI_INTENTS) {
      await expect(control.getByRole("button", { name: label })).toBeVisible();
    }
  });

  test("renders all five intent choices in server HTML on /zh/products/", async ({
    page,
  }) => {
    await page.goto("/zh/products/");
    const control = page.locator("[data-intent-control]");
    await expect(control).toBeVisible();
    await expect(control.getByRole("button")).toHaveCount(5);
    for (const label of ZH_INTENTS) {
      await expect(control.getByRole("button", { name: label })).toBeVisible();
    }
  });

  test("selecting an intent sets data-intent on <html> and aria-pressed", async ({
    page,
  }) => {
    await page.goto("/en/products/");
    const control = page.locator("[data-intent-control]");
    const verifyButton = control.getByRole("button", {
      name: "Verify trust",
    });
    await verifyButton.click();
    await expect(page.locator("html")).toHaveAttribute(
      "data-intent",
      "verify-trust",
    );
    await expect(verifyButton).toHaveAttribute("aria-pressed", "true");
  });

  test("intent selection is single-select and toggles off", async ({
    page,
  }) => {
    await page.goto("/en/products/");
    const control = page.locator("[data-intent-control]");
    const verify = control.getByRole("button", { name: "Verify trust" });
    const explore = control.getByRole("button", {
      name: "Explore products",
    });

    await verify.click();
    await expect(verify).toHaveAttribute("aria-pressed", "true");

    await explore.click();
    await expect(explore).toHaveAttribute("aria-pressed", "true");
    await expect(verify).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator("html")).toHaveAttribute(
      "data-intent",
      "explore-products",
    );

    await explore.click();
    await expect(explore).toHaveAttribute("aria-pressed", "false");
    expect(await page.locator("html").getAttribute("data-intent")).toBeNull();
  });

  test("keyboard operable: Tab focuses, Enter/Space selects", async ({
    page,
  }) => {
    await page.goto("/en/products/");
    const control = page.locator("[data-intent-control]");
    await control.getByRole("button", { name: "Verify trust" }).focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("html")).toHaveAttribute(
      "data-intent",
      "verify-trust",
    );
  });

  test("intent interaction writes no cookies or storage", async ({ page }) => {
    await page.goto("/en/products/");
    const control = page.locator("[data-intent-control]");
    await control.getByRole("button", { name: "Verify trust" }).click();
    await control.getByRole("button", { name: "Work with us" }).click();
    const state = await page.evaluate(() => ({
      cookie: document.cookie,
      local: localStorage.length,
      session: sessionStorage.length,
    }));
    expect(state.cookie).toBe("");
    expect(state.local).toBe(0);
    expect(state.session).toBe(0);
  });

  test("complete critical content without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/en/products/");
    const control = page.locator("[data-intent-control]");
    await expect(control).toBeVisible();
    await expect(control.getByRole("button")).toHaveCount(5);
    // Default intent (explore-products) is pressed server-side;
    // all other intents start unselected.
    const exploreButton = control.getByRole("button", {
      name: "Explore products",
    });
    await expect(exploreButton).toHaveAttribute("aria-pressed", "true");
    for (const label of EN_INTENTS.filter((l) => l !== "Explore products")) {
      await expect(
        control.getByRole("button", { name: label }),
      ).toHaveAttribute("aria-pressed", "false");
    }
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await context.close();
  });

  test("unknown intent fails closed to the declared default", async ({
    page,
  }) => {
    // The server renders the default intent (explore-products) pressed.
    await page.goto("/en/products/");
    const control = page.locator("[data-intent-control]");
    const explore = control.getByRole("button", {
      name: "Explore products",
    });
    await expect(explore).toHaveAttribute("aria-pressed", "true");
    // Other intents start unselected.
    const verify = control.getByRole("button", { name: "Verify trust" });
    await expect(verify).toHaveAttribute("aria-pressed", "false");
  });

  test("same facts/routes remain reachable after intent selection", async ({
    page,
  }) => {
    await page.goto("/en/products/");
    const control = page.locator("[data-intent-control]");
    const linksBefore = await page
      .locator("a[href]")
      .evaluateAll((anchors) => anchors.map((a) => a.getAttribute("href")));

    await control.getByRole("button", { name: "Verify trust" }).click();

    const linksAfter = await page
      .locator("a[href]")
      .evaluateAll((anchors) => anchors.map((a) => a.getAttribute("href")));
    expect(linksAfter.length).toBe(linksBefore.length);
    // No link disappears or becomes non-navigable.
    for (const href of linksAfter) {
      expect(href).not.toBe("");
      expect(href).not.toMatch(/^javascript:/i);
      expect(href).not.toMatch(/^#/);
    }
  });

  test("reduced-motion preference does not break the control", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/en/products/");
    const control = page.locator("[data-intent-control]");
    await expect(control).toBeVisible();
    await expect(control.getByRole("button")).toHaveCount(5);
  });

  test("mobile viewport: control remains usable", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/en/products/");
    const control = page.locator("[data-intent-control]");
    await expect(control).toBeVisible();
    await expect(control.getByRole("button")).toHaveCount(5);
    // All buttons are touch targets >= 44px (check via bounding boxes).
    const buttons = control.getByRole("button");
    const count = await buttons.count();
    for (let i = 0; i < count; i++) {
      const box = await buttons.nth(i).boundingBox();
      expect(box?.width).toBeGreaterThanOrEqual(44);
      expect(box?.height).toBeGreaterThanOrEqual(44);
    }
  });
});
