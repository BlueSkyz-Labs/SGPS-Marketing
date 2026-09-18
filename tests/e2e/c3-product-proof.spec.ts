import { expect, test } from "@playwright/test";
import { startFixtureServer } from "./helpers/parity-fixture";

test.describe("C3-B contextual Product-to-Proof", () => {
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

  test("real empty registry renders no proof chrome", async ({ page }) => {
    await page.goto("/en/");
    await expect(page.locator("[data-product-proof]")).toHaveCount(0);
  });

  test("fixture proof is keyboard reachable and links to a public passport", async ({
    page,
  }) => {
    await page.goto(origin + "/trust-continuum/");

    const emptyHost = page.locator("[data-empty-proof-host]");
    await expect(emptyHost.locator("[data-product-proof]")).toHaveCount(0);

    const proof = page.locator("[data-product-proof]").first();
    await expect(proof).toBeVisible();

    const link = proof.locator("[data-product-proof-link]");
    await expect(link).toHaveAttribute(
      "href",
      "/en/evidence/fixture-capability-proof/",
    );
    await link.focus();
    await expect(link).toBeFocused();

    const box = await link.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });
});
