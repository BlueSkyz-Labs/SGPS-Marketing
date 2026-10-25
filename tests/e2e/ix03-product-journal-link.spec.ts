import { expect, test } from "@playwright/test";
import { postsCitingProduct } from "./helpers/journal-source";

/**
 * Audit IX-03: a product profile links every journal post that cites it, in
 * the languages that have posts (en, vi), newest first. The expected posts are
 * read from the content source (helpers/journal-source), not pinned; zh and
 * zh-Hant have no post and render no section. The link text is the post's own
 * title and the heading is the Journal's existing title.
 */
const WITH_POST = [
  { lang: "en", heading: "Journey" },
  { lang: "vi", heading: "Hành trình" },
] as const;

for (const { lang, heading } of WITH_POST) {
  test(`/${lang}/products/sotro/ links its journal posts`, async ({ page }) => {
    const expected = postsCitingProduct(lang, "sotro");
    expect(expected.length).toBeGreaterThan(0);
    await page.goto(`/${lang}/products/sotro/`);
    const section = page.locator("[data-product-journal]");
    await expect(section).toHaveCount(1);
    await expect(section.getByRole("heading", { level: 2 })).toHaveText(
      heading,
    );
    const links = section.locator("[data-product-journal-link]");
    await expect(links).toHaveCount(expected.length);
    expect(
      await links.evaluateAll((els) =>
        els.map((el) => el.getAttribute("href")),
      ),
    ).toEqual(expected.map((post) => `/${lang}/journal/${post.id}/`));
    const link = links.first();
    const text = (await link.innerText()).trim();
    expect(text.length).toBeGreaterThan(0);
    await link.click();
    await expect(page).toHaveURL(
      new RegExp(`/${lang}/journal/${expected[0].id}/$`),
    );
    // Link text is the post's own title.
    await expect(page.locator("h1")).toHaveText(text);
  });
}

for (const lang of ["zh", "zh-hant"]) {
  test(`/${lang}/products/sotro/ renders no journal section`, async ({
    page,
  }) => {
    await page.goto(`/${lang}/products/sotro/`);
    await expect(page.locator("[data-product-journal]")).toHaveCount(0);
  });
}

test("every product page links exactly the posts that cite it", async ({
  page,
}) => {
  await page.goto("/en/products/");
  const hrefs = await page
    .locator('a[href^="/en/products/"]')
    .evaluateAll((els) => els.map((el) => el.getAttribute("href")));
  const profiles = [...new Set(hrefs)].filter(
    (href): href is string =>
      href !== null &&
      href !== "/en/products/" &&
      href.split("/").filter(Boolean).length === 3,
  );
  // The fail-closed branch (no citing post, no section) is covered by the
  // zh / zh-hant cases above.
  expect(profiles.length).toBeGreaterThan(0);
  for (const href of profiles) {
    const expected = postsCitingProduct("en", href.split("/")[3]);
    await page.goto(href);
    await expect(page.locator("[data-product-journal]")).toHaveCount(
      expected.length > 0 ? 1 : 0,
    );
    await expect(page.locator("[data-product-journal-link]")).toHaveCount(
      expected.length,
    );
  }
});
