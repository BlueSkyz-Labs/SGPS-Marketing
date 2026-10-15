import { expect, test } from "@playwright/test";

/**
 * UX P2-8 (red-team 2026-10-12): the footer's right third was empty because
 * the link grid had three fixed columns for two groups. The grid now has one
 * column per group, and on wide screens the groups end at the container's
 * right edge, under the language switcher.
 */
const LANGS = ["en", "vi", "zh", "zh-hant"] as const;

export const oneColumnPerGroup = (columns: number, groups: number) =>
  columns === groups;
export const flushRight = (navRight: number, bodyRight: number) =>
  Math.abs(bodyRight - navRight) <= 1;

test("negative proof: the guard predicates can fail", () => {
  expect(oneColumnPerGroup(3, 2)).toBe(false);
  expect(flushRight(1100, 1316)).toBe(false);
  expect(oneColumnPerGroup(2, 2)).toBe(true);
  expect(flushRight(1316, 1316)).toBe(true);
});

// Measures the right edge of the last link group, not the nav box: with the
// old fixed three tracks the nav box still spanned the column while the last
// group stopped two thirds of the way across.
const measure = () => {
  const footer = document.querySelector("footer")!;
  const nav = footer.querySelector<HTMLElement>(".footer-nav")!;
  const body = footer.querySelector(".footer-body")!;
  const groups = [...nav.children] as HTMLElement[];
  return {
    columns: getComputedStyle(nav)
      .gridTemplateColumns.split(" ")
      .filter(Boolean).length,
    groups: groups.length,
    lastRight: Math.max(...groups.map((g) => g.getBoundingClientRect().right)),
    bodyRight: body.getBoundingClientRect().right,
  };
};

test("negative proof: the old three-track layout fails the guard", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/en/");
  await page.evaluate(() => {
    const footer = document.querySelector("footer")!;
    const nav = footer.querySelector<HTMLElement>(".footer-nav")!;
    footer.querySelector<HTMLElement>(
      ".footer-body",
    )!.style.gridTemplateColumns = "minmax(0,1fr) minmax(0,1.6fr)";
    nav.style.gridTemplateColumns = "repeat(3, minmax(0, 1fr))";
  });
  const m = await page.evaluate(measure);
  expect(oneColumnPerGroup(m.columns, m.groups)).toBe(false);
  expect(flushRight(m.lastRight, m.bodyRight)).toBe(false);
});

for (const lang of LANGS) {
  test(`${lang} 1440: one column per group, groups end at the right edge`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/${lang}/`);
    const m = await page.evaluate(measure);
    expect(m.groups).toBeGreaterThanOrEqual(2);
    expect(oneColumnPerGroup(m.columns, m.groups), JSON.stringify(m)).toBe(
      true,
    );
    expect(flushRight(m.lastRight, m.bodyRight), JSON.stringify(m)).toBe(true);
  });
}
