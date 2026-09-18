import { expect, test } from "@playwright/test";
import { startFixtureServer } from "./helpers/parity-fixture";

test.describe("C3-B Evidence Peek", () => {
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

  test("native disclosure works by keyboard without custom JavaScript", async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto(origin + "/trust-continuum/");

    const details = page.locator("[data-evidence-peek]").first();
    await expect(details).not.toHaveAttribute("open", /.*/);

    const summary = details.locator("summary");
    await summary.focus();
    await page.keyboard.press("Enter");
    await expect(details).toHaveAttribute("open", /.*/);

    await expect(details.locator("[data-evidence-peek-source]")).toHaveAttribute(
      "href",
      "/en/products/",
    );
    await expect(details.locator("[data-evidence-boundary]")).toContainText(
      "does not establish",
    );
    await context.close();
  });
});
