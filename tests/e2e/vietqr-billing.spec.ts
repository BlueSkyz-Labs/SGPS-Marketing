import { expect, test } from "@playwright/test";

test.describe("VietQR Billing Calculator on Sổ Trọ profile", () => {
  test.beforeEach(async ({ context, browserName }) => {
    // Clipboard permission grants are only supported by Chromium's CDP-backed
    // permissions API; Firefox/WebKit deny navigator.clipboard.writeText()
    // without a user gesture context Playwright cannot simulate, which is why
    // the calculator has a graceful manual-copy fallback (asserted below).
    if (browserName === "chromium") {
      await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    }
  });

  test("renders calculation interface and initial server-rendered QR on /vi/products/sotro/", async ({
    page,
  }) => {
    await page.goto("/vi/products/sotro/");

    const calculator = page.locator("[data-vietqr-calculator]");
    await expect(calculator).toBeVisible();

    // Verify initial calculation elements
    const total = calculator.locator("[data-total-amount]");
    await expect(total).toBeVisible();
    await expect(total).toContainText("3.970.000");

    // Verify initial server-rendered QR SVG exists without waiting for client JS
    const qrSvg = calculator.locator("[data-qr-container] svg");
    await expect(qrSvg).toBeVisible();
    await expect(qrSvg).toHaveAttribute("role", "img");

    // Verify raw payload display exists and conforms to EMVCo
    const payload = calculator.locator("[data-vietqr-payload]");
    await expect(payload).toBeVisible();
    const payloadText = await payload.innerText();
    expect(payloadText).toMatch(/^000201/);
    expect(payloadText).toMatch(/6304[0-9A-F]{4}$/);
  });

  test("dynamically recalculates total and updates QR payload upon input change", async ({
    page,
  }) => {
    await page.goto("/vi/products/sotro/");
    const calculator = page.locator("[data-vietqr-calculator]");

    // Change new electricity meter from 1520 to 1600 (diff: 150 kWh vs 70 kWh)
    const newElecInput = calculator.locator("[data-input-elec-new]");
    await newElecInput.fill("1600");
    await newElecInput.dispatchEvent("input");

    // Electricity increases by (150 - 70) * 3500 = 280,000 -> Total becomes 4,250,000
    const total = calculator.locator("[data-total-amount]");
    await expect(total).toContainText("4.250.000");

    // Verify payload updated with new amount
    const payload = calculator.locator("[data-vietqr-payload]");
    await expect(payload).toContainText("54074250000");
  });

  test("action buttons meet 44px ergonomic touch-target floor", async ({
    page,
  }) => {
    await page.goto("/vi/products/sotro/");
    const calculator = page.locator("[data-vietqr-calculator]");

    const buttons = calculator.locator("button");
    const count = await buttons.count();
    expect(count).toBeGreaterThanOrEqual(2);

    for (let i = 0; i < count; i++) {
      const box = await buttons.nth(i).boundingBox();
      expect(box).not.toBeNull();
      if (box) {
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
  });

  test("copy buttons trigger feedback state", async ({ page, browserName }) => {
    await page.goto("/vi/products/sotro/");
    const calculator = page.locator("[data-vietqr-calculator]");

    const copyZaloBtn = calculator.locator("[data-copy-zalo]");
    await copyZaloBtn.click();

    const feedback = calculator.locator("[data-copy-feedback]");
    await expect(feedback).toBeVisible();
    // Chromium grants clipboard-write above, so the success message renders;
    // engines that deny it without a real user gesture fall back to the
    // honest manual-copy instruction, which is also a valid feedback state.
    const expectedText =
      browserName === "chromium"
        ? /đã sao chép/i
        : /(đã sao chép|vui lòng sao chép)/i;
    await expect(feedback).toContainText(expectedText);
  });

  test("zero horizontal overflow at 320px mobile viewport", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await page.goto("/vi/products/sotro/");

    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );
    const clientWidth = await page.evaluate(
      () => document.documentElement.clientWidth,
    );
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });
});
