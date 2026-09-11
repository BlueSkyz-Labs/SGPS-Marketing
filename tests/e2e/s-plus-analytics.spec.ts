import { expect, test, type Page } from "@playwright/test";

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

test("intent selection emits a validated intent_selected event", async ({
  page,
}) => {
  await page.goto("/en/");
  await page.locator("[data-intent-lens]").waitFor();
  await instrument(page);
  await page
    .locator("[data-intent-lens]")
    .getByRole("button", { name: "Verify trust" })
    .click();
  await expect
    .poll(async () => JSON.stringify(await telemetry(page)))
    .toContain('"intent_selected"');
  const events = await telemetry(page);
  expect(events[0]).toMatchObject({
    name: "intent_selected",
    properties: { intent: "verify-trust" },
  });
});

test("command navigator open and result activation emit typed events", async ({
  page,
}) => {
  await page.goto("/en/");
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

test("trust, journey, and atlas activations emit surface events", async ({
  page,
}) => {
  await page.goto("/en/");
  await instrument(page);
  await page.locator("[data-trust-ledger] a").first().click();
  await page.locator("[data-atlas-node] a").first().click();
  await expect
    .poll(async () => JSON.stringify(await telemetry(page)))
    .toContain('"trust_route_opened"');
  const events = await telemetry(page);
  expect(
    events.some(
      (event) =>
        event.name === "trust_route_opened" &&
        (event as { properties?: { surface?: string } }).properties?.surface ===
          "privacy",
    ),
  ).toBe(true);
  expect(events.some((event) => event.name === "atlas_node_opened")).toBe(true);
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
  await page.goto("/en/");
  await instrument(page);
  await page.keyboard.press("Control+k");
  await page.locator("[data-command-input]").fill("supersecret-value");
  await page.waitForTimeout(300);
  const events = await telemetry(page);
  expect(JSON.stringify(events)).not.toContain("supersecret-value");
});

test("duplicate events inside the dedupe window collapse", async ({ page }) => {
  await page.goto("/en/");
  await page.locator("[data-intent-lens]").waitFor();
  await instrument(page);
  const verify = page
    .locator("[data-intent-lens]")
    .getByRole("button", { name: "Verify trust" });
  await verify.click();
  await verify.click();
  await verify.click();
  const events = (await telemetry(page)).filter(
    (event) => event.name === "intent_selected",
  );
  expect(events).toHaveLength(1);
});

test("navigation succeeds even when a telemetry listener throws", async ({
  page,
}) => {
  await page.goto("/en/");
  await page.evaluate(() => {
    document.addEventListener("blueskyz:telemetry", () => {
      throw new Error("analytics unavailable");
    });
  });
  await page.locator("[data-trust-ledger] a").first().click();
  await page.waitForURL("**/en/privacy/");
});
