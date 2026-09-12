import { expect, test } from "@playwright/test";

test.describe("atlas v2 evidence constellation", () => {
  test("EN atlas shows claim and evidence nodes, zero product nodes", async ({
    page,
  }) => {
    await page.goto("/en/");
    const atlas = page.locator("[data-atlas]");
    await expect(atlas).toBeVisible();

    const nodes = atlas.locator("[data-atlas-node]");
    const total = await nodes.count();
    expect(total).toBeGreaterThanOrEqual(6);

    const claims = atlas.locator('[data-atlas-kind="claim"]');
    const evidence = atlas.locator('[data-atlas-kind="evidence"]');
    expect(await claims.count()).toBe(2);
    expect(await evidence.count()).toBeGreaterThanOrEqual(3);

    // Zero public products => zero product nodes, with the honest empty note.
    await expect(atlas.locator('[data-atlas-kind="product"]')).toHaveCount(0);
    await expect(
      atlas.getByText("No public products are published yet."),
    ).toBeVisible();
  });

  test("claim and evidence nodes link only to live public surfaces", async ({
    page,
  }) => {
    await page.goto("/en/");
    const atlas = page.locator("[data-atlas]");
    const claims = atlas.locator('[data-atlas-kind="claim"] a');
    expect(await claims.count()).toBe(2);
    for (const href of await claims.evaluateAll((links) =>
      links.map((link) => link.getAttribute("href") ?? ""),
    )) {
      expect(href).toMatch(/^\/en\/(security|privacy)\/$/);
    }
    const evidenceLinks = atlas.locator('[data-atlas-kind="evidence"] a');
    expect(await evidenceLinks.count()).toBeGreaterThanOrEqual(3);
    for (const href of await evidenceLinks.evaluateAll((links) =>
      links.map((link) => link.getAttribute("href") ?? ""),
    )) {
      expect(href.length).toBeGreaterThan(0);
    }
  });

  test("semantic node list is authoritative and the SVG mirrors it", async ({
    page,
  }) => {
    await page.goto("/en/");
    const atlas = page.locator("[data-atlas]");
    const listCount = await atlas.locator("[data-atlas-node]").count();
    const desktopCircles = await atlas
      .locator("svg")
      .first()
      .locator("circle")
      .count();
    const mobileCircles = await atlas
      .locator("svg")
      .nth(1)
      .locator("circle")
      .count();
    expect(desktopCircles).toBe(listCount);
    expect(mobileCircles).toBe(listCount);
  });

  test("SVG stays decorative and hidden from assistive technology", async ({
    page,
  }) => {
    await page.goto("/en/");
    const svgs = page.locator("[data-atlas] svg");
    expect(await svgs.count()).toBe(2);
    for (const svg of await svgs.all()) {
      await expect(svg).toHaveAttribute("aria-hidden", "true");
      await expect(svg).toHaveAttribute("role", "presentation");
    }
  });

  test("VI atlas localizes the new node kinds", async ({ page }) => {
    await page.goto("/vi/");
    const atlas = page.locator("[data-atlas]");
    await expect(atlas.getByText("Tuyên bố").first()).toBeVisible();
    await expect(atlas.getByText("Bằng chứng").first()).toBeVisible();
    await expect(atlas.locator('[data-atlas-kind="product"]')).toHaveCount(0);
  });

  test("no-JS atlas is complete", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/en/");
    const atlas = page.locator("[data-atlas]");
    await expect(atlas).toBeVisible();
    expect(await atlas.locator("[data-atlas-node]").count()).toBeGreaterThan(5);
    await expect(atlas.locator('[data-atlas-kind="claim"]')).toHaveCount(2);
    await context.close();
  });

  test("no animation on atlas nodes (reduced-motion safe)", async ({
    page,
  }) => {
    await page.goto("/en/");
    const name = await page
      .locator("[data-atlas-node]")
      .first()
      .evaluate((element) => getComputedStyle(element).animationName);
    expect(name).toBe("none");
  });

  for (const width of [320, 390, 1440]) {
    test(`${width}px composition has no horizontal overflow`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/en/");
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
      await expect(page.locator("[data-atlas]").first()).toBeVisible();
    });
  }
});
