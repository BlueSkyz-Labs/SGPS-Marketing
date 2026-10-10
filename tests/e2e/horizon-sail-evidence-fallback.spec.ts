import { expect, test } from "@playwright/test";

const ID = "security-reporting-is-private";
const EN = `/en/evidence/${ID}/`;

/**
 * Horizon/Sail W3: enhanced trust UI must never make the source or boundary
 * disappear when its client-only graph is invalid. The server HTML is truth.
 */
test("malformed client evidence graph fails closed to static sources and boundary", async ({
  page,
}) => {
  await page.route(`**${EN}`, async (route) => {
    const response = await route.fetch();
    const body = await response.text();
    const graph = /(<script\b[^>]*data-evidence-graph[^>]*>)[\s\S]*?(<\/script>)/;
    if (!graph.test(body)) {
      throw new Error("Expected a rendered evidence graph for negative test");
    }
    await route.fulfill({
      response,
      body: body.replace(graph, "$1{not valid JSON$2"),
    });
  });

  await page.goto(EN);
  const passport = page.locator(`[data-evidence-passport="${ID}"]`);
  await expect(passport).toBeVisible();
  await expect(passport).not.toHaveAttribute("data-explorer-active", "true");
  await expect(passport.locator("[data-evidence-chain]")).toBeHidden();
  const sources = passport.locator(":scope > [data-evidence-static-sources]");
  await expect(sources).toBeVisible();
  await expect(
    sources.getByRole("link", { name: /GitHub private vulnerability reporting/i }),
  ).toBeVisible();
  await expect(
    passport.locator(
      ":scope > [data-evidence-static-boundary] [data-boundary-card]",
    ),
  ).toBeVisible();
});

test("traditional Chinese passport retains source and boundary with no JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto(`/zh-hant/evidence/${ID}/`);
    await expect(page.locator("html")).toHaveAttribute("lang", "zh-Hant");
    const passport = page.locator(`[data-evidence-passport="${ID}"]`);
    await expect(passport).toBeVisible();
    await expect(passport.locator("[data-evidence-chain]")).toBeHidden();
    await expect(
      passport.locator(":scope > [data-evidence-static-sources] a").first(),
    ).toBeVisible();
    await expect(
      passport.locator(
        ":scope > [data-evidence-static-boundary] [data-boundary-card]",
      ),
    ).toBeVisible();
  } finally {
    await context.close();
  }
});
