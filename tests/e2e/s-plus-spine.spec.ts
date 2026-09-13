// C2: the Experience Spine is no longer a prominent homepage surface (design
// §8, plan Task 4). Its capability is retained, not deleted — so this spec now
// guards the demotion itself plus the anchor integrity that any future mount
// depends on: every narrative stage must still bind to a real heading id on the
// homepage, in both locales.
import { expect, test } from "@playwright/test";

const EN_ANCHORS = [
  "#hero-title",
  "#house-title",
  "#trust-title",
  "#about-title",
];
const VI_ANCHORS = EN_ANCHORS;

const SPINE_NAV = /Homepage story|trang chủ/i;

test("homepage no longer promotes the experience spine", async ({ page }) => {
  for (const path of ["/en/", "/vi/"]) {
    await page.goto(path);
    await expect(page.getByRole("navigation", { name: SPINE_NAV })).toHaveCount(
      0,
    );
    await expect(page.locator("[data-experience-spine]")).toHaveCount(0);
  }
});

test("every narrative stage still binds to a real homepage heading id", async ({
  page,
}) => {
  for (const [path, anchors] of [
    ["/en/", EN_ANCHORS],
    ["/vi/", VI_ANCHORS],
  ] as const) {
    await page.goto(path);
    for (const anchor of anchors) {
      await expect(page.locator(anchor)).toHaveCount(1);
      await expect(page.locator(anchor)).toBeVisible();
    }
  }
});

test("the demoted story stages are reachable in document order", async ({
  page,
}) => {
  await page.goto("/en/");
  const positions = await page.evaluate((selectors) => {
    return selectors.map((selector) => {
      const element = document.querySelector(selector);
      return element ? element.getBoundingClientRect().top : null;
    });
  }, EN_ANCHORS);
  expect(positions.every((top) => typeof top === "number")).toBe(true);
  const sorted = [...(positions as number[])].sort((a, b) => a - b);
  expect(positions).toEqual(sorted);
});

test("320px homepage keeps no horizontal overflow", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/en/");
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    ),
  ).toBe(false);
});

test("reduced motion keeps the homepage complete", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/en/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  for (const anchor of EN_ANCHORS) {
    await expect(page.locator(anchor)).toHaveCount(1);
  }
  await context.close();
});
