// v8 W4: the visitor-facing intent chips are gone from the product index; the
// declared mission contract on the journey bar is still pinned here.
// Mission state may reorder or emphasize
// steps that are DECLARED and PRESENT on the route — never hide, never invent.
//
// The expectations are computed with an independent implementation of that
// documented rule, against the mission data the page itself declares, so the
// spec catches drift in the shipped script without pinning a stale copy of
// src/data/experience.ts.
import { expect, test, type Page } from "@playwright/test";

const MISSION_IDS = [
  "explore-products",
  "evaluate-product",
  "understand-architecture",
  "verify-trust",
  "work-with-us",
] as const;

type Contract = {
  orders: Record<string, string[]>;
  evidence: Record<string, string[]>;
  serverOrder: string[];
};

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

const readContract = async (page: Page): Promise<Contract> => {
  const bar = page.locator("[data-journey-bar]");
  const orders = JSON.parse(
    (await bar.getAttribute("data-mission-orders")) ?? "{}",
  ) as Record<string, string[]>;
  const evidence = JSON.parse(
    (await bar.getAttribute("data-mission-evidence")) ?? "{}",
  ) as Record<string, string[]>;
  return { orders, evidence, serverOrder: await stepKeys(page) };
};

/** Declared-first (in declared order), then the rest in server order. */
test.describe("mission paths", () => {
  test("without JavaScript the complete server order remains", async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.goto("/en/products/");
    const serverOrder = await stepKeys(page);
    expect(serverOrder.length).toBeGreaterThan(0);
    await expect(page.locator("[data-journey-bar] li a")).toHaveCount(
      serverOrder.length,
    );
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

  test("the page declares exactly the authored mission contract", async ({
    page,
  }) => {
    // Pinned from src/data/experience.ts MISSIONS (deliberate update point):
    // if the authored missions change, this must be updated by hand.
    const AUTHORED_ORDERS: Record<string, string[]> = {
      "explore-products": ["products", "architecture", "about", "contact"],
      "evaluate-product": ["decision-room", "products", "about", "contact"],
      "understand-architecture": [
        "architecture",
        "about",
        "security",
        "products",
      ],
      "verify-trust": ["security", "privacy", "decision-room", "support"],
      "work-with-us": ["contact", "support", "about", "security"],
    };
    const AUTHORED_EVIDENCE: Record<string, string[]> = {
      "evaluate-product": ["decision-room", "products"],
      "verify-trust": ["security", "privacy", "decision-room"],
      "work-with-us": ["security"],
    };

    await page.goto("/en/products/");
    const contract = await readContract(page);
    expect(contract.orders).toEqual(AUTHORED_ORDERS);
    expect(contract.evidence).toEqual(AUTHORED_EVIDENCE);
  });

  test("mission step definitions all resolve to live routes", async ({
    page,
  }) => {
    await page.goto("/en/products/");
    const contract = await readContract(page);
    expect(Object.keys(contract.orders).sort()).toEqual(
      [...MISSION_IDS].sort(),
    );
    // Every declared step is a real public route (locale-stripped segment).
    for (const [missionId, keys] of Object.entries(contract.orders)) {
      expect(keys.length, `${missionId} declares steps`).toBeGreaterThan(0);
      for (const key of keys) {
        const response = await page.request.get(`/en/${key}/`);
        expect(response.status(), `/en/${key}/ must resolve`).toBeLessThan(400);
      }
    }
  });
});
