import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * Product guide, Apple switcher-guide layout (Owner 2026-10-29).
 * Chapters are derived from consecutive steps by the same role, so the
 * Sổ Trọ record (owner ×3, family ×4, owner ×1) yields three chapters whose
 * lists keep one continuous step numbering.
 */
const LANGS = ["en", "vi", "zh", "zh-hant"] as const;
const PATH = (lang: string) => `/${lang}/products/sotro/guide/`;

for (const lang of LANGS) {
  test(`${lang}: guide has no WCAG A/AA violations`, async ({ page }) => {
    await page.goto(PATH(lang));
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual(
      [],
    );
  });
}

test("chapters follow role runs and keep one step numbering", async ({
  page,
}) => {
  await page.goto(PATH("en"));
  const chapters = page.locator("[data-guide-chapter]");
  await expect(chapters).toHaveCount(3);
  const starts = await page
    .locator("[data-guide-chapter] ol.guide__steps")
    .evaluateAll((lists) =>
      lists.map((l) => [
        (l as HTMLOListElement).start,
        l.querySelectorAll(":scope > li").length,
      ]),
    );
  expect(starts).toEqual([
    [1, 3],
    [4, 4],
    [8, 1],
  ]);
  await expect(page.locator(".guide__step")).toHaveCount(8);
  // The local nav links each chapter by its step range.
  await expect(page.locator("[data-chapter-link]")).toHaveText([
    "Steps 1–3",
    "Steps 4–7",
    "Step 8",
  ]);
});

test("the step switcher centres the chosen card and marks it", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(PATH("en"));
  const chapter = page.locator("#chapter-2");
  const sw = chapter.locator("[data-gallery-switch]");
  await expect(sw).toBeVisible();
  await expect(sw.locator("button")).toHaveCount(4);
  await sw.locator("button").nth(2).click();
  await expect(sw.locator('button[aria-pressed="true"]')).toHaveText("Step 6");
  const offset = await chapter.evaluate((el) => {
    const gallery = el.querySelector<HTMLElement>("[data-gallery]")!;
    const card = el.querySelector<HTMLElement>(".guide__step[data-active]")!;
    const g = gallery.getBoundingClientRect();
    const c = card.getBoundingClientRect();
    return Math.abs(c.left + c.width / 2 - (g.left + g.width / 2));
  });
  expect(offset).toBeLessThan(4);
  // A single-step chapter has no switcher.
  await expect(page.locator("#chapter-3 [data-gallery-switch]")).toHaveCount(0);
});

test("the local nav docks under the sticky site header", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(PATH("en"));
  await page.evaluate(() => window.scrollTo(0, 1800));
  await page.waitForTimeout(200);
  const [header, nav] = await Promise.all([
    page.locator(".header-glass").boundingBox(),
    page.locator(".guide__localnav").boundingBox(),
  ]);
  expect(Math.abs(nav!.y - (header!.y + header!.height))).toBeLessThan(2);
});

test("phone width: no horizontal page scroll", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 780 });
  await page.goto(PATH("vi"));
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });
  test("every step is readable and no switcher is shown", async ({ page }) => {
    await page.goto(PATH("vi"));
    await expect(page.locator("[data-gallery-switch]:visible")).toHaveCount(0);
    const dimmed = await page
      .locator(".guide__step, .guide__shot")
      .evaluateAll(
        (cards) =>
          cards.filter((c) => getComputedStyle(c).opacity !== "1").length,
      );
    expect(dimmed).toBe(0);
    await expect(page.locator(".guide__step h3")).toHaveCount(8);
  });
});
