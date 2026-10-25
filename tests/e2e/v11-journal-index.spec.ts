import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * v11 J1: the journal index renders in every locale, stays noindex while it
 * has no published post, shows honest empty states, and passes axe.
 * Journey P1-B: the section label is "Journey" / "Hành trình" (Owner D-2) and
 * en/vi list the two first posts; zh / zh-hant (no posts, language note)
 * keep the honest empty state.
 */
const LOCALES = [
  { lang: "en", title: "Journey", note: false, posts: 2 },
  { lang: "vi", title: "Hành trình", note: false, posts: 2 },
  { lang: "zh", title: "日志", note: true, posts: 0 },
  { lang: "zh-hant", title: "日誌", note: true, posts: 0 },
] as const;

for (const locale of LOCALES) {
  test(`${locale.lang}: journal index is noindex, honest about its posts and accessible`, async ({
    page,
  }) => {
    await page.goto(`/${locale.lang}/journal/`);
    await expect(page.locator("h1")).toHaveText(locale.title);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/,
    );
    // Audit IX-09: only branches that hold a post render (both first posts are
    // in the news branch, so the product branch is absent); with no post the
    // page keeps one honest empty state and no branch heading.
    await expect(page.locator("[data-journal-branch]")).toHaveCount(
      locale.posts > 0 ? 1 : 0,
    );
    if (locale.posts > 0) {
      await expect(page.locator("[data-journal-branch]")).toHaveAttribute(
        "data-journal-branch",
        "news",
      );
    }
    await expect(page.locator("[data-journal-empty]")).toHaveCount(
      locale.posts > 0 ? 0 : 1,
    );
    await expect(page.locator("[data-journal-item]")).toHaveCount(locale.posts);
    // Dates read as on the post page (localized), never a raw ISO string; the
    // machine-readable date stays in `datetime`.
    for (const time of await page.locator("[data-journal-item] time").all()) {
      await expect(time).toHaveAttribute("datetime", /^\d{4}-\d{2}-\d{2}$/);
      await expect(time).not.toHaveText(/^\s*\d{4}-\d{2}-\d{2}\s*$/);
    }
    await expect(page.locator("[data-journal-language-note]")).toHaveCount(
      locale.note ? 1 : 0,
    );
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
