import { expect, test, type Page } from "@playwright/test";

/**
 * C3-A Task 4 — Scene-Aware Global Header (design S4).
 *
 * The header may adapt contrast and density per authored scene, but navigation
 * labels/order, semantics, focus visibility and action placement stay stable,
 * and reduced motion must not animate it.
 *
 * Scene markers are authored (`data-scene` on the header, set by the page), not
 * inferred from a scroll observer: CSS must be able to preserve the contract.
 */
const SCENES = [
  { scene: "ink", route: "/en/" },
  { scene: "product", route: "/en/products/" },
  { scene: "porcelain", route: "/en/about/" },
] as const;

async function headerContrast(page: Page): Promise<number> {
  return page.evaluate(() => {
    const header = document.querySelector("header");
    if (!header) return 0;
    const parse = (value: string): [number, number, number] | null => {
      const match = value.match(/rgba?\(([^)]+)\)/);
      if (!match) return null;
      const parts = match[1]
        .split(/[,/\s]+/)
        .filter(Boolean)
        .map(Number);
      if (parts.length < 3 || parts.some((n) => Number.isNaN(n))) return null;
      return [parts[0], parts[1], parts[2]];
    };
    const luminance = ([r, g, b]: [number, number, number]): number => {
      const channel = (c: number): number => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
    };
    const background = parse(getComputedStyle(header).backgroundColor);
    const text = header.querySelector("a, button, span, summary");
    const foreground = text ? parse(getComputedStyle(text).color) : null;
    if (!background || !foreground) return 0;
    const [light, dark] = [luminance(background), luminance(foreground)].sort(
      (a, b) => b - a,
    );
    return (light + 0.05) / (dark + 0.05);
  });
}

async function navLabels(page: Page): Promise<string[]> {
  const labels = await page.locator("header nav a").allTextContents();
  return labels.map((label) => label.trim()).filter(Boolean);
}

test.describe("C3-A Scene-Aware Global Header", () => {
  for (const { scene, route } of SCENES) {
    test(`${route} declares the ${scene} scene and keeps readable contrast`, async ({
      page,
    }) => {
      await page.goto(route);
      const header = page.locator("header");
      await expect(header).toBeVisible();
      await expect(header).toHaveAttribute("data-scene", scene);

      const ratio = await headerContrast(page);
      expect(
        ratio,
        `header text/background contrast in the ${scene} scene must reach 4.5:1 (measured ${ratio.toFixed(2)})`,
      ).toBeGreaterThanOrEqual(4.5);
    });
  }

  test("navigation labels and order stay identical across scenes", async ({
    page,
  }) => {
    const baseline = new Map<string, string[]>();
    for (const { scene, route } of SCENES) {
      await page.goto(route);
      baseline.set(scene, await navLabels(page));
    }
    const reference = baseline.get("porcelain") ?? [];
    expect(
      reference.length,
      "the header must expose navigation links",
    ).toBeGreaterThan(0);
    for (const { scene } of SCENES) {
      expect(
        baseline.get(scene),
        `the ${scene} scene must not reorder or rename navigation`,
      ).toEqual(reference);
    }
  });

  test("keyboard focus stays visible in every scene", async ({ page }) => {
    for (const { scene, route } of SCENES) {
      await page.goto(route);
      await page.keyboard.press("Tab");
      const focused = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el) return null;
        const cs = getComputedStyle(el);
        return {
          tag: el.tagName.toLowerCase(),
          outlineStyle: cs.outlineStyle,
          outlineWidth: cs.outlineWidth,
          boxShadow: cs.boxShadow,
        };
      });
      expect(focused, `${scene}: something must receive focus`).not.toBeNull();
      const visible =
        (focused!.outlineStyle !== "none" &&
          Number.parseFloat(focused!.outlineWidth) > 0) ||
        (focused!.boxShadow !== "none" && focused!.boxShadow !== "");
      expect(
        visible,
        `${scene}: the focused control needs a visible indicator (${JSON.stringify(focused)})`,
      ).toBe(true);
    }
  });

  test("the header is reachable and stable at 320 and 390px", async ({
    page,
  }) => {
    for (const width of [390, 320]) {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/en/");
      const header = page.locator("header");
      await expect(header).toBeVisible();
      const box = await header.boundingBox();
      expect(box, `header must render at ${width}px`).not.toBeNull();
      expect(
        Math.round(box!.x + box!.width),
        `header must not overflow at ${width}px`,
      ).toBeLessThanOrEqual(width + 1);
      const reachable = await page.evaluate(() => {
        const candidates = [
          ...document.querySelectorAll("header nav a, header details summary"),
        ];
        return candidates.some((el) => {
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        });
      });
      expect(
        reachable,
        `at ${width}px at least one navigation affordance must be visible (desktop nav or compact disclosure)`,
      ).toBe(true);
    }
  });

  test("reduced motion does not animate the header", async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    const page = await context.newPage();
    await page.goto("/en/");
    const styles = await page.locator("header").evaluate((el) => {
      const cs = getComputedStyle(el);
      return {
        transitionDuration: cs.transitionDuration,
        animationName: cs.animationName,
      };
    });
    const durations = styles.transitionDuration
      .split(",")
      .map((value) => value.trim())
      .map((value) =>
        value.endsWith("ms")
          ? Number.parseFloat(value) / 1000
          : Number.parseFloat(value),
      );
    expect(
      Math.max(...durations),
      `reduced motion must collapse header transitions (got ${styles.transitionDuration})`,
    ).toBeLessThanOrEqual(0.001);
    expect(styles.animationName).toBe("none");
    await context.close();
  });
});
