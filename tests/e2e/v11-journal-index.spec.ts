import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * v11 J1: the journal index renders in every locale, stays noindex while it
 * has no published post, shows honest empty states, and passes axe.
 */
const LOCALES = [
  { lang: "en", title: "Journal", note: false },
  { lang: "vi", title: "Nhật ký", note: false },
  { lang: "zh", title: "日志", note: true },
  { lang: "zh-hant", title: "日誌", note: true },
] as const;

for (const locale of LOCALES) {
  test(`${locale.lang}: journal index is noindex, empty and accessible`, async ({
    page,
  }) => {
    await page.goto(`/${locale.lang}/journal/`);
    await expect(page.locator("h1")).toHaveText(locale.title);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/,
    );
    await expect(page.locator("[data-journal-branch]")).toHaveCount(2);
    await expect(page.locator("[data-journal-empty]")).toHaveCount(2);
    await expect(page.locator("[data-journal-item]")).toHaveCount(0);
    await expect(page.locator("[data-journal-language-note]")).toHaveCount(
      locale.note ? 1 : 0,
    );
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
