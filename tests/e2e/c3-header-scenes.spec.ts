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

/** The site header only: page-level `PageHeader` also renders a <header>. */
const SITE_HEADER = "header[data-scene]";

/**
 * Minimum contrast between the header surface and every element inside it that
 * actually renders text. Sampling a single element would measure the logo link
 * (an image with an inherited colour) instead of the copy a reader must read.
 */
async function headerContrast(page: Page): Promise<number> {
  return page.evaluate((selector) => {
    const header = document.querySelector(selector);
    if (!header) return 0;
    const parse = (
      value: string,
    ): { rgb: [number, number, number]; alpha: number } | null => {
      const match = value.match(/rgba?\(([^)]+)\)/);
      if (!match) return null;
      const parts = match[1]
        .split(/[,/\s]+/)
        .filter(Boolean)
        .map(Number);
      if (parts.length < 3 || parts.slice(0, 3).some((n) => Number.isNaN(n))) {
        return null;
      }
      const alpha = parts.length > 3 && !Number.isNaN(parts[3]) ? parts[3] : 1;
      return { rgb: [parts[0], parts[1], parts[2]], alpha };
    };
    const luminance = ([r, g, b]: [number, number, number]): number => {
      const channel = (c: number): number => {
        const s = c / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
    };
    /** Nearest painted background behind an element (its own, else an ancestor). */
    const effectiveBackground = (
      el: Element,
    ): [number, number, number] | null => {
      let node: Element | null = el;
      while (node) {
        const bg = parse(getComputedStyle(node).backgroundColor);
        if (bg && bg.alpha > 0.5) return bg.rgb;
        node = node.parentElement;
      }
      return null;
    };
    const headerBackground = parse(getComputedStyle(header).backgroundColor);
    if (!headerBackground) return 0;

    const ratios: number[] = [];
    for (const el of [header, ...header.querySelectorAll("*")]) {
      const text = [...el.childNodes]
        .filter((node) => node.nodeType === Node.TEXT_NODE)
        .map((node) => (node.textContent ?? "").trim())
        .join("");
      if (!text) continue;
      const style = getComputedStyle(el);
      if (style.visibility === "hidden" || style.display === "none") continue;
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) continue;
      const foreground = parse(style.color);
      if (!foreground) continue;
      // A control may paint its own surface (the primary action is white on
      // cobalt), so contrast is measured against the surface the text sits on,
      // not against the header shell.
      const behind = effectiveBackground(el) ?? headerBackground.rgb;
      const [light, dark] = [luminance(behind), luminance(foreground.rgb)].sort(
        (a, b) => b - a,
      );
      ratios.push((light + 0.05) / (dark + 0.05));
    }
    return ratios.length ? Math.min(...ratios) : 0;
  }, SITE_HEADER);
}

async function navLabels(page: Page): Promise<string[]> {
  const labels = await page.locator(`${SITE_HEADER} nav a`).allTextContents();
  return labels.map((label) => label.trim()).filter(Boolean);
}

test.describe("C3-A Scene-Aware Global Header", () => {
  for (const { scene, route } of SCENES) {
    test(`${route} declares the ${scene} scene and keeps readable contrast`, async ({
      page,
    }) => {
      await page.goto(route);
      const header = page.locator(SITE_HEADER);
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
      const header = page.locator(SITE_HEADER);
      await expect(header).toBeVisible();
      const box = await header.boundingBox();
      expect(box, `header must render at ${width}px`).not.toBeNull();
      expect(
        Math.round(box!.x + box!.width),
        `header must not overflow at ${width}px`,
      ).toBeLessThanOrEqual(width + 1);
      const reachable = await page.evaluate((selector) => {
        const candidates = [
          ...document.querySelectorAll(
            `${selector} nav a, ${selector} details summary`,
          ),
        ];
        return candidates.some((el) => {
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0;
        });
      }, SITE_HEADER);
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
    const styles = await page.locator(SITE_HEADER).evaluate((el) => {
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
