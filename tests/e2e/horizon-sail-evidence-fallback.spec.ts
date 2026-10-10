import { expect, test } from "@playwright/test";

const ID = "security-reporting-is-private";
const EN = `/en/evidence/${ID}/`;

/** W3: bad client graph never hides the complete server passport. */
test("malformed graph preserves static proof", async ({ page }) => {
  await page.route(`**${EN}`, async (route) => {
    const response = await route.fetch();
    const body = await response.text();
    const graph =
      /(<script\b[^>]*data-evidence-graph[^>]*>)[\s\S]*?(<\/script>)/;
    if (!graph.test(body)) {
      throw new Error("No evidence graph found in HTML");
    }
    await route.fulfill({
      response,
      body: body.replace(graph, "$1{invalid JSON$2"),
    });
  });

  await page.goto(EN);
  const passport = page.locator(`[data-evidence-passport="${ID}"]`);
  const sources = passport.locator("[data-evidence-static-sources]");
  const boundary = passport.locator("[data-evidence-static-boundary]");

  await expect(passport).toBeVisible();
  await expect(passport).not.toHaveAttribute("data-explorer-active", "true");
  await expect(passport.locator("[data-evidence-chain]")).toBeHidden();
  await expect(sources).toBeVisible();
  await expect(sources.getByRole("link").first()).toBeVisible();
  await expect(boundary).toBeVisible();
});

/** W3: zh-Hant public proof is HTML-first and works without JS. */
test("zh-Hant static proof survives no-JS", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(`/zh-hant/evidence/${ID}/`);
    await expect(page.locator("html")).toHaveAttribute("lang", "zh-Hant");

    const passport = page.locator(`[data-evidence-passport="${ID}"]`);
    const sources = passport.locator("[data-evidence-static-sources]");
    const boundary = passport.locator("[data-evidence-static-boundary]");

    await expect(passport).toBeVisible();
    await expect(passport.locator("[data-evidence-chain]")).toBeHidden();
    await expect(sources.getByRole("link").first()).toBeVisible();
    await expect(boundary).toBeVisible();
  } finally {
    await context.close();
  }
});
