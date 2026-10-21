import { expect, test, type Page } from "@playwright/test";

/**
 * H1 hierarchy guard (Owner item P2-6): the home H1 is the largest heading on
 * the site, so no inner-page H1 (page header or product profile) may compute
 * larger than it at the same width. The inner sizes are pinned per width so a
 * later raise cannot slip past the hierarchy rule unnoticed.
 */
const settle = (page: Page) =>
  page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise((r) =>
      requestAnimationFrame(() => requestAnimationFrame(r)),
    );
  });

const h1Px = (page: Page) =>
  page.evaluate(() =>
    parseFloat(getComputedStyle(document.querySelector("h1")!).fontSize),
  );

/** Returns one message per inner H1 that outranks the home H1. */
export function hierarchyViolations(
  home: number,
  inner: Record<string, number>,
): string[] {
  return Object.entries(inner)
    .filter(([, px]) => px > home)
    .map(([path, px]) => `${path} H1 ${px}px > home H1 ${home}px`);
}

const INNER = [
  "/en/about/",
  "/vi/about/",
  "/zh/about/",
  "/en/products/sotro/",
  "/vi/products/sotro/",
] as const;

const WIDTHS = [
  { width: 390, inner: 32 },
  { width: 1440, inner: 44 },
] as const;

for (const { width, inner } of WIDTHS) {
  test.describe(`h1 hierarchy at ${width}px`, () => {
    test.use({ viewport: { width, height: 900 } });

    test(`inner H1 is ${inner}px and never above the home H1`, async ({
      page,
    }) => {
      const sizes: Record<string, number> = {};
      for (const path of INNER) {
        await page.goto(path);
        await settle(page);
        sizes[path] = await h1Px(page);
        expect(sizes[path], `${path} inner H1 size`).toBe(inner);
      }
      for (const lang of ["en", "vi"] as const) {
        await page.goto(`/${lang}/`);
        await settle(page);
        const home = await h1Px(page);
        expect(hierarchyViolations(home, sizes), `/${lang}/ home H1`).toEqual(
          [],
        );
      }
    });

    test("no horizontal overflow on inner pages", async ({ page }) => {
      for (const path of INNER) {
        await page.goto(path);
        await settle(page);
        const over = await page.evaluate(
          () => document.documentElement.scrollWidth > window.innerWidth,
        );
        expect(over, `${path} overflows at ${width}px`).toBe(false);
      }
    });
  });
}

test.describe("negative proof", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("an inner H1 larger than the home H1 is reported", async ({ page }) => {
    await page.goto("/en/");
    await settle(page);
    const home = await h1Px(page);
    await page.goto("/en/about/");
    await page.addStyleTag({
      content: "h1.page-header__title { font-size: 3rem !important; }",
    });
    await settle(page);
    const inner = await h1Px(page);
    expect(inner).toBe(48);
    expect(hierarchyViolations(home, { "/en/about/": inner })).toEqual([
      `/en/about/ H1 48px > home H1 ${home}px`,
    ]);
  });
});
