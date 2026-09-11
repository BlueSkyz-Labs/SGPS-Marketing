import { expect, test } from "@playwright/test";

test("atlas renders truth-derived nodes with decorative SVG hidden from AT", async ({
  page,
}) => {
  await page.goto("/en/");
  const atlas = page.locator("[data-atlas]");
  await expect(atlas).toBeVisible();

  // Two decorative plates (desktop + mobile); exactly one is visible per
  // viewport and both are hidden from assistive technology.
  const svgs = atlas.locator("svg[aria-hidden='true']");
  await expect(svgs).toHaveCount(2);
  await expect(atlas.locator("svg[aria-hidden='true']:visible")).toHaveCount(1);

  const nodes = atlas.locator("[data-atlas-node]");
  await expect(nodes).toHaveCount(8); // brand + 4 principles + 3 trust

  await expect(
    atlas.locator("[data-atlas-node][data-atlas-kind='brand']"),
  ).toHaveCount(1);
  await expect(
    atlas.locator("[data-atlas-node][data-atlas-kind='principle']"),
  ).toHaveCount(4);
  await expect(
    atlas.locator("[data-atlas-node][data-atlas-kind='trust']"),
  ).toHaveCount(3);
});

test("zero public products means zero product nodes (honest empty state)", async ({
  page,
}) => {
  await page.goto("/en/");
  const atlas = page.locator("[data-atlas]");
  await expect(
    atlas.locator("[data-atlas-node][data-atlas-kind='product']"),
  ).toHaveCount(0);
  await expect(
    atlas.getByText(/No public products are published yet/i),
  ).toBeVisible();
});

test("atlas node links resolve to real destinations", async ({ page }) => {
  await page.goto("/en/");
  const atlas = page.locator("[data-atlas]");
  const links = atlas.locator("[data-atlas-node] a");
  const hrefs = await links.evaluateAll((elements) =>
    elements.map((element) => element.getAttribute("href")),
  );
  expect(hrefs.length).toBeGreaterThanOrEqual(7);
  for (const href of hrefs) {
    expect(href?.startsWith("/en/") || href?.startsWith("#")).toBe(true);
  }
  await expect(
    atlas.locator("[data-atlas-node] a[href='/en/privacy/']"),
  ).toHaveCount(1);
  await expect(
    atlas.locator("[data-atlas-node] a[href='#house-title']").first(),
  ).toHaveCount(1);
});

test("atlas is localized on /vi/", async ({ page }) => {
  await page.goto("/vi/");
  const atlas = page.locator("[data-atlas]");
  await expect(atlas).toBeVisible();
  await expect(
    atlas.locator("[data-atlas-node][data-atlas-kind='trust'] a", {
      hasText: "Quyền riêng tư",
    }),
  ).toHaveCount(1);
});

test("320px homepage keeps no horizontal overflow with atlas", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/en/");
  await expect(page.locator("[data-atlas]")).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    ),
  ).toBe(false);
});

test("atlas renders without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/en/");
  const atlas = page.locator("[data-atlas]");
  await expect(atlas).toBeVisible();
  await expect(atlas.locator("[data-atlas-node]")).toHaveCount(8);
  await context.close();
});
