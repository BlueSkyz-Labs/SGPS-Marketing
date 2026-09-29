import { expect, test } from "@playwright/test";

test("the primary action stays a text-named pill with a decorative registry icon", async ({
  page,
}) => {
  await page.goto("/en/");

  const action = page
    .getByRole("link", {
      name: "Explore products",
      exact: true,
    })
    .first();
  await expect(action).toBeVisible();
  await expect(action).toHaveText("Explore products");
  await expect(action.locator(".btn__icon[aria-hidden='true']")).toHaveCount(1);

  const geometry = await action.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      radius: Number.parseFloat(style.borderTopLeftRadius),
      height: element.getBoundingClientRect().height,
    };
  });
  expect(geometry.radius).toBeGreaterThanOrEqual(geometry.height / 2);
});

test("the search trigger adds a decorative icon without replacing its label", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/en/");

  const search = page.locator("[data-command-trigger]:visible").first();
  await expect(search).toHaveAccessibleName(/Search/);
  await expect(search.locator("svg[aria-hidden='true']")).toHaveCount(1);
});

test("the compact-menu search trigger keeps its localized text beside the icon", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en/");
  await page.locator("header details > summary").click();

  const search = page.locator("[data-command-trigger]:visible").first();
  await expect(search).toHaveAccessibleName(/Search pages/);
  await expect(search.locator("svg[aria-hidden='true']")).toHaveCount(1);
});
