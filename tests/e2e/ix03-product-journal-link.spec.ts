import { expect, test } from "@playwright/test";

/**
 * Audit IX-03: the Sổ Trọ profile links the journal post that cites it, in
 * the languages that have posts (en, vi). The link is derived from the journal
 * collection; zh and zh-Hant have no post and render no section. The link text
 * is the post's own title and the heading is the Journal's existing title.
 */
const WITH_POST = [
  { lang: "en", heading: "Journey" },
  { lang: "vi", heading: "Hành trình" },
] as const;

for (const { lang, heading } of WITH_POST) {
  test(`/${lang}/products/sotro/ links its journal post`, async ({ page }) => {
    await page.goto(`/${lang}/products/sotro/`);
    const section = page.locator("[data-product-journal]");
    await expect(section).toHaveCount(1);
    await expect(section.getByRole("heading", { level: 2 })).toHaveText(
      heading,
    );
    const link = section.locator("[data-product-journal-link]");
    await expect(link).toHaveCount(1);
    await expect(link).toHaveAttribute(
      "href",
      `/${lang}/journal/so-tro-xem-truoc/`,
    );
    const text = (await link.innerText()).trim();
    expect(text.length).toBeGreaterThan(0);
    await link.click();
    await expect(page).toHaveURL(
      new RegExp(`/${lang}/journal/so-tro-xem-truoc/$`),
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

test("a product no post cites renders no journal section", async ({ page }) => {
  await page.goto("/en/products/");
  const hrefs = await page
    .locator('a[href^="/en/products/"]')
    .evaluateAll((els) => els.map((el) => el.getAttribute("href")));
  const others = [...new Set(hrefs)].filter(
    (href) =>
      href !== null &&
      href !== "/en/products/" &&
      !href.includes("sotro") &&
      href.split("/").filter(Boolean).length === 3,
  );
  expect(others.length).toBeGreaterThan(0);
  for (const href of others) {
    await page.goto(href as string);
    await expect(page.locator("[data-product-journal]")).toHaveCount(0);
  }
});
