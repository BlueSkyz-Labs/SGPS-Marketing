import { test, expect } from "@playwright/test";

test("theme storage is opt-in and the chosen mode survives navigation", async ({
  page,
}) => {
  await page.goto("/en/");
  const theme = page.getByRole("group", { name: "Theme" });
  const system = theme.getByRole("button", { name: "System" });
  await expect(system).toHaveAttribute("aria-pressed", "true");
  expect(
    await page.evaluate(() => localStorage.getItem("blueskyz-theme")),
  ).toBeNull();

  await theme.getByRole("button", { name: "Dark" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(
    await page.evaluate(() => localStorage.getItem("blueskyz-theme")),
  ).toBe("dark");

  await page.goto("/vi/");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await expect(
    page.getByRole("group", { name: "Giao diện" }).getByRole("button", {
      name: "Tối",
    }),
  ).toHaveAttribute("aria-pressed", "true");
});

test("mobile theme controls meet the 44px touch floor", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/vi/");
  await page.locator("header details > summary").click();
  const theme = page.getByRole("group", { name: "Giao diện" });
  const buttons = theme.getByRole("button");
  await expect(buttons).toHaveCount(3);
  for (let index = 0; index < 3; index++) {
    const rect = await buttons.nth(index).boundingBox();
    expect(rect).not.toBeNull();
    expect(rect!.height).toBeGreaterThanOrEqual(44);
    expect(rect!.width).toBeGreaterThanOrEqual(44);
  }
  await theme.getByRole("button", { name: "Tối" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});
