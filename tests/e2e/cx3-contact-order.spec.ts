import { test, expect, type Page } from "@playwright/test";

/**
 * CX3 (CX audit H3 + L1, Owner 2026-10-12): on Contact the business card comes
 * first with the primary action; Security is a secondary, text-level card
 * below it. Every link on Contact and Privacy is at least 44px tall at 390px.
 * Each guard has a negative proof that breaks the invariant in the DOM.
 */

const LANGS = ["en", "vi", "zh", "zh-hant"] as const;
const MIN = 44;

async function cardOrder(page: Page): Promise<string[]> {
  return page
    .locator("main ul.grid > li")
    .evaluateAll((els) =>
      els.map((el) => el.getAttribute("data-contact-card") ?? "?"),
    );
}

async function shortLinks(page: Page): Promise<string[]> {
  return page.locator("main a").evaluateAll((els, min) => {
    return (els as HTMLElement[])
      .map((el) => ({
        text: (el.textContent ?? "").trim().slice(0, 40),
        h: el.getBoundingClientRect().height,
      }))
      .filter((l) => l.h < (min as number) - 0.5)
      .map((l) => `${l.text} (${Math.round(l.h)}px)`);
  }, MIN);
}

for (const lang of LANGS) {
  test.describe(`CX3 /${lang}/contact/`, () => {
    test("business card is first, security below", async ({ page }) => {
      await page.goto(`/${lang}/contact/`);
      expect(await cardOrder(page)).toEqual(["business", "security"]);
      const [b, s] = await Promise.all([
        page.locator('[data-contact-card="business"]').boundingBox(),
        page.locator('[data-contact-card="security"]').boundingBox(),
      ]);
      expect(b!.y).toBeLessThanOrEqual(s!.y);
    });

    test("business primary action is the mailto button", async ({ page }) => {
      await page.goto(`/${lang}/contact/`);
      const primary = page.locator(
        '[data-contact-card="business"] a[data-button-variant="primary"]',
      );
      await expect(primary).toHaveCount(1);
      await expect(primary).toHaveAttribute(
        "href",
        /^mailto:(?:hello|tony)@blueskyzlabs\.com$/,
      );
      // First link in the document body of main is the business action.
      const first = page.locator("main a").first();
      await expect(first).toHaveAttribute("data-contact-primary", "true");
    });

    test("security card is text-level, link and meaning kept", async ({
      page,
    }) => {
      await page.goto(`/${lang}/contact/`);
      const card = page.locator('[data-contact-card="security"]');
      await expect(
        card.locator('a[data-button-variant="primary"]'),
      ).toHaveCount(0);
      await expect(card.locator(`a[href="/${lang}/security/"]`)).toHaveCount(1);
      await expect(
        card.locator('[data-safe-action="private-reporting"] a'),
      ).toHaveAttribute("href", /security\/advisories\/new$/);
    });

    for (const route of ["contact", "privacy"]) {
      test(`/${lang}/${route}/ links are >= ${MIN}px at 390`, async ({
        page,
      }) => {
        await page.setViewportSize({ width: 390, height: 844 });
        await page.goto(`/${lang}/${route}/`);
        expect(await page.locator("main a").count()).toBeGreaterThan(0);
        expect(await shortLinks(page)).toEqual([]);
      });
    }
  });
}

test.describe("CX3 negative proofs", () => {
  test("swapping the cards is detected", async ({ page }) => {
    await page.goto("/en/contact/");
    await page.evaluate(() => {
      const ul = document.querySelector("main ul.grid")!;
      ul.append(ul.querySelector('[data-contact-card="business"]')!);
    });
    expect(await cardOrder(page)).toEqual(["security", "business"]);
  });

  test("restoring the primary button on security is detected", async ({
    page,
  }) => {
    await page.goto("/en/contact/");
    await page.evaluate(() => {
      document
        .querySelector('[data-contact-card="security"] a.btn')!
        .setAttribute("data-button-variant", "primary");
    });
    await expect(
      page.locator(
        '[data-contact-card="security"] a[data-button-variant="primary"]',
      ),
    ).toHaveCount(1);
  });

  test("a short link is detected at 390", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/en/contact/");
    await page.evaluate(() => {
      const a = document.querySelector<HTMLElement>(
        '[data-contact-card="security"] a[href="/en/security/"]',
      )!;
      a.style.minHeight = "0";
      a.style.display = "inline";
      a.style.lineHeight = "17px";
    });
    expect((await shortLinks(page)).length).toBeGreaterThan(0);
  });
});
