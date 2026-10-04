import { expect, test, type Page } from "@playwright/test";

/**
 * WP-C product surfaces (UI upgrade 2026-10-04), measured in the rendered
 * pages. The pure predicates are proven to fail on a broken input first.
 *
 * - F6: card actions share one baseline in a row of cards.
 * - F3: the profile H1 outranks the section H2 from 768 px.
 * - CLS: the showcase's `contain-intrinsic-size` placeholder stays within
 *   CLS_TOLERANCE of the section's real (gallery collapsed) height, so the
 *   page does not jump when the section renders.
 */
const CLS_TOLERANCE = 0.06;
export const placeholderFits = (placeholder: number, real: number) =>
  Math.abs(placeholder - real) / real <= CLS_TOLERANCE;
export const sameBaseline = (bottoms: number[]) =>
  bottoms.length > 1 && Math.max(...bottoms) - Math.min(...bottoms) <= 1;

test("negative proof: the placeholder and baseline predicates can fail", () => {
  // The pre-WP-C desktop pin (2780 px) against the re-measured 2437 px.
  expect(placeholderFits(2780, 2437)).toBe(false);
  expect(placeholderFits(2440, 2437)).toBe(true);
  // The audited misalignment (y 803 vs y 781).
  expect(sameBaseline([803, 781])).toBe(false);
  expect(sameBaseline([803])).toBe(false);
});

test("product card actions share one baseline at 1440", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/en/products/");
  const bottoms = await page
    .locator("[data-product-card] [data-product-cta]")
    .evaluateAll((els) =>
      els.map((el) => Math.round(el.getBoundingClientRect().bottom)),
    );
  expect(sameBaseline(bottoms), JSON.stringify(bottoms)).toBe(true);
});

test("the profile H1 outranks the showcase H2 at 1440", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/en/products/sotro/");
  const size = (selector: string) =>
    page
      .locator(selector)
      .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
  expect(await size("h1[data-product-profile-title]")).toBeGreaterThan(
    await size("#profile-showcase"),
  );
});

async function showcaseHeights(page: Page) {
  return page.evaluate(async () => {
    const section = document.querySelector<HTMLElement>(".showcase")!;
    const declared = getComputedStyle(section).containIntrinsicHeight;
    const placeholder = parseFloat(declared.replace(/^auto\s+/, ""));
    section.scrollIntoView();
    for (let y = 0; y < section.offsetHeight + innerHeight; y += 300) {
      window.scrollBy(0, 300);
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { placeholder, real: section.getBoundingClientRect().height };
  });
}

for (const width of [390, 1440]) {
  for (const lang of ["vi", "en"]) {
    test(`${lang} ${width}: showcase placeholder matches its real height`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/${lang}/products/sotro/`);
      const { placeholder, real } = await showcaseHeights(page);
      expect(
        placeholderFits(placeholder, real),
        `placeholder ${placeholder} vs real ${real}`,
      ).toBe(true);
    });
  }
}
