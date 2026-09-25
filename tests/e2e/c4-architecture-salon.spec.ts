import { expect, test } from "@playwright/test";

const LANGS = ["en", "vi", "zh"] as const;
const LENSES = ["system", "data", "trust", "recovery", "evidence"];

test.describe("C4-D architecture salon", () => {
  test("all five lenses are semantic sections reached by ordinary links", async ({
    page,
  }) => {
    await page.goto("/en/architecture/");
    const salon = page.locator("[data-architecture-salon]");
    await expect(salon).toBeVisible();

    for (const lens of LENSES) {
      const section = salon.locator(`[data-architecture-lens="${lens}"]`);
      await expect(section).toHaveCount(1);
      await expect(section.locator("h2")).toHaveCount(1);
      await expect(
        section.locator("[data-architecture-node]").first(),
      ).toBeVisible();
    }

    // ordinary in-page links, one per lens, and they actually navigate
    const navLinks = salon.locator(".c4-salon__nav-link");
    await expect(navLinks).toHaveCount(LENSES.length);
    await navLinks.nth(1).click();
    await expect(page).toHaveURL(/#lens-data$/);
    await expect(
      salon.locator('[data-architecture-lens="data"]'),
    ).toBeInViewport();
  });

  test("a validated lens parameter focuses that lens and an unknown one changes nothing", async ({
    page,
  }) => {
    await page.goto("/en/architecture/?lens=recovery");
    await expect(
      page.locator('[data-architecture-lens="recovery"]'),
    ).toBeFocused();

    await page.goto("/en/architecture/?lens=not-a-lens");
    // safe default: the whole page is still there, nothing is hidden or broken
    for (const lens of LENSES) {
      await expect(
        page.locator(`[data-architecture-lens="${lens}"]`),
      ).toBeAttached();
    }
    await expect(page.locator("body")).not.toHaveAttribute(
      "data-architecture-lens",
      /.*/,
    );
  });

  test("no information is diagram-only and no canvas or WebGL is used", async ({
    page,
  }) => {
    await page.goto("/en/architecture/");
    // every published node and edge is readable as text
    const textNodes = await page.locator("[data-architecture-node]").count();
    const textEdges = await page.locator("[data-architecture-edge]").count();
    expect(textNodes).toBeGreaterThan(0);
    expect(textEdges).toBeGreaterThan(0);
    // the connector diagram is decorative only
    const diagram = page.locator(".c4-salon__diagram");
    if ((await diagram.count()) > 0) {
      await expect(diagram.first()).toHaveAttribute("aria-hidden", "true");
    }
    expect(await page.locator("canvas").count()).toBe(0);
    const html = await page.content();
    expect(html.toLowerCase()).not.toContain("webgl");
  });

  test("reading order stays meaningful and keyboard reaches every lens link", async ({
    page,
  }) => {
    await page.goto("/en/architecture/");
    const order = await page
      .locator("[data-architecture-lens]")
      .evaluateAll((nodes) =>
        nodes.map((node) => node.getAttribute("data-architecture-lens")),
      );
    expect(order).toEqual(LENSES);

    await page.keyboard.press("Tab");
    const reachable = await page.evaluate(() =>
      [...document.querySelectorAll(".c4-salon__nav-link")].every(
        (link) => (link as HTMLElement).tabIndex >= 0,
      ),
    );
    expect(reachable).toBe(true);
  });

  for (const lang of LANGS) {
    test(`/${lang}/architecture/ is complete without JavaScript`, async ({
      request,
    }) => {
      const html = await (await request.get(`/${lang}/architecture/`)).text();
      expect(html).toContain("data-architecture-salon");
      for (const lens of LENSES) {
        expect(html).toContain(`data-architecture-lens="${lens}"`);
      }
      expect(html).toContain("data-architecture-node=");
      expect(html).toContain(`#lens-${LENSES[0]}`);
    });
  }

  test("no lens leaks internal topology", async ({ page }) => {
    await page.goto("/en/architecture/");
    // scope to the salon: the site shell legitimately links its own public repo
    const html = await page.locator("[data-architecture-salon]").innerHTML();
    for (const leak of [
      "BlueSkyz-Labs/SGPS-Marketing",
      "sourceEvidence",
      "Quality Gates",
      "revision",
    ]) {
      expect(html, `must not leak ${leak}`).not.toContain(leak);
    }
    expect(html).not.toMatch(/\b[0-9a-f]{40}\b/);
    expect(html).not.toMatch(/\bsrc\//);
  });

  test("the salon stays inside 320px, 390px and 1440px", async ({ page }) => {
    for (const width of [320, 390, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/en/architecture/");
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(overflow, `no sideways scroll at ${width}`).toBeLessThanOrEqual(1);
    }
  });
});
