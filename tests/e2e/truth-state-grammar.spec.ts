import { expect, test } from "@playwright/test";
import { startFixtureServer } from "./helpers/parity-fixture";

const EN_LABELS = [
  "Source-linked",
  "Reviewed",
  "Changed",
  "Not published",
  "Unavailable",
];
const VI_LABELS = [
  "Đã gắn nguồn",
  "Đã xem xét",
  "Đã thay đổi",
  "Chưa công bố",
  "Không khả dụng",
];

test.describe("truth-state grammar (fixture surfaces)", () => {
  let fixture: Awaited<ReturnType<typeof startFixtureServer>> | undefined;

  test.beforeAll(async () => {
    fixture = await startFixtureServer();
  });
  test.afterAll(async () => {
    await fixture?.close();
  });

  test("EN fixture shows all five states as visible text", async ({ page }) => {
    await page.goto(`${fixture?.origin}/en/`);
    for (const label of EN_LABELS) {
      await expect(
        page.getByText(label, { exact: true }).first(),
      ).toBeVisible();
    }
  });

  test("VI fixture shows all five states localized", async ({ page }) => {
    await page.goto(`${fixture?.origin}/vi/`);
    for (const label of VI_LABELS) {
      await expect(
        page.getByText(label, { exact: true }).first(),
      ).toBeVisible();
    }
  });

  test("meaning is textual: glyphs stay out of the accessible name", async ({
    page,
  }) => {
    await page.goto(`${fixture?.origin}/en/`);
    await expect(
      page.locator('[data-truth-state="not-published"]'),
    ).toHaveAccessibleName("Not published");
    await expect(
      page.locator('[data-truth-state="source-linked"]'),
    ).toHaveAccessibleName("Source-linked");
  });

  test("no scoring, certification, or verified language inside the states", async ({
    page,
  }) => {
    for (const route of ["en", "vi"]) {
      await page.goto(`${fixture?.origin}/${route}/`);
      const text = await page.locator("[data-truth-states]").innerText();
      expect(text).not.toMatch(/score|verified|certified|%/i);
    }
  });

  test("200% text zoom keeps every state readable without overflow", async ({
    page,
  }) => {
    await page.goto(`${fixture?.origin}/en/`);
    await page.evaluate(() => {
      document.documentElement.style.fontSize = "200%";
    });
    for (const label of EN_LABELS) {
      await expect(
        page.getByText(label, { exact: true }).first(),
      ).toBeVisible();
    }
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  });

  test("states are static — no continuous animation", async ({ page }) => {
    await page.goto(`${fixture?.origin}/en/`);
    const animationName = await page
      .locator('[data-truth-state="reviewed"]')
      .evaluate((el) => getComputedStyle(el).animationName);
    expect(animationName).toBe("none");
  });
});
