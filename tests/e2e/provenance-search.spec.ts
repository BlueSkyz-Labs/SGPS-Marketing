import { expect, test } from "@playwright/test";

async function openNavigator(page: import("@playwright/test").Page) {
  await page.keyboard.press("Control+k");
  await expect(page.locator("[data-command-navigator]")).toHaveAttribute(
    "open",
    "",
  );
}

test.describe("deterministic provenance search", () => {
  test("EN: evidence destinations surface with an Evidence type label", async ({
    page,
  }) => {
    await page.goto("/en/");
    await openNavigator(page);
    await page.locator("[data-command-input]").fill("vulnerability");
    const item = page
      .locator(
        '[data-command-item][data-command-kind="evidence"]:not([hidden])',
      )
      .first();
    await expect(item).toBeVisible();
    await expect(item).toContainText("GitHub private vulnerability reporting");
    await expect(item.locator(".command-navigator__kind")).toHaveText(
      "Evidence",
    );
  });

  test("VI: diacritic-insensitive query finds the localized evidence item", async ({
    page,
  }) => {
    await page.goto("/vi/");
    await openNavigator(page);
    await page.locator("[data-command-input]").fill("bao cao lo hong");
    const item = page
      .locator(
        '[data-command-item][data-command-kind="evidence"]:not([hidden])',
      )
      .first();
    await expect(item).toBeVisible();
    await expect(item.locator(".command-navigator__kind")).toHaveText(
      "Bằng chứng",
    );
  });

  test("closing restores focus to the invoking control", async ({ page }) => {
    await page.goto("/en/");
    // Compact viewports keep the trigger inside the closed menu.
    const menuSummary = page.locator("header details summary");
    if (await menuSummary.isVisible()) {
      await menuSummary.click();
    }
    const trigger = page.locator("[data-command-trigger]:visible").first();
    await trigger.click();
    await expect(page.locator("[data-command-navigator]")).toHaveAttribute(
      "open",
      "",
    );
    await page.keyboard.press("Escape");
    await expect(page.locator("[data-command-navigator]")).not.toHaveAttribute(
      "open",
      "",
    );
    if (await trigger.isVisible()) {
      await expect(trigger).toBeFocused();
    } else {
      // Compact viewports close the menu when the dialog opens; focus lands
      // on the visible menu summary instead of a hidden control.
      await expect(page.locator("header details summary")).toBeFocused();
    }
  });

  test("typed queries never enter dispatched event payloads", async ({
    page,
  }) => {
    await page.addInitScript(() => {
      (window as unknown as { __events: unknown[] }).__events = [];
      window.addEventListener("blueskyz:navigator", (event) => {
        (window as unknown as { __events: unknown[] }).__events.push(
          (event as CustomEvent).detail,
        );
      });
    });
    await page.goto("/en/");
    await openNavigator(page);
    await page.locator("[data-command-input]").fill("secretquery123");
    const payloads = await page.evaluate(
      () => (window as unknown as { __events: unknown[] }).__events,
    );
    const serialized = JSON.stringify(payloads);
    expect(serialized).not.toContain("secretquery123");
    expect(serialized).toContain("open");
  });

  test("existing route items keep their kinds (no removal)", async ({
    page,
  }) => {
    await page.goto("/en/");
    await openNavigator(page);
    const kinds = await page
      .locator("[data-command-item]")
      .evaluateAll((els) =>
        els.map((el) => el.getAttribute("data-command-kind")),
      );
    expect(kinds).toContain("route");
    expect(kinds).toContain("evidence");
    // Trust Ledger destinations share hrefs with routes and merge into them
    // by design, so no separate trust kind survives when hrefs collide.
    expect(kinds.length).toBeGreaterThanOrEqual(6);
  });
});

test.describe("provenance search without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("server-rendered evidence items exist; nav links stay usable", async ({
    page,
  }) => {
    await page.goto("/en/");
    await expect(
      page.locator('[data-command-item][data-command-kind="evidence"]'),
    ).toHaveCount(1);
    // Mobile projects hide the desktop nav; the brand lockup is always the
    // visible navigation path without JS.
    await expect(page.locator('header a[href="/en/"]').first()).toBeVisible();
  });
});
