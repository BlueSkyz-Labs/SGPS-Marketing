import { expect, test, type Page } from "@playwright/test";

/**
 * UX-U7 (P1-9 / C-05 / B-V7): Verify renders each claim as one card that
 * groups claim -> limit -> source, so a visitor sees which source backs which
 * claim. The card is the `[data-claim-id]` element; everything is checked as
 * DOM containment, so the guard is independent of layout.
 */

const LOCALES = ["en", "vi", "zh", "zh-hant"] as const;

/** Per card: contains a claim heading, a source link, and (when present) its limit. */
async function cardReport(page: Page, cardSelector: string) {
  return page.evaluate((sel) => {
    return Array.from(document.querySelectorAll(sel)).map((card) => ({
      statement:
        card.querySelector(".verify-claim__statement")?.textContent?.trim() ??
        "",
      sourceLinks: card.querySelectorAll("[data-sources-line] a[href]").length,
      hasLimitInside: card.querySelector(".verify-claim__limit") !== null,
    }));
  }, cardSelector);
}

for (const lang of LOCALES) {
  test(`verify cards (${lang}): claim, limit and source live in one card`, async ({
    page,
  }) => {
    await page.goto(`/${lang}/verify/`);
    const cards = await cardReport(page, "[data-claim-id]");
    expect(cards.length).toBeGreaterThan(0);
    for (const card of cards) {
      expect(card.statement.length).toBeGreaterThan(0);
      expect(card.sourceLinks).toBeGreaterThan(0);
    }
    // Every limit and every sources line on the page is inside some card.
    const stray = await page.evaluate(
      () =>
        document.querySelectorAll(
          ".verify-claim__limit:not([data-claim-id] *), [data-verify-centre] [data-sources-line]:not([data-claim-id] *):not([data-verify-layer] *)",
        ).length,
    );
    expect(stray).toBe(0);
    // At least the first claim carries a limit inside its card.
    expect(cards[0]!.hasLimitInside).toBe(true);
  });

  test(`verify cards (${lang}): heading levels do not skip, 390px has no horizontal scroll`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/${lang}/verify/`);
    const levels = await page.evaluate(() =>
      Array.from(
        document.querySelectorAll("main h1, main h2, main h3, main h4"),
      ).map((h) => Number(h.tagName[1])),
    );
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i]! - levels[i - 1]!, `heading ${i}`).toBeLessThanOrEqual(
        1,
      );
    }
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    // G-07: the row is ruled by a hairline on top (no box).
    const border = await page
      .locator("[data-claim-id]")
      .first()
      .evaluate((el) => getComputedStyle(el).borderTopWidth);
    expect(border).toBe("1px");
  });
}

test("negative proof: a source rendered outside its card fails the same check", async ({
  page,
}) => {
  await page.setContent(`
    <ul>
      <li class="verify-claim" data-claim-id="x">
        <h3 class="verify-claim__statement">Claim</h3>
        <p class="verify-claim__limit">Limit</p>
      </li>
    </ul>
    <p data-sources-line><a href="/a/">Source</a></p>`);
  const [card] = await cardReport(page, "[data-claim-id]");
  expect(card!.sourceLinks).toBe(0); // the guard's assertion (>0) would fail
});
