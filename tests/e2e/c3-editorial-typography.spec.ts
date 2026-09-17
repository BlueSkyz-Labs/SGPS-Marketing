import { expect, test, type Page } from "@playwright/test";

/**
 * C3-A Task 3 — Editorial Typography v2 contract.
 *
 * Extends the Wave H12 (WCAG 1.4.4 Resize text) and Wave H13 (1.4.12 Text
 * spacing) guards to the C3 editorial layer: EN/VI wrapping across the
 * responsive ladder, 200% text zoom, and text-spacing overrides.
 *
 * Measurement discipline: the root font size / override style is applied first,
 * then the assertion waits for `document.fonts.ready` and two animation frames
 * before reading layout. Measuring in the same tick can read a pre-reflow,
 * pre-font-swap layout, reporting an overflow that does not exist once the
 * layout settles — or hiding one that does. The previous revision also injected
 * the text-spacing override before navigation, which the navigation discarded;
 * it now applies after the page has loaded.
 */
const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "mobile", width: 390, height: 844 },
  { name: "small", width: 320, height: 720 },
] as const;

async function settledOverflow(
  page: Page,
): Promise<{ overflow: number; offender: string | null }> {
  return page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve(null))),
    );
    const doc = document.documentElement;
    const overflow = doc.scrollWidth - window.innerWidth;
    let offender: string | null = null;
    if (overflow > 1) {
      // Decorative bleed inside an overflow-hidden ancestor cannot create
      // document scroll; report the widest element that is NOT clipped.
      const isClipped = (el: Element): boolean => {
        let node = el.parentElement;
        while (node && node !== document.documentElement) {
          const cs = getComputedStyle(node);
          if (/(hidden|clip|auto|scroll)/.test(cs.overflowX)) return true;
          node = node.parentElement;
        }
        return false;
      };
      const widest = [...document.querySelectorAll<HTMLElement>("body *")]
        .map((el) => ({ el, right: el.getBoundingClientRect().right }))
        .filter((entry) => entry.right > window.innerWidth + 1)
        .sort((a, b) => b.right - a.right)
        .find((entry) => !isClipped(entry.el));
      if (widest) {
        offender = `${widest.el.tagName.toLowerCase()}.${[
          ...widest.el.classList,
        ]
          .slice(0, 3)
          .join(".")} (right ${Math.round(widest.right)}px)`;
      }
    }
    return { overflow, offender };
  });
}

function describe(
  prefix: string,
  result: { overflow: number; offender: string | null },
) {
  return `${prefix} ${result.overflow}px${result.offender ? ` — widest: ${result.offender}` : ""}`;
}

test.describe("C3-A Editorial Typography — EN/VI wrapping", () => {
  for (const viewport of VIEWPORTS) {
    test(`${viewport.name} (${viewport.width}px): no horizontal overflow`, async ({
      page,
    }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.goto("/en/");
      const result = await settledOverflow(page);
      expect(
        result.overflow,
        describe("wrap overflow", result),
      ).toBeLessThanOrEqual(1);
    });
  }

  test("VI copy wraps within the same ladder", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await page.goto("/vi/");
    const result = await settledOverflow(page);
    expect(
      result.overflow,
      describe("VI wrap overflow", result),
    ).toBeLessThanOrEqual(1);
  });
});

test.describe("C3-A Editorial Typography — 200% text zoom", () => {
  for (const viewport of VIEWPORTS) {
    test(`${viewport.name} (${viewport.width}px): 200% text zoom does not scroll sideways`, async ({
      page,
    }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await page.goto("/en/");
      await page.evaluate(() => {
        document.documentElement.style.fontSize = "200%";
      });
      const result = await settledOverflow(page);
      expect(
        result.overflow,
        describe("200% zoom overflow", result),
      ).toBeLessThanOrEqual(1);
    });
  }

  test("text-spacing override is respected", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/en/");
    await page.addStyleTag({
      content: `
        * {
          letter-spacing: 0.12em !important;
          word-spacing: 0.16em !important;
          line-height: 1.5 !important;
        }
      `,
    });
    const result = await settledOverflow(page);
    expect(
      result.overflow,
      describe("text-spacing overflow", result),
    ).toBeLessThanOrEqual(1);
  });
});

test.describe("C3-A Editorial Typography — display hierarchy", () => {
  test("headings render with display weight and section hierarchy", async ({
    page,
  }) => {
    await page.goto("/en/");
    await expect(page.locator("h1").first()).toBeVisible();

    const h1Styles = await page
      .locator("h1")
      .first()
      .evaluate((el) => {
        const computed = getComputedStyle(el);
        return {
          fontWeight: Number(computed.fontWeight),
          fontSize: Number.parseFloat(computed.fontSize),
        };
      });
    expect(h1Styles.fontWeight).toBeGreaterThanOrEqual(500);
    expect(h1Styles.fontSize).toBeGreaterThanOrEqual(24);
  });
});
