import { expect, test, type Page } from "@playwright/test";

/**
 * Audit IX-08: on a journal post the title block uses the same measure as the
 * body column, and a Sources link keeps its full URL as text but wraps
 * anywhere in the quiet meta-text size, so it never widens the column.
 */
const POSTS = [
  "/en/journal/thue-cho-thue-tro-2026/",
  "/vi/journal/thue-cho-thue-tro-2026/",
] as const;

const widths = (page: Page) =>
  page.evaluate(() => {
    const width = (selector: string) =>
      Math.round(
        document.querySelector(selector)!.getBoundingClientRect().width,
      );
    return {
      title: width("[data-journal-post] h1"),
      header: width("[data-journal-post] [data-page-header]"),
      body: width("[data-journal-body]"),
    };
  });

export const sameMeasure = (m: {
  title: number;
  header: number;
  body: number;
}) => m.title === m.body && m.header === m.body;

test("negative proof: a capped title block fails the same-measure predicate", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(POSTS[0]);
  expect(sameMeasure(await widths(page))).toBe(true);
  await page.addStyleTag({
    content: "[data-journal-post] h1 { max-width: 20rem !important; }",
  });
  expect(sameMeasure(await widths(page))).toBe(false);
});

for (const path of POSTS) {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 },
  ]) {
    test(`${path} @${viewport.width}: title block and body share one measure`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.goto(path);
      expect(sameMeasure(await widths(page))).toBe(true);
    });

    test(`${path} @${viewport.width}: sources keep the full URL, wrap and stay muted`, async ({
      page,
    }) => {
      await page.setViewportSize(viewport);
      await page.goto(path);
      const links = page.locator("[data-journal-source]");
      expect(await links.count()).toBeGreaterThan(0);
      for (const link of await links.all()) {
        const href = await link.getAttribute("href");
        await expect(link).toHaveText(href!);
      }
      const style = await links.first().evaluate((el) => {
        const body = getComputedStyle(
          document.querySelector("[data-journal-body]")!,
        );
        const own = getComputedStyle(el);
        return {
          wrap: own.overflowWrap,
          smaller: parseFloat(own.fontSize) < parseFloat(body.fontSize),
          overflowX:
            document.documentElement.scrollWidth >
            document.documentElement.clientWidth,
        };
      });
      expect(style.wrap).toBe("anywhere");
      expect(style.smaller).toBe(true);
      expect(style.overflowX).toBe(false);
    });
  }
}
