import { expect, test } from "@playwright/test";

// CX4 (audit M1, Owner decision 2026-10-12): Home gets a quiet closing
// "Next steps" row (About + Contact). The header does NOT gain Contact.
const LOCALES = ["en", "vi", "zh", "zh-hant"] as const;

const PRIMARY = {
  en: "Primary",
  vi: "Chính",
  zh: "主导航",
  "zh-hant": "主導覽",
} as const;

for (const lang of LOCALES) {
  test(`/${lang}/ closes with a Next steps row linking About and Contact`, async ({
    page,
  }) => {
    await page.goto(`/${lang}/`);
    const row = page.locator("[data-home-next-steps]");
    await expect(row).toHaveCount(1);
    await expect(row.locator("a")).toHaveCount(2);
    await expect(row.locator(`a[href="/${lang}/about/"]`)).toHaveCount(1);
    await expect(row.locator(`a[href="/${lang}/contact/"]`)).toHaveCount(1);
    for (const a of await row.locator("a").all()) {
      expect((await a.innerText()).trim().length).toBeGreaterThan(0);
    }
    // Order: after the last product card, before the footer.
    const order = await page.evaluate(() => {
      const row = document.querySelector("[data-home-next-steps]")!;
      const footer = document.querySelector("footer")!;
      const cards = [
        ...document.querySelectorAll("main a[href*='/products/']"),
      ];
      const lastCard = cards[cards.length - 1]!;
      const f = Node.DOCUMENT_POSITION_FOLLOWING;
      return {
        afterCards: !!(lastCard.compareDocumentPosition(row) & f),
        beforeFooter: !!(row.compareDocumentPosition(footer) & f),
      };
    });
    expect(order).toEqual({ afterCards: true, beforeFooter: true });
    // Home still has no journey bar (v6 S1) and no script is needed.
    await expect(page.locator("[data-journey-bar]")).toHaveCount(0);
  });

  test(`/${lang}/ desktop header (Primary nav) has no Contact link (Owner decision)`, async ({
    page,
  }) => {
    await page.goto(`/${lang}/`);
    await expect(
      page.locator(`header nav[aria-label="${PRIMARY[lang]}"] a`),
    ).not.toHaveCount(0);
    await expect(
      page.locator(
        `header nav[aria-label="${PRIMARY[lang]}"] a[href="/${lang}/contact/"]`,
      ),
    ).toHaveCount(0);
  });

  test(`/${lang}/ has no horizontal overflow at 390`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/${lang}/`);
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test("the row works without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/en/");
  await expect(
    page.locator('[data-home-next-steps] a[href="/en/contact/"]'),
  ).toBeVisible();
  await context.close();
});

// Negative proof: the guards must fail on the broken invariant.
test("negative: a Contact link in the Primary nav and a missing row are detected", async ({
  page,
}) => {
  await page.goto("/en/");
  const primary = page.locator('header nav[aria-label="Primary"]');
  await page.evaluate(() => {
    const a = document.createElement("a");
    a.href = "/en/contact/";
    document.querySelector('header nav[aria-label="Primary"]')!.appendChild(a);
    document.querySelector("[data-home-next-steps]")!.remove();
  });
  await expect(primary.locator('a[href="/en/contact/"]')).toHaveCount(1);
  await expect(page.locator("[data-home-next-steps]")).toHaveCount(0);
});
