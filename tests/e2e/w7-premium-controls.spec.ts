import { expect, test } from "@playwright/test";

test("the primary actions stay text-named pills with a decorative registry icon", async ({
  page,
}) => {
  await page.goto("/en/");

  // Experience v6 S1: the hero primary is the lifecycle-mapped action and is a
  // pill at every viewport; the header CTA pill is checked where it is shown.
  const actions = [
    page.locator("[data-hero-primary]"),
    page.locator("header a", { hasText: "Explore products" }).first(),
  ];
  for (const action of actions) {
    if (!(await action.isVisible())) continue;
    await expect(action.locator(".btn__icon[aria-hidden='true']")).toHaveCount(
      1,
    );
    const name = (await action.innerText()).trim();
    expect(name.length).toBeGreaterThan(0);

    const geometry = await action.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        radius: Number.parseFloat(style.borderTopLeftRadius),
        height: element.getBoundingClientRect().height,
      };
    });
    expect(geometry.radius).toBeGreaterThanOrEqual(geometry.height / 2);
  }
  await expect(actions[0]).toBeVisible();
  await expect(actions[0]).toHaveText("View development status");
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
