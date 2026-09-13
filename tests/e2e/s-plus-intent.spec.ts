// C2: discovery surfaces (Intent Lens, Atlas) moved off the homepage to the
// product index (design §8) — assertions retargeted, coverage preserved.
import { expect, test, type Page } from "@playwright/test";

const waitForLensHydration = async (page: Page) => {
  // The lens script is external (CSP script-src 'self'); wait for its
  // idempotent-init marker so clicks never race script hydration.
  await expect(page.locator("[data-intent-lens]")).toHaveAttribute(
    "data-intent-lens-ready",
    "",
  );
};

const EN_INTENTS = [
  "Evaluate a product",
  "Understand BlueSkyz",
  "Verify trust",
  "Work with us",
];
const VI_INTENTS = [
  "Đánh giá sản phẩm",
  "Tìm hiểu BlueSkyz",
  "Kiểm chứng tin cậy",
  "Làm việc cùng chúng tôi",
];

test("intent lens renders four unselected native buttons on /en/products/", async ({
  page,
}) => {
  await page.goto("/en/products/");
  const lens = page.locator("[data-intent-lens]");
  await expect(lens).toBeVisible();
  await expect(lens.getByRole("button")).toHaveCount(4);
  for (const label of EN_INTENTS) {
    await expect(lens.getByRole("button", { name: label })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  }
});

test("selecting an intent emphasizes without hiding facts", async ({
  page,
}) => {
  await page.goto("/en/products/");
  await waitForLensHydration(page);

  // The contract the page itself declares — the test never hardcodes it.
  // Mission state may only mark steps that are BOTH declared evidence steps
  // and present on this route; everything else must stay untouched.
  const bar = page.locator("[data-journey-bar]");
  const evidenceKeys = JSON.parse(
    (await bar.getAttribute("data-mission-evidence")) ?? "{}",
  )["verify-trust"];
  expect(Array.isArray(evidenceKeys)).toBe(true);
  expect(evidenceKeys.length).toBeGreaterThan(0);

  const steps = page.locator("[data-journey-bar] li[data-step-key]");
  const stepsBefore = await steps.count();
  expect(stepsBefore).toBeGreaterThan(0);
  const keysBefore = await steps.evaluateAll((items) =>
    items.map((item) => item.getAttribute("data-step-key") ?? ""),
  );
  const expectedMarked = evidenceKeys.filter((key) => keysBefore.includes(key));
  expect(expectedMarked.length).toBeGreaterThan(0);

  await page
    .locator("[data-intent-lens]")
    .getByRole("button", { name: "Verify trust" })
    .click();

  await expect(page.locator("html")).toHaveAttribute(
    "data-intent",
    "verify-trust",
  );

  // Only declared, present evidence steps may be marked.
  await expect
    .poll(
      async () =>
        bar.evaluate((element) =>
          Array.from(element.querySelectorAll("li[data-evidence-first]")).map(
            (item) => item.getAttribute("data-step-key") ?? "",
          ),
        ),
      { message: "declared evidence-first steps must be marked" },
    )
    .toEqual(expectedMarked);

  // Emphasis must be observable, not just an attribute: the marked step's link
  // is styled differently from an unmarked one.
  const styles = await bar.evaluate((element) => {
    const links = Array.from(
      element.querySelectorAll<HTMLAnchorElement>("li[data-step-key] a"),
    );
    return links.map((link) => {
      const computed = getComputedStyle(link);
      return {
        marked:
          link.closest("li")?.getAttribute("data-evidence-first") === "true",
        style: `${computed.borderTopColor}|${computed.boxShadow}`,
      };
    });
  });
  const markedStyles = new Set(
    styles.filter((entry) => entry.marked).map((entry) => entry.style),
  );
  const plainStyles = new Set(
    styles.filter((entry) => !entry.marked).map((entry) => entry.style),
  );
  expect(markedStyles.size).toBeGreaterThan(0);
  for (const style of markedStyles) {
    expect(plainStyles.has(style)).toBe(false);
  }

  // Facts stay available: no step is hidden, every link keeps its target.
  await expect(steps).toHaveCount(stepsBefore);
  const links = page.locator("[data-journey-bar] li[data-step-key] a");
  await expect(links).toHaveCount(stepsBefore);
  for (const href of await links.evaluateAll((anchors) =>
    anchors.map((anchor) => anchor.getAttribute("href") ?? ""),
  )) {
    expect(href.startsWith("/")).toBe(true);
  }
});

test("evaluate-product intent emphasizes its own declared steps", async ({
  page,
}) => {
  await page.goto("/en/products/");
  await waitForLensHydration(page);
  const bar = page.locator("[data-journey-bar]");
  const evidenceKeys = JSON.parse(
    (await bar.getAttribute("data-mission-evidence")) ?? "{}",
  )["evaluate-product"];
  expect(Array.isArray(evidenceKeys)).toBe(true);
  expect(evidenceKeys.length).toBeGreaterThan(0);

  const before = await bar.evaluate((element) =>
    Array.from(element.querySelectorAll("li[data-step-key]")).map(
      (item) => item.getAttribute("data-step-key") ?? "",
    ),
  );
  const expectedMarked = evidenceKeys.filter((key) => before.includes(key));
  expect(expectedMarked.length).toBeGreaterThan(0);

  await page
    .locator("[data-intent-lens]")
    .getByRole("button", { name: "Evaluate a product" })
    .click();

  await expect(page.locator("html")).toHaveAttribute(
    "data-intent",
    "evaluate-product",
  );

  // Only the mission's declared, present evidence steps are marked.
  await expect
    .poll(
      async () =>
        bar.evaluate((element) =>
          Array.from(element.querySelectorAll("li[data-evidence-first]")).map(
            (item) => item.getAttribute("data-step-key") ?? "",
          ),
        ),
      { message: "evaluate-product emphasis must match its declared steps" },
    )
    .toEqual(expectedMarked);

  // Ordering may change; the available steps may not disappear.
  await expect(bar.locator("li[data-step-key]")).toHaveCount(before.length);
});

test("intent selection is single-select and toggles off", async ({ page }) => {
  await page.goto("/en/products/");
  await waitForLensHydration(page);
  const lens = page.locator("[data-intent-lens]");
  const verify = lens.getByRole("button", { name: "Verify trust" });
  const understand = lens.getByRole("button", {
    name: "Understand BlueSkyz",
  });

  await verify.click();
  await expect(verify).toHaveAttribute("aria-pressed", "true");

  await understand.click();
  await expect(understand).toHaveAttribute("aria-pressed", "true");
  await expect(verify).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator("html")).toHaveAttribute(
    "data-intent",
    "understand-blueskyz",
  );

  await understand.click();
  await expect(understand).toHaveAttribute("aria-pressed", "false");
  expect(await page.locator("html").getAttribute("data-intent")).toBeNull();
});

