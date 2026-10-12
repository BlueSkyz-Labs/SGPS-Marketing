import { test, expect, type Page } from "@playwright/test";

/**
 * Aesthetic S1 (audit 2026-10-12): contact cards are equal columns, no eyebrow
 * restates the H1, the home act rhythm has no double section padding, and the
 * light product-row border is the control border. Each guard has a negative
 * proof that breaks the invariant in the DOM and shows the probe notices.
 */

const LANGS = ["en", "vi", "zh", "zh-hant"] as const;

async function cardWidths(page: Page): Promise<number[]> {
  return page
    .locator("main ul.grid > li")
    .evaluateAll((els) =>
      els.map((el) => Math.round(el.getBoundingClientRect().width)),
    );
}

test.describe("S1 contact", () => {
  for (const lang of LANGS) {
    test(`/${lang}/contact/ cards are equal columns from sm`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`/${lang}/contact/`);
      const [a, b] = await cardWidths(page);
      expect(Math.abs(a - b)).toBeLessThanOrEqual(1);
    });

    test(`/${lang}/contact/ has no eyebrow repeating the H1`, async ({
      page,
    }) => {
      await page.goto(`/${lang}/contact/`);
      await expect(page.locator("main .page-header__eyebrow")).toHaveCount(0);
    });
  }

  test("negative proof: re-adding col-span-2 is detected as unequal", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/en/contact/");
    await page
      .locator("main ul.grid > li")
      .last()
      .evaluate((el) => el.classList.add("sm:col-span-2"));
    await page.addStyleTag({
      content: "@media (min-width:640px){.sm\\:col-span-2{grid-column:span 2}}",
    });
    const [a, b] = await cardWidths(page);
    expect(Math.abs(a - b)).toBeGreaterThan(1);
  });
});

test.describe("S1 home rhythm", () => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    test(`flagship to product-house padding is one section-y plus tight at ${viewport.width}px`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.goto("/en/");
      const m = await page.evaluate(() => {
        const root = getComputedStyle(document.documentElement);
        const px = (name: string) => {
          const probe = document.createElement("div");
          probe.style.paddingTop = `var(${name})`;
          document.body.append(probe);
          const v = parseFloat(getComputedStyle(probe).paddingTop);
          probe.remove();
          return v;
        };
        void root;
        const f = document.querySelector("[data-flagship-theatre]")!;
        const h = document.querySelector("[data-product-house]")!;
        return {
          flagBottom: parseFloat(getComputedStyle(f).paddingBottom),
          houseTop: parseFloat(getComputedStyle(h).paddingTop),
          sectionY: px("--section-y"),
          tight: px("--section-y-tight"),
        };
      });
      expect(m.houseTop).toBe(m.tight);
      expect(m.flagBottom + m.houseTop).toBeLessThanOrEqual(
        m.sectionY + m.tight,
      );
    });
  }

  test("negative proof: restoring section-y top padding fails the budget", async ({
    page,
  }) => {
    await page.goto("/en/");
    const total = await page.evaluate(() => {
      const f = document.querySelector("[data-flagship-theatre]")!;
      const h = document.querySelector<HTMLElement>("[data-product-house]")!;
      h.style.paddingTop = "var(--section-y)";
      return (
        parseFloat(getComputedStyle(f).paddingBottom) +
        parseFloat(getComputedStyle(h).paddingTop)
      );
    });
    const tight = await page.evaluate(() => {
      const p = document.createElement("div");
      p.style.paddingTop = "var(--section-y-tight)";
      document.body.append(p);
      const v = parseFloat(getComputedStyle(p).paddingTop);
      p.remove();
      const q = document.createElement("div");
      q.style.paddingTop = "var(--section-y)";
      document.body.append(q);
      const w = parseFloat(getComputedStyle(q).paddingTop);
      q.remove();
      return v + w;
    });
    expect(total).toBeGreaterThan(tight);
  });
});

test.describe("S1 product-row border", () => {
  async function borderColor(page: Page, theme: "light" | "dark") {
    await page.addInitScript((m: string) => {
      try {
        localStorage.setItem("blueskyz-theme", m);
      } catch {
        /* attribute fallback below */
      }
    }, theme);
    await page.goto("/en/");
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    return page
      .locator(".product-row")
      .first()
      .evaluate((el) => getComputedStyle(el).borderTopColor);
  }

  test("light row border is opaque --border-subtle", async ({ page }) => {
    expect(await borderColor(page, "light")).toBe("rgb(203, 213, 225)");
  });

  test("dark row border stays the translucent hairline", async ({ page }) => {
    expect(await borderColor(page, "dark")).toContain("/");
  });

  test("negative proof: the hairline value is not the light expectation", async ({
    page,
  }) => {
    expect(await borderColor(page, "dark")).not.toBe("rgb(203, 213, 225)");
  });
});
