import { expect, test, type Page } from "@playwright/test";

/**
 * VA-01 throttled re-check: the hero horizon field is absolutely positioned
 * and anchored to the hero's bottom edge. When it came before the hero content
 * in source order, a progressive first paint (Slow 4G + 4x CPU, 390 px) laid
 * it out against a half-parsed, shorter hero; it then jumped down by ~450 px
 * once the rest arrived (CLS 0.28 on /vi/ in 3 of 11 runs). After the content,
 * the field first appears only once the hero above it is complete.
 *
 * A throttled CLS run is not deterministic enough for a gate, so this guards
 * the cause: source order, plus the paint order the move must not change.
 */
const LOCALES = ["en", "vi", "zh", "zh-hant"] as const;

type HeroOrder = {
  fieldAfterContent: boolean;
  fieldZ: string;
  contentZ: string;
};

export const orderHolds = (order: HeroOrder | null) =>
  order !== null &&
  order.fieldAfterContent &&
  Number(order.fieldZ) < Number(order.contentZ);

const heroOrder = (page: Page) =>
  page.evaluate((): HeroOrder | null => {
    const hero = document.querySelector("section.hero-plane");
    const field = hero?.querySelector(":scope > .horizon-container");
    const content = hero?.querySelector("[data-hero]");
    const layout = content?.closest(".hero-plane > *");
    if (!hero || !field || !content || !layout) return null;
    return {
      fieldAfterContent: Boolean(
        layout.compareDocumentPosition(field) &
        Node.DOCUMENT_POSITION_FOLLOWING,
      ),
      fieldZ: getComputedStyle(field).zIndex,
      contentZ: getComputedStyle(content).zIndex,
    };
  });

test("negative proof: the order predicate rejects the old order", () => {
  expect(
    orderHolds({ fieldAfterContent: false, fieldZ: "1", contentZ: "2" }),
  ).toBe(false);
  expect(
    orderHolds({ fieldAfterContent: true, fieldZ: "2", contentZ: "2" }),
  ).toBe(false);
  expect(
    orderHolds({ fieldAfterContent: true, fieldZ: "auto", contentZ: "2" }),
  ).toBe(false);
  expect(orderHolds(null)).toBe(false);
  expect(
    orderHolds({ fieldAfterContent: true, fieldZ: "1", contentZ: "2" }),
  ).toBe(true);
});

test.describe("VA-01 hero field source order", () => {
  for (const lang of LOCALES) {
    test(`${lang} home: the horizon field follows the hero content`, async ({
      page,
    }) => {
      await page.goto(`/${lang}/`);
      expect(orderHolds(await heroOrder(page))).toBe(true);
    });
  }

  test("negative proof: the old source order is caught in the page", async ({
    page,
  }) => {
    await page.goto("/vi/");
    expect(orderHolds(await heroOrder(page))).toBe(true);
    // Reintroduce the defect: put the field back before the hero content.
    await page.evaluate(() => {
      const hero = document.querySelector("section.hero-plane");
      const field = hero?.querySelector(":scope > .horizon-container");
      if (hero && field) hero.prepend(field);
    });
    expect(orderHolds(await heroOrder(page))).toBe(false);
  });
});
