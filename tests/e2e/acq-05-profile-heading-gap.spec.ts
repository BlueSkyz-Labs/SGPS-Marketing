import { expect, test, type Page } from "@playwright/test";

/**
 * ACQ-05: the "What it does" H2 on a product profile sits 16 px above its
 * tile list, the same gap the showcase H2 keeps above its lead. A scoped
 * `margin: 0` on the list once overrode the `mt-*` utility and left the
 * heading flush against the tiles (0 px).
 */
const LOCALES = ["en", "vi", "zh", "zh-hant"] as const;
const PROFILES = ["sotro", "sotam"] as const;
const WIDTHS = [390, 1440] as const;
export const HEADING_GAP_PX = 16;
export const gapFits = (gap: number) => Math.abs(gap - HEADING_GAP_PX) <= 1;

const jobsGap = (page: Page) =>
  page.evaluate(() => {
    const heading = document.querySelector("h2#profile-jobs");
    const list = heading?.nextElementSibling;
    if (!heading || !list?.matches("[data-what-it-does]")) return Number.NaN;
    return (
      list.getBoundingClientRect().top - heading.getBoundingClientRect().bottom
    );
  });

test("negative proof: the gap predicate rejects flush and loose gaps", () => {
  expect(gapFits(0)).toBe(false);
  expect(gapFits(24)).toBe(false);
  expect(gapFits(Number.NaN)).toBe(false);
  expect(gapFits(15)).toBe(true);
  expect(gapFits(17)).toBe(true);
});

test.describe("ACQ-05 profile heading gap", () => {
  for (const width of WIDTHS) {
    for (const lang of LOCALES) {
      for (const slug of PROFILES) {
        test(`${lang} ${slug} at ${width}px keeps a 16px H2 gap`, async ({
          page,
        }) => {
          await page.setViewportSize({ width, height: 900 });
          await page.goto(`/${lang}/products/${slug}/`);
          expect(gapFits(await jobsGap(page))).toBe(true);
        });
      }
    }
  }

  test("negative proof: a margin reset on the list is caught in the page", async ({
    page,
  }) => {
    await page.goto("/en/products/sotro/");
    expect(gapFits(await jobsGap(page))).toBe(true);
    // Reintroduce the defect: an unlayered reset that beats the utility.
    await page.addStyleTag({ content: ".profile-does { margin: 0; }" });
    expect(await jobsGap(page)).toBeCloseTo(0, 0);
    expect(gapFits(await jobsGap(page))).toBe(false);
  });

  test("the showcase H2 keeps the same 16px gap (reference)", async ({
    page,
  }) => {
    await page.goto("/en/products/sotro/");
    const gap = await page.evaluate(() => {
      const heading = document.querySelector("h2#profile-showcase");
      const next = heading?.nextElementSibling;
      if (!heading || !next) return Number.NaN;
      return (
        next.getBoundingClientRect().top -
        heading.getBoundingClientRect().bottom
      );
    });
    expect(gapFits(gap)).toBe(true);
  });
});
