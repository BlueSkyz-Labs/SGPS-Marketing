import { expect, test } from "@playwright/test";

/**
 * Experience v6 S1 — One House word band removed from the home.
 *
 * History: S+ / C2 rendered four plain-language principle words
 * (`data-one-house-editorial`). The audit (E-10) found them to be large type
 * with no proof, so S1 removed the band. The invariants that still apply to
 * the home are kept below: no unsupported assurance claims, no hover-only
 * critical information, no horizontal overflow at 320px and full content
 * without JavaScript.
 */
const REMOVED_CONCEPTS = [
  "Clarity",
  "Human agency",
  "Purposeful intelligence",
  "Trust by design",
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

for (const path of ["/en/", "/vi/"]) {
  test(`${path} no longer renders the One House band or its concept words`, async ({
    page,
  }) => {
    await page.goto(path);
    await expect(page.locator("[data-one-house-editorial]")).toHaveCount(0);
    await expect(page.locator("[data-principle-matrix]")).toHaveCount(0);
    for (const concept of REMOVED_CONCEPTS) {
      await expect(
        page.getByRole("heading", { level: 3, name: concept }),
      ).toHaveCount(0);
    }
  });
}

test("home copy avoids unsupported assurance claims", async ({ page }) => {
  await page.goto("/en/");
  const text = await page.locator("main").innerText();
  for (const pattern of FORBIDDEN) {
    expect(text).not.toMatch(pattern);
  }
  expect(text).not.toMatch(/every product.*AI|all products.*AI/i);
});

test("320px keeps no horizontal overflow on the home", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/en/");
  await expect(page.locator("#hero-title")).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    ),
  ).toBe(false);
});

test("home renders its hero, flagship and proof band without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/en/");
  await expect(page.locator("#hero-title")).toBeVisible();
  await expect(page.locator("[data-flagship-theatre]")).toBeVisible();
  await expect(page.locator("[data-trust-band]")).toBeVisible();
  await context.close();
});