test("intent interaction writes no cookies or storage", async ({ page }) => {
  await page.goto("/en/products/");
  await waitForLensHydration(page);
  const lens = page.locator("[data-intent-lens]");
  await lens.getByRole("button", { name: "Verify trust" }).click();
  await lens.getByRole("button", { name: "Work with us" }).click();
  const state = await page.evaluate(() => ({
    cookie: document.cookie,
    local: localStorage.length,
    session: sessionStorage.length,
  }));
  expect(state.cookie).toBe("");
  expect(state.local).toBe(0);
  expect(state.session).toBe(0);
});

test("complete critical content without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();

  // Product discovery surface: the lens is server-rendered and actionable,
  // the exploration tool and the honest registry statement are present.
  await page.goto("/en/products/");
  const lens = page.locator("[data-intent-lens]");
  await expect(lens).toBeVisible();
  await expect(lens.getByRole("button")).toHaveCount(4);
  for (const label of EN_INTENTS) {
    await expect(lens.getByRole("button", { name: label })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  }
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("[data-atlas]")).toBeVisible();
  await expect(page.locator("[data-journey-bar] a").first()).toBeVisible();

  // Homepage narrative surface: every act is readable without scripting.
  await page.goto("/en/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("[data-product-house]")).toBeVisible();
  await expect(page.locator("[data-journey-bar] a").first()).toBeVisible();
  await context.close();
});

test("intent lens is localized and functional on /vi/products/", async ({
  page,
}) => {
  await page.goto("/vi/products/");
  await waitForLensHydration(page);
  const lens = page.locator("[data-intent-lens]");
  await expect(lens).toBeVisible();
  for (const label of VI_INTENTS) {
    await expect(lens.getByRole("button", { name: label })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  }
  await lens.getByRole("button", { name: "Kiểm chứng tin cậy" }).click();
  await expect(page.locator("html")).toHaveAttribute(
    "data-intent",
    "verify-trust",
  );
});
