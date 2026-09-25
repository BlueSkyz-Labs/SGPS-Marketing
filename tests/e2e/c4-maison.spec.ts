import { expect, test } from "@playwright/test";

const LANGS = ["en", "vi"] as const;
const ORDINALS = ["01", "02", "03", "04"] as const;

test.describe("C4-B maison orientation surface", () => {
  for (const lang of LANGS) {
    test(`/${lang}/ orients with the live house sections in order`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      await page.goto(`/${lang}/`);

      const index = page.locator("[data-maison-index]");
      await expect(index).toBeVisible();

      const items = index.locator("[data-maison-section]");
      await expect(items).toHaveCount(ORDINALS.length);
      await expect(items.nth(0)).toHaveAttribute(
        "data-maison-section",
        "products",
      );
      await expect(items.nth(1)).toHaveAttribute(
        "data-maison-section",
        "proof",
      );
      await expect(items.nth(2)).toHaveAttribute(
        "data-maison-section",
        "architecture",
      );
      await expect(items.nth(3)).toHaveAttribute(
        "data-maison-section",
        "studio",
      );

      const ordinals = await index
        .locator(".c4-maison__ordinal")
        .allInnerTexts();
      expect(ordinals.map((value) => value.trim())).toEqual(ORDINALS);
    });

    test(`/${lang}/ maison links are real destinations`, async ({
      page,
      request,
    }) => {
      await page.goto(`/${lang}/`);
      const hrefs = await page
        .locator("[data-maison-index] a")
        .evaluateAll((nodes) =>
          nodes.map((node) => node.getAttribute("href") ?? ""),
        );
      expect(hrefs.length).toBe(4);
      for (const href of hrefs) {
        expect(href.startsWith(`/${lang}/`), `${href} stays in-language`).toBe(
          true,
        );
        const response = await request.get(href);
        expect(response.status(), `${href} resolves`).toBe(200);
      }
    });

    test(`/${lang}/ maison is one named landmark, not a second primary nav`, async ({
      page,
    }) => {
      await page.goto(`/${lang}/`);
      const house = page.getByRole("navigation", {
        name: /House index|Mục lục ngôi nhà/,
      });
      await expect(house).toHaveCount(1);
      // The shell's own nav set is viewport-dependent (mobile hides the primary nav),
      // so assert the property we actually own: this landmark never claims
      // primary-nav semantics.
      const label = (await house.getAttribute("aria-label")) ?? "";
      expect(
        label,
        "house index must not claim primary-nav semantics",
      ).not.toMatch(/^(Primary|Chính|Mobile|Di động)$/);
    });

    test(`/${lang}/ maison stays vertical and inside 390px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`/${lang}/`);
      const index = page.locator("[data-maison-index]");
      const boxes = await index
        .locator("[data-maison-section]")
        .evaluateAll((nodes) =>
          nodes.map((node) => {
            const rect = node.getBoundingClientRect();
            return { top: rect.top, left: rect.left, width: rect.width };
          }),
        );
      for (let i = 1; i < boxes.length; i += 1) {
        expect(boxes[i].top, "sections stack vertically").toBeGreaterThan(
          boxes[i - 1].top,
        );
      }
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(1);
    });

    test(`/${lang}/ maison links survive without JavaScript`, async ({
      page,
    }) => {
      const response = await page.request.get(`/${lang}/`);
      const html = await response.text();
      for (const section of ["products", "security", "about"]) {
        expect(html, `${section} link is server-rendered`).toContain(
          `href="/${lang}/${section}/"`,
        );
      }
      expect(html).toContain("data-maison-index");
    });
  }

  test("maison lane keeps keyboard order equal to DOM order", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/en/");
    const hrefs = await page
      .locator("[data-maison-index] a")
      .evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href")));
    const reached: string[] = [];
    for (let step = 0; step < 400 && reached.length < hrefs.length; step += 1) {
      await page.keyboard.press("Tab");
      const focused = await page.evaluate(() => {
        const active = document.activeElement;
        if (!(active instanceof HTMLAnchorElement)) return null;
        if (!active.closest("[data-maison-index]")) return null;
        return active.getAttribute("href");
      });
      if (focused && !reached.includes(focused)) reached.push(focused);
    }
    expect(reached).toEqual(hrefs);
  });
});
