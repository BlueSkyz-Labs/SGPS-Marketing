import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * F9: one arrow system and one focus style for every CTA.
 * - CTA names carry no arrow glyph; the arrow is a decorative SVG icon.
 * - ButtonLink focus is the global `--focus-ring` outline plus a surface halo.
 * - Each CTA state (rest, hover, pressed) passes axe colour contrast in light
 *   and dark.
 */
const ARROW = /[←-⇿⟵-⟿➔➜➡›»]/;

const ABOUT_CTA = {
  en: "See our claims and sources",
  vi: "Xem các tuyên bố và nguồn",
  zh: "查看我们的声明与依据",
  "zh-hant": "查看我們的聲明與依據",
} as const;

for (const [lang, name] of Object.entries(ABOUT_CTA)) {
  test(`/${lang}/about/ verify link has the glyph-free name`, async ({
    page,
  }) => {
    await page.goto(`/${lang}/about/`);
    const link = page.locator(`main a[href="/${lang}/verify/"]`).last();
    await expect(link).toHaveText(name);
    await expect(link).toHaveAccessibleName(name);
  });
}

for (const route of ["/en/", "/vi/security/", "/en/contact/", "/en/404/"]) {
  test(`${route}: every ButtonLink renders its arrow as an aria-hidden icon`, async ({
    page,
  }) => {
    await page.goto(route);
    const buttons = page.locator("a.btn");
    const count = await buttons.count();
    expect(count).toBeGreaterThan(0);
    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const text = (await button.innerText()).trim();
      expect(text, `visible text ${text}`).not.toMatch(ARROW);
      const icons = button.locator("svg.btn__icon");
      if ((await icons.count()) > 0) {
        await expect(icons.first()).toHaveAttribute("aria-hidden", "true");
      }
    }
  });
}

test("SafeAction uses the shared button and an external icon, no text arrow", async ({
  page,
}) => {
  await page.goto("/en/security/");
  const link = page.locator('[data-safe-action="private-reporting"] a');
  await expect(link).toHaveClass(/\bbtn\b/);
  await expect(link.locator("svg.btn__icon--external")).toHaveCount(1);
  await expect(link).toHaveAccessibleName("Report a vulnerability");
});

async function focusStyle(page: Page, selector: string) {
  const link = page.locator(selector).first();
  await link.focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  await expect(link).toBeFocused();
  return link.evaluate((el) => {
    const s = getComputedStyle(el);
    const probe = document.createElement("span");
    probe.style.color = "var(--focus-ring)";
    document.body.append(probe);
    const ring = getComputedStyle(probe).color;
    probe.remove();
    return {
      outlineStyle: s.outlineStyle,
      outlineWidth: s.outlineWidth,
      outlineOffset: s.outlineOffset,
      outlineColor: s.outlineColor,
      boxShadow: s.boxShadow,
      ring,
    };
  });
}

for (const colorScheme of ["light", "dark"] as const) {
  test.describe(`${colorScheme}`, () => {
    test.use({ colorScheme });

    test("ButtonLink focus is the global --focus-ring outline with a halo", async ({
      page,
    }) => {
      await page.goto("/en/404/");
      const s = await focusStyle(page, 'main a.btn[href="/en/products/"]');
      expect(s.outlineStyle).toBe("solid");
      expect(s.outlineWidth).toBe("3px");
      expect(s.outlineOffset).toBe("3px");
      expect(s.outlineColor).toBe(s.ring);
      expect(s.boxShadow).toMatch(/0px 0px 0px 3px/);
    });

    test("the hero CTA on the ink band keeps a visible focus halo", async ({
      page,
    }) => {
      await page.goto("/en/");
      const s = await focusStyle(page, "main a.btn");
      expect(s.outlineColor).toBe(s.ring);
      // Light page: a porcelain halo separates the ring from ink.
      if (colorScheme === "light") {
        expect(s.boxShadow).toContain("rgb(247, 248, 250) 0px 0px 0px 3px");
      }
    });

    for (const state of ["rest", "hover", "pressed"] as const) {
      test(`CTA ${state} state passes axe colour contrast`, async ({
        page,
      }) => {
        await page.goto("/en/404/");
        await page.emulateMedia({ reducedMotion: "reduce" });
        for (const selector of [
          'main a.btn[href="/en/"]',
          'main a.btn[href="/en/products/"]',
        ]) {
          const link = page.locator(selector).first();
          if (state !== "rest") await link.hover();
          if (state === "pressed") await page.mouse.down();
          const results = await new AxeBuilder({ page })
            .include(selector)
            .withRules(["color-contrast"])
            .analyze();
          if (state === "pressed") {
            // Release away from the link so the press never becomes a click.
            await page.mouse.move(0, 0);
            await page.mouse.up();
          }
          expect(results.violations, `${selector} ${state}`).toEqual([]);
          expect(
            results.passes.length + results.incomplete.length,
          ).toBeGreaterThan(0);
        }
      });
    }
  });
}
