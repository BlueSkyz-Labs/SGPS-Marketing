import { expect, test } from "@playwright/test";

const EN_DIMENSIONS = [
  "In the product",
  "For people",
  "Evidence",
  "Real-world impact",
];
const VI_DIMENSIONS = [
  "Trong sản phẩm",
  "Cho con người",
  "Bằng chứng",
  "Tác động thực tế",
];
const EN_PRINCIPLES = ["Intelligence", "Elevation", "Trust", "Impact"];
const VI_PRINCIPLES = ["Trí tuệ", "Nâng tầm", "Tin cậy", "Tác động"];

const FORBIDDEN = [
  /certifi/i,
  /\bISO\b/,
  /\bSOC\b/,
  /bank-grade/i,
  /military-grade/i,
  /trust score/i,
  /maturity score/i,
];

test("every principle exposes all four dimensions on /en/", async ({
  page,
}) => {
  await page.goto("/en/");
  const matrix = page.locator("[data-principle-matrix]");
  await expect(matrix).toBeVisible();
  await expect(matrix.getByRole("listitem")).toHaveCount(4);
  for (const dimension of EN_DIMENSIONS) {
    await expect(matrix.getByText(dimension, { exact: true })).toHaveCount(4);
  }
  for (const principle of EN_PRINCIPLES) {
    await expect(
      matrix.getByRole("heading", { level: 3, name: principle }),
    ).toHaveCount(1);
  }
});

test("every principle exposes all four dimensions on /vi/ (parity)", async ({
  page,
}) => {
  await page.goto("/vi/");
  const matrix = page.locator("[data-principle-matrix]");
  await expect(matrix).toBeVisible();
  await expect(matrix.getByRole("listitem")).toHaveCount(4);
  for (const dimension of VI_DIMENSIONS) {
    await expect(matrix.getByText(dimension, { exact: true })).toHaveCount(4);
  }
  for (const principle of VI_PRINCIPLES) {
    await expect(
      matrix.getByRole("heading", { level: 3, name: principle }),
    ).toHaveCount(1);
  }
});

test("no hover-only critical information in the matrix", async ({ page }) => {
  await page.goto("/en/");
  const matrix = page.locator("[data-principle-matrix]");
  await expect(matrix.locator("dt")).toHaveCount(16);
  await expect(matrix.locator("dd")).toHaveCount(16);
  const hiddenCount = await matrix.locator("dt, dd").evaluateAll(
    (elements) =>
      elements.filter((element) => {
        const node = element as HTMLElement;
        const style = getComputedStyle(node);
        return (
          style.display === "none" ||
          style.visibility === "hidden" ||
          node.offsetParent === null
        );
      }).length,
  );
  expect(hiddenCount).toBe(0);
});

test("matrix copy avoids unsupported assurance claims", async ({ page }) => {
  await page.goto("/en/");
  const text = await page.locator("[data-principle-matrix]").innerText();
  for (const pattern of FORBIDDEN) {
    expect(text).not.toMatch(pattern);
  }
});

test("320px keeps no horizontal overflow with the matrix", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/en/");
  await expect(page.locator("[data-principle-matrix]")).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    ),
  ).toBe(false);
});

test("matrix renders fully without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/en/");
  const matrix = page.locator("[data-principle-matrix]");
  await expect(matrix).toBeVisible();
  await expect(matrix.locator("dd")).toHaveCount(16);
  for (const dimension of EN_DIMENSIONS) {
    await expect(matrix.getByText(dimension, { exact: true })).toHaveCount(4);
  }
  await context.close();
});
