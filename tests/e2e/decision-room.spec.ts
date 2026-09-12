import { expect, test } from "@playwright/test";

const ROOM = "[data-decision-room]";
const EN = "/en/decision-room/";
const VI = "/vi/decision-room/";

test.describe("decision room", () => {
  test("server-rendered items expose sources and compare buttons", async ({
    page,
  }) => {
    await page.goto(EN);
    const room = page.locator(ROOM);
    await expect(room).toBeVisible();
    const items = room.locator("[data-decision-item]");
    expect(await items.count()).toBeGreaterThanOrEqual(5);
    for (let index = 0; index < (await items.count()); index += 1) {
      await expect(items.nth(index).locator("a").first()).toBeVisible();
      await expect(
        items.nth(index).getByRole("button", { name: "Compare" }),
      ).toBeVisible();
    }
    const text = await room.innerText();
    expect(text).not.toMatch(/score|ranking|recommend/i);
  });

  test("without JavaScript the facts and sources remain usable", async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(EN);
    const room = page.locator(ROOM);
    await expect(room).toBeVisible();
    await expect(room.locator("[data-decision-item] a").first()).toBeVisible();
    await expect(room.locator("[data-decision-add]").first()).toBeHidden();
    await expect(room.locator("[data-decision-board]")).toBeHidden();
    await expect(room.locator("[data-decision-empty-state]")).toBeVisible();
    await context.close();
  });

  test("selection is bounded at four with a polite announcement", async ({
    page,
  }) => {
    await page.goto(EN);
    const room = page.locator(ROOM);
    const adds = room.locator("[data-decision-add]");
    const total = await adds.count();
    for (let index = 0; index < 4; index += 1) {
      await adds.nth(index).click();
    }
    await expect(room.locator("[data-decision-board]")).toBeVisible();
    await expect(
      room.locator("[data-decision-board] [data-decision-row]:not([hidden])"),
    ).toHaveCount(4);
    const live = room.locator("[data-decision-live]");
    await expect(live).toHaveAttribute("aria-live", "polite");
    await expect(live).toHaveText("4/4 compared");
    if (total > 4) {
      await expect(adds.nth(4)).toBeDisabled();
    }
    await expect(adds.nth(0)).toHaveAttribute("aria-pressed", "true");
  });

  test("removing with the keyboard updates the workspace", async ({ page }) => {
    await page.goto(EN);
    const room = page.locator(ROOM);
    await room.locator("[data-decision-add]").nth(0).click();
    await room.locator("[data-decision-add]").nth(1).click();
    await expect(room.locator("[data-decision-row]:not([hidden])")).toHaveCount(
      2,
    );
    const remove = room
      .locator("[data-decision-row]:not([hidden]) [data-decision-remove]")
      .first();
    await remove.focus();
    await page.keyboard.press("Enter");
    await expect(room.locator("[data-decision-row]:not([hidden])")).toHaveCount(
      1,
    );
    await expect(room.locator("[data-decision-live]")).toHaveText(
      "1/4 compared",
    );
  });

  test("reset clears the workspace and state never persists across reloads", async ({
    page,
  }) => {
    await page.goto(EN);
    const room = page.locator(ROOM);
    await room.locator("[data-decision-add]").nth(0).click();
    await page.reload();
    await expect(room.locator("[data-decision-board]")).toBeHidden();
    await expect(room.locator("[data-decision-empty-state]")).toBeVisible();
    await room.locator("[data-decision-add]").nth(0).click();
    await room.locator("[data-decision-reset]").click();
    await expect(room.locator("[data-decision-board]")).toBeHidden();
    await expect(room.locator("[data-decision-add]").nth(0)).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  test("comparison makes no network requests after load", async ({ page }) => {
    await page.goto(EN);
    const requests: string[] = [];
    page.on("request", (request) => {
      requests.push(request.url());
    });
    const room = page.locator(ROOM);
    await room.locator("[data-decision-add]").nth(0).click();
    await room.locator("[data-decision-add]").nth(1).click();
    await room.locator("[data-decision-reset]").click();
    expect(requests).toEqual([]);
  });

  test("trust surfaces deep-link into the room", async ({ page }) => {
    await page.goto("/en/");
    const hook = page.locator("[data-decision-hook]").first();
    await expect(hook).toBeVisible();
    const href = await hook.getAttribute("href");
    expect(href).toMatch(/^\/en\/decision-room\/#room-item-trust-/);
    await hook.click();
    await expect(page).toHaveURL(/\/en\/decision-room\/#room-item-trust-/);
    const target = page.locator(
      "#room-item-trust-privacy, #room-item-trust-security, #room-item-trust-support",
    );
    await expect(target.first()).toBeInViewport();
  });

  test("VI room is localized", async ({ page }) => {
    await page.goto(VI);
    const room = page.locator(ROOM);
    await expect(
      room.getByRole("button", { name: "So sánh" }).first(),
    ).toBeVisible();
    await room.getByRole("button", { name: "So sánh" }).first().click();
    await expect(room.locator("[data-decision-board]")).toBeVisible();
    await expect(room.locator("[data-decision-live]")).toHaveText(
      "Đang so sánh 1/4",
    );
  });

  test("390px keeps the room stacked and scrollable", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(EN);
    const room = page.locator(ROOM);
    await expect(room).toBeVisible();
    await room.locator("[data-decision-add]").nth(0).click();
    await expect(room.locator("[data-decision-board]")).toBeVisible();
    const overflow = await page.evaluate(() => {
      return (
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth
      );
    });
    expect(overflow).toBeLessThanOrEqual(0);
  });
});
