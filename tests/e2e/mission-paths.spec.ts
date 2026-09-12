import { expect, test, type Page } from "@playwright/test";

const SERVER_ORDER = ["products", "decision-room", "about", "security"];

const MISSIONS = [
  {
    label: "Evaluate a product",
    order: ["decision-room", "products", "about", "security"],
    evidence: ["decision-room", "products"],
  },
  {
    label: "Understand BlueSkyz",
    order: ["about", "products", "decision-room", "security"],
    evidence: [],
  },
  {
    label: "Verify trust",
    order: ["security", "decision-room", "products", "about"],
    evidence: ["security", "decision-room"],
  },
  {
    label: "Work with us",
    order: ["about", "security", "products", "decision-room"],
    evidence: ["security"],
  },
] as const;

const stepKeys = async (page: Page): Promise<string[]> =>
  page
    .locator("[data-journey-bar] li[data-step-key]")
    .evaluateAll((items) =>
      items.map((item) => item.getAttribute("data-step-key") ?? ""),
    );

const evidenceKeys = async (page: Page): Promise<string[]> =>
  page
    .locator('[data-journey-bar] li[data-evidence-first="true"]')
    .evaluateAll((items) =>
      items.map((item) => item.getAttribute("data-step-key") ?? ""),
    );

const waitForLensHydration = async (page: Page) => {
  await expect(page.locator("[data-intent-lens]")).toHaveAttribute(
    "data-intent-lens-ready",
    "",
  );
};

test.describe("mission paths", () => {
  for (const mission of MISSIONS) {
    test(`EN mission "${mission.label}" reorders without hiding steps`, async ({
      page,
    }) => {
      await page.goto("/en/");
      await waitForLensHydration(page);
      expect(await stepKeys(page)).toEqual(SERVER_ORDER);

      await page
        .locator("[data-intent-lens]")
        .getByRole("button", { name: mission.label })
        .click();

      expect(await stepKeys(page)).toEqual(mission.order);
      expect(await evidenceKeys(page)).toEqual(mission.evidence);
      // Never hidden: the same four steps stay present and visible.
      const links = page.locator("[data-journey-bar] li a");
      await expect(links).toHaveCount(4);
      for (let index = 0; index < 4; index += 1) {
        await expect(links.nth(index)).toBeVisible();
      }

      // Toggle off restores the server order exactly.
      await page
        .locator("[data-intent-lens]")
        .getByRole("button", { name: mission.label })
        .click();
      expect(await stepKeys(page)).toEqual(SERVER_ORDER);
      expect(await evidenceKeys(page)).toEqual([]);
    });
  }

  test("VI mission paths reorder deterministically", async ({ page }) => {
    await page.goto("/vi/");
    await waitForLensHydration(page);
    await page
      .locator("[data-intent-lens]")
      .getByRole("button", { name: "Kiểm chứng tin cậy" })
      .click();
    expect(await stepKeys(page)).toEqual([
      "security",
      "decision-room",
      "products",
      "about",
    ]);
  });

  test("mission selection writes no cookies or storage", async ({ page }) => {
    await page.goto("/en/");
    await waitForLensHydration(page);
    const lens = page.locator("[data-intent-lens]");
    for (const mission of MISSIONS) {
      await lens.getByRole("button", { name: mission.label }).click();
    }
    const state = await page.evaluate(() => ({
      cookie: document.cookie,
      local: localStorage.length,
      session: sessionStorage.length,
    }));
    expect(state.cookie).toBe("");
    expect(state.local).toBe(0);
    expect(state.session).toBe(0);
  });

  test("without JavaScript the complete server order remains", async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/en/");
    expect(await stepKeys(page)).toEqual(SERVER_ORDER);
    await expect(page.locator("[data-journey-bar] li a")).toHaveCount(4);
    await context.close();
  });

  test("subpage keeps a complete, stable next-steps list", async ({ page }) => {
    await page.goto("/en/about/");
    const keys = await stepKeys(page);
    expect(keys).toEqual(["products", "contact"]);
    await expect(page.locator("[data-journey-bar] li a")).toHaveCount(2);
    // No mission state leaks into an unselected subpage.
    expect(await evidenceKeys(page)).toEqual([]);
    const order = await page
      .locator("[data-journey-bar]")
      .getAttribute("data-mission-orders");
    expect(order).toBeTruthy();
  });

  test("mission step definitions all resolve to live routes", async ({
    page,
  }) => {
    await page.goto("/en/");
    const raw = await page
      .locator("[data-journey-bar]")
      .getAttribute("data-mission-orders");
    const orders = JSON.parse(raw ?? "{}") as Record<string, string[]>;
    expect(Object.keys(orders).sort()).toEqual([
      "evaluate-product",
      "understand-blueskyz",
      "verify-trust",
      "work-with-us",
    ]);
  });
});
