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

test("intent lens renders four unselected native buttons on /en/", async ({
  page,
}) => {
  await page.goto("/en/");
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
  await page.goto("/en/");
  await waitForLensHydration(page);
  const trustSection = page.locator("section:has(#trust-title)");
  const before = await trustSection.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );

  await page
    .locator("[data-intent-lens]")
    .getByRole("button", { name: "Verify trust" })
    .click();

  await expect(page.locator("html")).toHaveAttribute(
    "data-intent",
    "verify-trust",
  );
  await expect
    .poll(
      () =>
        trustSection.evaluate(
          (element) => getComputedStyle(element).backgroundColor,
        ),
      { message: "trust section background must reflect intent emphasis" },
    )
    .not.toBe(before);

  // Facts stay available in the DOM.
  await expect(page.locator("#trust-title")).toBeVisible();
  await expect(page.locator("[data-trust-ledger]")).toBeVisible();
  await expect(
    page.locator("[data-trust-ledger]").getByRole("listitem"),
  ).toHaveCount(3);
});

test("evaluate-product intent emphasizes the products next step", async ({
  page,
}) => {
  await page.goto("/en/");
  await waitForLensHydration(page);
  const journeyProducts = page.locator(
    '[data-journey-bar] a[href$="/products/"]',
  );
  const before = await journeyProducts.evaluate(
    (element) => getComputedStyle(element).borderColor,
  );
  await page
    .locator("[data-intent-lens]")
    .getByRole("button", { name: "Evaluate a product" })
    .click();
  await expect
    .poll(
      () =>
        journeyProducts.evaluate(
          (element) => getComputedStyle(element).borderColor,
        ),
      { message: "journey products link border must reflect intent emphasis" },
    )
    .not.toBe(before);
});

test("intent selection is single-select and toggles off", async ({ page }) => {
  await page.goto("/en/");
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
  await page.goto("/en/");
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
  await page.goto("/en/");
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
  await expect(page.locator("[data-trust-ledger]")).toBeVisible();
  await expect(page.locator("[data-principle-matrix]")).toBeVisible();
  await context.close();
});

test("intent lens is localized and functional on /vi/", async ({ page }) => {
  await page.goto("/vi/");
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
