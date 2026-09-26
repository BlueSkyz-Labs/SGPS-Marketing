// C2: the Intent Lens moved off the homepage to the product index (design §8),
// so mission-path assertions run on the surface that hosts the lens. The
// mission contract itself is unchanged: mission state may reorder or emphasize
// steps that are DECLARED and PRESENT on the route — never hide, never invent.
//
// The expectations are computed with an independent implementation of that
// documented rule, against the mission data the page itself declares, so the
// spec catches drift in the shipped script without pinning a stale copy of
// src/data/experience.ts.
import { expect, test, type Page } from "@playwright/test";

const MISSION_LABELS = [
  "Explore products",
  "Evaluate a product",
  "Understand architecture",
  "Verify trust",
  "Work with us",
] as const;

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
const expectedOrder = (contract: Contract, missionId: string): string[] => {
  const declared = (contract.orders[missionId] ?? []).filter((key) =>
    contract.serverOrder.includes(key),
  );
  const rest = contract.serverOrder.filter((key) => !declared.includes(key));
  return [...declared, ...rest];
};

const expectedEvidence = (contract: Contract, missionId: string): string[] =>
  (contract.evidence[missionId] ?? []).filter((key) =>
    contract.serverOrder.includes(key),
  );

const waitForIntentHydration = async (page: Page) => {
  await expect(page.locator("[data-intent-control]")).toHaveAttribute(
    "data-intent-control-ready",
    "",
  );
};

const clickMission = async (page: Page, label: string) => {
  await page
    .locator("[data-intent-control]")
    .getByRole("button", { name: label })
    .click();
};

test.describe("mission paths", () => {
  for (const [index, label] of MISSION_LABELS.entries()) {
    const missionId = MISSION_IDS[index];
    test(`EN mission "${label}" reorders without hiding steps`, async ({
      page,
    }) => {
      await page.goto("/en/products/");
      await waitForIntentHydration(page);
      await clickMission(page, "Explore products");
      await expect(page.locator("html")).not.toHaveAttribute("data-intent");
      const contract = await readContract(page);

      // The declared contract is real and covers every mission.
      expect(Object.keys(contract.orders).sort()).toEqual(
        [...MISSION_IDS].sort(),
      );
      expect(contract.serverOrder.length).toBeGreaterThan(0);

      await clickMission(page, label);
      await expect(page.locator("html")).toHaveAttribute(
        "data-intent",
        missionId,
      );

      expect(await stepKeys(page)).toEqual(expectedOrder(contract, missionId));
      expect(await evidenceKeys(page)).toEqual(
        expectedEvidence(contract, missionId),
      );

      // Never hidden: every server step stays present and visible.
      const links = page.locator("[data-journey-bar] li a");
      await expect(links).toHaveCount(contract.serverOrder.length);
      for (let i = 0; i < contract.serverOrder.length; i += 1) {
        await expect(links.nth(i)).toBeVisible();
      }
      // Not even off-screen: the step list is not visually truncated.
      await expect(page.locator("[data-journey-bar] li[hidden]")).toHaveCount(
        0,
      );

      // Toggle off restores the server order exactly.
      await clickMission(page, label);
      expect(await stepKeys(page)).toEqual(contract.serverOrder);
      expect(await evidenceKeys(page)).toEqual([]);
    });
  }

  test("VI mission paths reorder deterministically", async ({ page }) => {
    await page.goto("/vi/products/");
    await waitForIntentHydration(page);
    const contract = await readContract(page);
    await page
      .locator("[data-intent-control]")
      .getByRole("button", { name: "Kiểm chứng tin cậy" })
      .click();
    expect(await stepKeys(page)).toEqual(
      expectedOrder(contract, "verify-trust"),
    );
    expect(await evidenceKeys(page)).toEqual(
      expectedEvidence(contract, "verify-trust"),
    );
  });

  test("mission selection writes no cookies or storage", async ({ page }) => {
    await page.goto("/en/products/");
    await waitForIntentHydration(page);
    for (const label of MISSION_LABELS) {
      await clickMission(page, label);
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
