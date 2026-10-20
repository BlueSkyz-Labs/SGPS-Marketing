import { expect, test, type Page } from "@playwright/test";

/**
 * TRU-05 (WCAG 1.4.1): on the Edition page the source links carry a
 * non-colour affordance at rest (a visible underline), and the sources heading
 * keeps a defined spacing token (it used the undefined --space-10, which
 * collapsed the gap to 0). Each check has a negative proof that breaks the
 * fixed state in the live page and expects the same check to fail.
 */
const LANGS = ["en", "vi", "zh", "zh-hant"] as const;
const EDITION = "trust-foundations";

/** Source links whose resting underline is missing or invisible. */
const unmarkedSourceLinks = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll<HTMLAnchorElement>("[data-edition-source] a")]
      .filter((a) => {
        const s = getComputedStyle(a);
        const invisible =
          s.textDecorationColor === "transparent" ||
          /rgba\([^)]*,\s*0\)$/.test(s.textDecorationColor);
        return !s.textDecorationLine.includes("underline") || invisible;
      })
      .map((a) => (a.textContent ?? "").trim().slice(0, 40)),
  );

/** Computed margin above the "Sources" heading, in px. */
const sourcesTitleGap = (page: Page) =>
  page
    .locator(".c4-edition__sources-title")
    .evaluate((el) => parseFloat(getComputedStyle(el).marginBlockStart));

for (const lang of LANGS) {
  test(`${lang}: edition source links are underlined at rest`, async ({
    page,
  }) => {
    await page.goto(`/${lang}/editions/${EDITION}/`);
    await expect(page.locator("[data-edition-source] a")).toHaveCount(3);
    expect(await unmarkedSourceLinks(page)).toEqual([]);
    expect(await sourcesTitleGap(page)).toBeGreaterThanOrEqual(32);
  });
}

test.describe("TRU-05 negative proofs", () => {
  test("a hover-only source link is caught", async ({ page }) => {
    await page.goto(`/en/editions/${EDITION}/`);
    await page.addStyleTag({
      content: ".c4-edition__source-link { text-decoration: none; }",
    });
    expect(await unmarkedSourceLinks(page)).toHaveLength(3);
  });

  test("a transparent underline is caught", async ({ page }) => {
    await page.goto(`/en/editions/${EDITION}/`);
    await page.addStyleTag({
      content:
        ".c4-edition__source-link { text-decoration-color: transparent; }",
    });
    expect(await unmarkedSourceLinks(page)).toHaveLength(3);
  });

  test("an undefined spacing token collapses the gap and is caught", async ({
    page,
  }) => {
    await page.goto(`/en/editions/${EDITION}/`);
    await page.addStyleTag({
      content:
        ".c4-edition__sources-title { margin-block-start: var(--space-10); }",
    });
    expect(await sourcesTitleGap(page)).toBeLessThan(32);
  });
});
