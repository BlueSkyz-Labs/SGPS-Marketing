import { expect, test } from "@playwright/test";

const TRACE = '[data-source-trace="security-reporting-is-private"]';

test.describe("source-to-surface trace", () => {
  test("deterministic step order on the security surface", async ({ page }) => {
    await page.goto("/en/security/");
    const trace = page.locator(TRACE);
    await trace.scrollIntoViewIfNeeded();
    await expect(trace).toBeVisible();
    const kinds = await trace
      .locator("[data-trace-step]")
      .evaluateAll((els) =>
        els.map((el) => el.getAttribute("data-trace-step")),
      );
    expect(kinds).toEqual([
      "claim",
      "evidence",
      "evidence",
      "boundary",
      "surface",
    ]);
    await expect(trace.locator('[data-trace-step="claim"]')).toContainText(
      "private GitHub channel",
    );
    await expect(
      trace.locator('[data-trace-step="evidence"] a').first(),
    ).toHaveAttribute(
      "href",
      "https://github.com/BlueSkyz-Labs/SGPS-Marketing/security/advisories/new",
    );
    await expect(
      trace.locator('[data-trace-step="surface"] a'),
    ).toHaveAttribute("href", "/en/security/");
  });

  test("missing optional nodes disappear cleanly (empty registry)", async ({
    page,
  }) => {
    await page.goto("/en/products/");
    // The product claim cannot resolve without a public product: no trace.
    await expect(page.locator("[data-source-trace]")).toHaveCount(0);
  });

  test("trace avoids internal governance vocabulary", async ({ page }) => {
    await page.goto("/en/security/");
    const trace = page.locator(TRACE);
    await trace.scrollIntoViewIfNeeded();
    const text = await trace.innerText();
    expect(text).not.toMatch(/sha|workflow|branch|deploy|commit/i);
  });

  test("VI trace is localized", async ({ page }) => {
    await page.goto("/vi/security/");
    const trace = page.locator(TRACE);
    await trace.scrollIntoViewIfNeeded();
    await expect(trace.locator('[data-trace-step="claim"]')).toContainText(
      "Tuyên bố",
    );
    await expect(trace.locator('[data-trace-step="boundary"]')).toContainText(
      "Ranh giới",
    );
    await expect(trace.locator('[data-trace-step="surface"]')).toContainText(
      "Bề mặt",
    );
  });

  test("320px keeps the trace readable", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto("/en/security/");
    const trace = page.locator(TRACE);
    await trace.scrollIntoViewIfNeeded();
    await expect(trace).toBeVisible();
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  });

  test("print keeps the trace visible (chromium)", async ({
    page,
    browserName,
  }) => {
    test.skip(browserName !== "chromium", "print verified on chromium");
    await page.goto("/en/security/");
    const trace = page.locator(TRACE);
    await trace.scrollIntoViewIfNeeded();
    await page.emulateMedia({ media: "print" });
    await expect(trace).toBeVisible();
  });
});

test.describe("source trace without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("trace renders statically", async ({ page }) => {
    await page.goto("/en/security/");
    const trace = page.locator(TRACE);
    await trace.scrollIntoViewIfNeeded();
    await expect(trace).toBeVisible();
    await expect(trace.locator("[data-trace-step]")).toHaveCount(5);
  });
});
