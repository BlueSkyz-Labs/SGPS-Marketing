import { expect, test } from "@playwright/test";

/**
 * S+ / C2 — One House section.
 *
 * C2 redesign approved: the homepage One House section is now an editorial
 * interlude (`data-one-house-editorial`) rather than a framework matrix.
 * The principle matrix (`data-principle-matrix`) is no longer on the homepage;
 * it may exist on dedicated surfaces. These tests reflect the C2-approved
 * editorial treatment while preserving equivalent truth invariants.
 *
 * Invariants preserved:
 *  - Four plain-language philosophy concepts, EN and VI parity
 *  - No hover-only critical information (all concepts visible without interaction)
 *  - No fabricated assurance claims (certs, scores, grades)
 *  - No horizontal overflow at 320px
 *  - Full content available without JavaScript
 */

const EN_CONCEPTS = [
  "Clarity",
  "Human agency",
  "Purposeful intelligence",
  "Trust by design",
];
const VI_CONCEPTS = [
  "Rõ ràng",
  "Con người giữ quyền chủ động",
  "Trí tuệ có mục đích",
  "Tin cậy ngay từ thiết kế",
];

const FORBIDDEN = [
  /certifi/i,
  /\bISO\b/,
  /\bSOC\b/,
  /bank-grade/i,
  /military-grade/i,
  /trust score/i,
  /maturity score/i,
];

test("every concept is present in the editorial section on /en/", async ({
  page,
}) => {
  await page.goto("/en/");
  const oneHouse = page.locator("[data-one-house-editorial]");
  await expect(oneHouse).toBeVisible();
  await expect(oneHouse.locator("[data-one-house-concept]")).toHaveCount(4);
  for (const concept of EN_CONCEPTS) {
    await expect(
      oneHouse.getByRole("heading", { level: 3, name: concept }),
    ).toBeVisible();
  }
  // C2: principle matrix removed from homepage per approved design
  await expect(page.locator("[data-principle-matrix]")).toHaveCount(0);
});

test("every concept is present in the editorial section on /vi/ (parity)", async ({
  page,
}) => {
  await page.goto("/vi/");
  const oneHouse = page.locator("[data-one-house-editorial]");
  await expect(oneHouse).toBeVisible();
  await expect(oneHouse.locator("[data-one-house-concept]")).toHaveCount(4);
  for (const concept of VI_CONCEPTS) {
    await expect(
      oneHouse.getByRole("heading", { level: 3, name: concept }),
    ).toBeVisible();
  }
  // C2: principle matrix removed from homepage per approved design
  await expect(page.locator("[data-principle-matrix]")).toHaveCount(0);
});

test("no hover-only critical information in the One House section", async ({
  page,
}) => {
  await page.goto("/en/");
  const oneHouse = page.locator("[data-one-house-editorial]");
  await expect(oneHouse).toBeVisible();
  // All four concept items must be directly visible without hover/interaction
  const concepts = oneHouse.locator("[data-one-house-concept]");
  const count = await concepts.count();
  expect(count).toBe(4);
  for (let i = 0; i < count; i++) {
    await expect(concepts.nth(i)).toBeVisible();
  }
});

test("One House editorial copy avoids unsupported assurance claims", async ({
  page,
}) => {
  await page.goto("/en/");
  const oneHouse = page.locator("[data-one-house-editorial]");
  await expect(oneHouse).toBeVisible();
  const text = await oneHouse.innerText();
  for (const pattern of FORBIDDEN) {
    expect(text).not.toMatch(pattern);
  }
  // Must not imply every product uses AI or the same technology stack
  expect(text).not.toMatch(/every product.*AI|all products.*AI/i);
});

test("320px keeps no horizontal overflow with the One House section", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/en/");
  await expect(page.locator("[data-one-house-editorial]")).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    ),
  ).toBe(false);
});

test("One House editorial renders fully without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/en/");
  const oneHouse = page.locator("[data-one-house-editorial]");
  await expect(oneHouse).toBeVisible();
  // All four concepts must be present in static HTML without JS
  await expect(oneHouse.locator("[data-one-house-concept]")).toHaveCount(4);
  for (const concept of EN_CONCEPTS) {
    await expect(
      oneHouse.getByRole("heading", { level: 3, name: concept }),
    ).toBeVisible();
  }
  await context.close();
});
