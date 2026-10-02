import { expect, test } from "@playwright/test";

/**
 * v8 W3: product pages read as a story. Measured in the rendered pages; the
 * pure predicates are proven to fail on a broken input (negative proof).
 */
const LOCALES = ["en", "vi", "zh", "zh-hant"] as const;
const STORE_CTA = /google play|app store|get it on|tải trên|下载于|下載於/i;

/** Rendered page height budget at 1440 px for Sổ Trọ. */
export const MAX_SOTRO_HEIGHT = 5000;
const withinHeight = (height: number) => height <= MAX_SOTRO_HEIGHT;
const hasStoreCta = (text: string, anchors: number) =>
  anchors > 0 || STORE_CTA.test(text);

test("negative proof: the height and store-CTA predicates can fail", () => {
  expect(withinHeight(5001)).toBe(false);
  expect(hasStoreCta("Android: Get it on Google Play", 0)).toBe(true);
  expect(hasStoreCta("Android and iOS: in development", 1)).toBe(true);
});

for (const lang of LOCALES) {
  test.describe(lang, () => {
    test("Sổ Trọ has exactly one primary action, anchored to the screens", async ({
      page,
    }) => {
      await page.goto(`/${lang}/products/sotro/`);
      const primary = page.locator("[data-primary-action]");
      await expect(primary).toHaveCount(1);
      await expect(primary).toHaveAttribute("href", "#profile-showcase");
      await expect(page.locator("#profile-showcase")).toHaveCount(1);
      // Sign-in is a text link, not a button.
      const signIn = page.locator("[data-app-signin]");
      await expect(signIn).toHaveCount(1);
      await expect(signIn).not.toHaveAttribute("data-primary-action", /.*/);
    });

    test("Sổ Tâm has no primary action", async ({ page }) => {
      await page.goto(`/${lang}/products/sotam/`);
      await expect(page.locator("[data-primary-action]")).toHaveCount(0);
      await expect(page.locator("[data-app-signin]")).toHaveCount(1);
    });

    for (const slug of ["sotro", "sotam"]) {
      test(`${slug}: one Availability line, no store CTA, no audience`, async ({
        page,
      }) => {
        await page.goto(`/${lang}/products/${slug}/`);
        const line = page.locator("[data-app-access]");
        await expect(line).toHaveCount(1);
        await expect(line.locator("a")).toHaveCount(0);
        const text = (await line.textContent()) ?? "";
        expect(hasStoreCta(text, 0), text).toBe(false);
        await expect(page.locator("[data-mobile-state]")).toHaveCount(1);
        await expect(page.locator("main")).not.toContainText(
          /Audience|Đối tượng|目标人群|適用對象|Professionals|Individuals/i,
        );
      });

      test(`${slug}: one What it does list of at most five items`, async ({
        page,
      }) => {
        await page.goto(`/${lang}/products/${slug}/`);
        const items = page.locator("[data-what-it-does] > li");
        const count = await items.count();
        expect(count).toBeGreaterThan(0);
        expect(count).toBeLessThanOrEqual(5);
        await expect(page.locator("h2#profile-jobs")).toHaveCount(1);
        await expect(page.locator("#profile-capabilities")).toHaveCount(0);
      });
    }

    test("Sổ Tâm shows no tagline art and no 'AI Journal for Clarity'", async ({
      page,
    }) => {
      await page.goto(`/${lang}/products/sotam/`);
      await expect(page.locator("[data-product-visual] img")).toHaveCount(0);
      await expect(page.locator("main")).not.toContainText(
        /AI Journal for Clarity/i,
      );
      await expect(page.locator("main")).not.toContainText(
        /A BlueSkyz Labs product/i,
      );
    });

    test("Sổ Trọ gallery leads with 3 phone and 1 desktop capture; the rest are behind More screens", async ({
      page,
    }) => {
      await page.goto(`/${lang}/products/sotro/`);
      const more = page.locator("[data-showcase-more]");
      await expect(more).toHaveCount(1);
      const lead = await page.evaluate(() => ({
        phones: [
          ...document.querySelectorAll(
            "[data-product-showcase] .showcase__phone",
          ),
        ].filter((el) => !el.closest("[data-showcase-more]")).length,
        desktops: [
          ...document.querySelectorAll(
            "[data-product-showcase] .showcase__desktops > li",
          ),
        ].filter((el) => !el.closest("[data-showcase-more]")).length,
      }));
      expect(lead).toEqual({ phones: 3, desktops: 1 });
      expect(await more.getAttribute("open")).toBeNull();
      await expect(
        more.locator(".showcase__phone, .showcase__desktops > li"),
      ).toHaveCount(6);
      await page.locator("[data-showcase-more] > summary").click();
      await expect(more).toHaveAttribute("open", "");
    });

    test("Privacy, security, support is one inline sentence of three links", async ({
      page,
    }) => {
      await page.goto(`/${lang}/products/sotro/`);
      const trust = page.locator("[data-profile-trust]");
      await expect(trust).toHaveCount(1);
      await expect(trust.locator("a")).toHaveCount(3);
      await expect(trust.locator("svg")).toHaveCount(0);
    });
  });
}

test("Sổ Trọ is at most 5000 px tall at 1440", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/en/products/sotro/");
  await page.locator("[data-showcase-more]").waitFor();
  const height = await page.evaluate(
    () => document.documentElement.scrollHeight,
  );
  expect(withinHeight(height), `height ${height}`).toBe(true);
});

test("the endorsed lockup is hidden at 390 px and visible at 1440", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en/products/sotro/");
  await expect(page.locator(".profile-lockup")).toBeHidden();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(page.locator(".profile-lockup")).toBeVisible();
});
