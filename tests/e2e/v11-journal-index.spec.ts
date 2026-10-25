import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { publishedPosts } from "./helpers/journal-source";

/**
 * v11 J1: the journal index renders in every locale, stays noindex while it
 * has no published post, shows honest empty states, and passes axe.
 * Journey P1-B: the section label is "Journey" / "Hành trình" (Owner D-2) and
 * en/vi list every published post, newest first, read from the content source
 * (helpers/journal-source); zh / zh-hant (no posts, language note) keep the
 * honest empty state.
 */
const LOCALES = [
  { lang: "en", title: "Journey", note: false },
  { lang: "vi", title: "Hành trình", note: false },
  { lang: "zh", title: "日志", note: true },
  { lang: "zh-hant", title: "日誌", note: true },
] as const;

for (const locale of LOCALES) {
  test(`${locale.lang}: journal index is noindex, honest about its posts and accessible`, async ({
    page,
  }) => {
    const expected = publishedPosts(locale.lang);
    const posts = expected.length;
    expect(posts > 0).toBe(!locale.note);
    await page.goto(`/${locale.lang}/journal/`);
    await expect(page.locator("h1")).toHaveText(locale.title);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      "content",
      /noindex/,
    );
    // Audit IX-09: only branches that hold a post render; with no post the
    // page keeps one honest empty state and no branch heading.
    const branches = [...new Set(expected.map((post) => post.branch))];
    const rendered = await page
      .locator("[data-journal-branch]")
      .evaluateAll((els) =>
        els.map((el) => el.getAttribute("data-journal-branch")),
      );
    expect([...rendered].sort()).toEqual([...branches].sort());
    await expect(page.locator("[data-journal-empty]")).toHaveCount(
      posts > 0 ? 0 : 1,
    );
    await expect(page.locator("[data-journal-item]")).toHaveCount(posts);
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
