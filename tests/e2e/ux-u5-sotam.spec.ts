import { expect, test, type Locator, type Page } from "@playwright/test";

/**
 * UX-U5 (P1-7): Sổ Tâm is no longer under-served. Home carries a tap-sized
 * secondary entry for it (not only the inline link in the product line), and its
 * profile has no redundant endorsed lockup. Owner 2026-10-18 (A-01): the early
 * next-steps row is gone; the closing journey bar makes Contact the one
 * primary action while the product has no screens to show.
 */
const LOCALES = ["en", "vi", "zh", "zh-hant"] as const;

/** A real entry: >= 44 px target, a box (not inline), and not the bare inline link. */
async function isTapEntry(link: Locator): Promise<boolean> {
  return link.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    const style = getComputedStyle(el);
    return (
      rect.height >= 44 &&
      rect.width >= 44 &&
      style.display !== "inline" &&
      !el.closest("p")
    );
  });
}

/** hrefs of the journey bar's primary buttons. */
async function journeyPrimaries(page: Page): Promise<(string | null)[]> {
  return page
    .locator("nav[data-journey-bar] a.btn--primary")
    .evaluateAll((els) => els.map((el) => el.getAttribute("href")));
}

for (const lang of LOCALES) {
  test.describe(`${lang}`, () => {
    test("Home: Sổ Tâm has a tap-sized entry beyond the inline link", async ({
      page,
    }) => {
      await page.goto(`/${lang}/`);
      const chip = page.locator("main [data-hero-entry='sotam']");
      await expect(chip).toBeVisible();
      await expect(chip).toHaveAttribute("href", `/${lang}/products/sotam/`);
      expect(await isTapEntry(chip)).toBe(true);
      // The chip is not the only link in its parent container.
      const siblings = await chip.evaluate(
        (el) => el.parentElement!.children.length,
      );
      expect(siblings).toBeGreaterThan(1);
      // Negative proof: the bare inline link in the product line fails the same
      // predicate, so the guard would catch a regression to that form.
      const inline = page.locator("[data-hero-product-line] a").nth(1);
      await expect(inline).toHaveAttribute("href", `/${lang}/products/sotam/`);
      expect(await isTapEntry(inline)).toBe(false);
    });

    test("profile: Contact is the one primary step, no early row or lockup", async ({
      page,
    }) => {
      await page.goto(`/${lang}/products/sotam/`);
      await expect(page.locator("[data-profile-next-steps]")).toHaveCount(0);
      expect(await journeyPrimaries(page)).toEqual([`/${lang}/contact/`]);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator(".profile-lockup")).toHaveCount(0);
      // Landmark names stay unique next to the closing journey bar.
      const labels = await page
        .locator("main nav[aria-label]")
        .evaluateAll((els) => els.map((el) => el.getAttribute("aria-label")));
      expect(new Set(labels).size).toBe(labels.length);
    });
  });
}

test("negative proofs: the guards detect the old shapes", async ({
  page,
}: {
  page: Page;
}) => {
  // A page with only an inline link in a paragraph fails the entry predicate.
  await page.setContent(
    `<p>In development: <a id="a" href="/x/">Sổ Tâm</a>, a journal.</p>`,
  );
  expect(await isTapEntry(page.locator("#a"))).toBe(false);
  // Sổ Trọ shows real screens, so its journey bar keeps no Contact primary:
  // the primary check is driven by the profile, not true everywhere.
  await page.goto("/en/products/sotro/");
  expect(await journeyPrimaries(page)).not.toContain("/en/contact/");
  // Sổ Trọ keeps its endorsed lockup (it has real screens), proving the lockup
  // check measures something and that only the identity-art profile drops it.
  await page.goto("/en/products/sotro/");
  await expect(page.locator(".profile-lockup")).toHaveCount(1);
});
