// C2: discovery surfaces (Intent Lens, Atlas) moved off the homepage to the
// product index (design §8) — assertions retargeted, coverage preserved.
import { expect, test, type Page } from "@playwright/test";
import { openVerifyLayer } from "./verify-helpers.ts";

const instrument = async (page: Page) => {
  await page.evaluate(() => {
    const store = window as unknown as { __telemetry: unknown[] };
    store.__telemetry = [];
    document.addEventListener("blueskyz:telemetry", (event) => {
      store.__telemetry.push((event as CustomEvent).detail);
    });
    // Block navigation so telemetry emitted alongside link activation can be
    // asserted in the same document (navigation integration is covered by the
    // task-specific suites).
    document.addEventListener(
      "click",
      (event) => {
        if ((event.target as Element | null)?.closest("a")) {
          event.preventDefault();
        }
      },
      true,
    );
  });
};

const telemetry = (page: Page) =>
  page.evaluate(
    () =>
      (window as unknown as { __telemetry: Array<{ name: string }> })
        .__telemetry,
  );

test("command navigator open and result activation emit typed events", async ({
  page,
}) => {
  await page.goto("/en/products/");
  await instrument(page);
  await page.keyboard.press("Control+k");
  await expect
    .poll(async () => JSON.stringify(await telemetry(page)))
    .toContain('"command_navigator_opened"');
  await page.locator("[data-command-item] a").first().click();
  await expect
    .poll(async () => JSON.stringify(await telemetry(page)))
    .toContain('"command_result_opened"');
  const events = await telemetry(page);
  expect(
    events.some(
      (event) =>
        event.name === "command_result_opened" &&
        (event as { properties?: { kind?: string } }).properties?.kind ===
          "route",
    ),
  ).toBe(true);
});

test("atlas activations emit surface events", async ({ page }) => {
  // Experience v6 S1 removed the Trust Ledger from the home; its
  // `trust_route_opened` emission returns with the ledger on /verify (S3).
  // Atlas is the exploration tool, staged on /verify (Experience v6 S3).
  await openVerifyLayer(page, "/en/verify/", "atlas");
  await instrument(page);
  await page.locator("[data-atlas-node] a").first().click();
  await expect
    .poll(async () => JSON.stringify(await telemetry(page)))
    .toContain('"atlas_node_opened"');
});

test("trust ledger activations on /verify emit trust_route_opened", async ({
  page,
}) => {
  await page.goto("/en/verify/");
  await instrument(page);
  await page
    .locator(
      '[data-trust-ledger] [data-trust-surface="privacy"] details > summary',
    )
    .click();
  await page
    .locator('[data-trust-ledger] [data-trust-surface="privacy"] a')
    .first()
    .click();
  await expect
    .poll(async () => JSON.stringify(await telemetry(page)))
    .toContain('"trust_route_opened"');
});

test("journey activations emit journey_action_opened with destination", async ({
  page,
}) => {
  await page.goto("/en/about/");
  await instrument(page);
  await page.locator("[data-journey-bar] a").first().click();
  await expect
    .poll(async () => JSON.stringify(await telemetry(page)))
    .toContain('"journey_action_opened"');
  const events = await telemetry(page);
  expect(
    events.some(
      (event) =>
        (event as { properties?: { destination?: string } }).properties
          ?.destination === "products",
    ),
  ).toBe(true);
});

test("free-text search input never enters telemetry", async ({ page }) => {
  await page.goto("/en/products/");
  await instrument(page);
  await page.keyboard.press("Control+k");
  await page.locator("[data-command-input]").fill("supersecret-value");
  await page.waitForTimeout(300);
  const events = await telemetry(page);
  expect(JSON.stringify(events)).not.toContain("supersecret-value");
});

test("navigation succeeds even when a telemetry listener throws", async ({
  page,
}) => {
  // The journey bar on /en/about/ replaces the removed home Trust Ledger links.
  await page.goto("/en/about/");
  await page.evaluate(() => {
    document.addEventListener("blueskyz:telemetry", () => {
      throw new Error("analytics unavailable");
    });
  });
  await page.locator("[data-journey-bar] a").first().click();
  await page.waitForURL("**/en/products/");
});
