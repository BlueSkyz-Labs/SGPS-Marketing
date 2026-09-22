import { expect, test } from "@playwright/test";
import { startFixtureServer } from "./helpers/parity-fixture";

/**
 * C3-B Task 2 (G4) — capability-bound product-to-proof affordance.
 *
 * The affordance is the only place a product surface may point at its own
 * public proof, so the guard measures the real component through the parity
 * fixture: proof appears only for the capability it is bound to, a capability
 * with no claim gets nothing, another product's claim is never borrowed,
 * private-reporting evidence never surfaces, every destination is public, each
 * item carries a canonical truth state, and the disclosure works with the
 * keyboard and without JavaScript.
 */
const PROOF = "[data-product-proof]";
const CAP_ONE = '[data-product-proof-capability="Fixture capability one"]';
const CAP_TWO = '[data-product-proof-capability="Fixture capability two"]';
const CAP_THREE = '[data-product-proof-capability="Fixture capability three"]';

test.describe("C3-B Product-to-Proof — fixture-backed", () => {
  let origin = "";
  let closeServer = () => Promise.resolve();

  test.beforeAll(async () => {
    const server = await startFixtureServer();
    origin = server.origin;
    closeServer = server.close;
  });

  test.afterAll(async () => {
    await closeServer();
  });

  // capability one resolves two public items (the private reference is
  // filtered); capability two resolves one, so the summary counts differ.
  for (const [route, summaryOne, summaryTwo, labelOne, labelTwo] of [
    [
      "/product-acts/",
      "See 2 public proof items",
      "See the public proof",
      "Evidence passport",
      "Reviewed artifact",
    ],
    [
      "/product-acts-vi/",
      "Xem 2 bằng chứng công khai",
      "Xem bằng chứng công khai",
      "Hồ sơ bằng chứng",
      "Tệp đã xem xét",
    ],
  ] as const) {
    test(`${route}: bound to its capability, localized, closed until asked`, async ({
      page,
    }) => {
      await page.goto(`${origin}${route}`);

      // One affordance per capability that actually publishes proof.
      await expect(page.locator(PROOF)).toHaveCount(2);
      const capOne = page.locator(CAP_ONE);
      const capTwo = page.locator(CAP_TWO);
      await expect(capOne).toHaveCount(1);
      await expect(capTwo).toHaveCount(1);
      await expect(capOne).not.toHaveAttribute("open", "");
      await expect(capOne.locator("summary")).toHaveText(summaryOne);
      await expect(capTwo.locator("summary")).toHaveText(summaryTwo);

      // Fail-closed: an authored capability with no claim gets no chrome.
      await expect(page.locator(CAP_THREE)).toHaveCount(0);

      const items = await capOne
        .locator(".c3-product-proof__item")
        .evaluateAll((nodes) =>
          nodes.map((node) => ({
            href: node.querySelector("a")?.getAttribute("href") ?? "",
            text: (node.querySelector("a")?.textContent ?? "").trim(),
            state: node
              .querySelector("[data-truth-state]")
              ?.getAttribute("data-truth-state"),
          })),
        );
      // Two public items resolve; the private-reporting reference is filtered.
      expect(items.length).toBe(2);
      for (const item of items) {
        expect(
          item.href.startsWith("/") || item.href.startsWith("https://"),
          `proof destination must be a public destination: ${item.href}`,
        ).toBe(true);
        expect(item.href).not.toContain("/internal/");
        expect(item.text.length).toBeGreaterThan(0);
        expect(
          [
            "source-linked",
            "reviewed",
            "changed",
            "not-published",
            "unavailable",
          ],
          `proof item must carry a canonical truth state: ${item.state}`,
        ).toContain(item.state);
      }
      await expect(capOne).toContainText(labelOne);
      await expect(capTwo).toContainText(labelTwo);
    });
  }

  test("a surface never borrows another product's or capability's proof", async ({
    page,
  }) => {
    await page.goto(`${origin}/product-acts/`);
    const hrefs = await page
      .locator(`${PROOF} a`)
      .evaluateAll((nodes) =>
        nodes.map((node) => node.getAttribute("href") ?? ""),
      );
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      expect(href).not.toContain("fixture-claim-secondary");
    }
    // The product-house cards publish no claims and therefore no affordance.
    await expect(
      page.locator("[data-product-house] [data-product-proof]"),
    ).toHaveCount(0);
  });

  test("the affordance is complete without JavaScript", async ({ browser }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(`${origin}/product-acts/`);
    await expect(page.locator(PROOF)).toHaveCount(2);
    await expect(
      page.locator(`${CAP_ONE} .c3-product-proof__item a`),
    ).toHaveCount(2);
    await context.close();
  });

  test("a keyboard visitor can open it", async ({ page }) => {
    await page.goto(`${origin}/product-acts/`);
    const proof = page.locator(CAP_ONE);
    await proof.locator("summary").focus();
    await expect(proof.locator("summary")).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(proof).toHaveAttribute("open", "");
    await expect(
      proof.locator(".c3-product-proof__item a").first(),
    ).toBeVisible();
  });

  test("mobile: stays inside the viewport and above the touch floor", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await page.goto(`${origin}/product-acts/`);
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(1);
    const summary = await page.locator(`${CAP_ONE} summary`).boundingBox();
    expect(summary?.height ?? 0).toBeGreaterThanOrEqual(44);
  });
});
