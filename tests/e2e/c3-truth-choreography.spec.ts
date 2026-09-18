import { expect, test } from "@playwright/test";
import { startFixtureServer } from "./helpers/parity-fixture";

test.describe("C3-B truth-state choreography", () => {
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

  test("text remains authoritative in forced colors", async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active" });
    await page.goto(origin + "/trust-continuum/");

    const state = page.locator("[data-truth-state]").first();
    const label = state.locator(".truth-state__label");
    await expect(label).toHaveText("Source-linked");
    await expect(state).toHaveAttribute("data-truth-presentation", "source");
  });

  test("reduced motion removes truth-state transitions", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(origin + "/trust-continuum/");

    const state = page.locator("[data-truth-state]").first();
    const duration = await state.evaluate(
      (element) => getComputedStyle(element).transitionDuration,
    );
    const hasMotion = duration
      .split(",")
      .some((value) => parseFloat(value) > 0);
    expect(hasMotion).toBe(false);
  });
});
