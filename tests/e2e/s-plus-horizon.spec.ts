import { expect, test } from "@playwright/test";

test("horizon signature renders on /en/ without hiding H1 or CTA", async ({
  page,
}) => {
  await page.goto("/en/");
  const horizon = page.locator("[data-horizon]");
  await expect(horizon).toBeAttached();
  await expect(horizon).toHaveAttribute("aria-hidden", "true");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(
    page.getByRole("link", { name: /About BlueSkyz/i }).first(),
  ).toBeVisible();
});

test("horizon signature renders on /vi/ with equivalent composition", async ({
  page,
}) => {
  await page.goto("/vi/");
  const horizon = page.locator("[data-horizon]");
  await expect(horizon).toBeAttached();
  await expect(horizon).toHaveAttribute("aria-hidden", "true");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(
    page.getByRole("link", { name: /Về BlueSkyz|Bảo mật/i }).first(),
  ).toBeVisible();
});

test("320px hero keeps no horizontal overflow with the horizon", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/en/");
  await expect(page.locator("[data-horizon]")).toBeAttached();
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    ),
  ).toBe(false);
});

test("reduced motion keeps horizon and hero content equivalent", async ({
  browser,
}) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/en/");
  await expect(page.locator("[data-horizon]")).toBeAttached();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await context.close();
});
