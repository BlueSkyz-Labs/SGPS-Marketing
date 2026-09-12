import { expect, test } from "@playwright/test";

const EN = {
  establishes: "What this establishes",
  notEstablishes: "What this does not establish",
};
const VI = {
  establishes: "Điều được xác lập",
  notEstablishes: "Điều không được xác lập",
};

test.describe("boundary cards on trust routes", () => {
  for (const [route, labels] of [
    ["/en/security/", EN],
    ["/en/privacy/", EN],
    ["/vi/security/", VI],
    ["/vi/privacy/", VI],
  ] as const) {
    test(`${route} shows both boundary concepts`, async ({ page }) => {
      await page.goto(route);
      const card = page.locator("[data-boundary-card]");
      await expect(card).toBeVisible();
      await expect(
        card.getByRole("heading", { level: 3, name: labels.establishes }),
      ).toBeVisible();
      await expect(
        card.getByRole("heading", { level: 3, name: labels.notEstablishes }),
      ).toBeVisible();
    });
  }

  test("reading order is establishes before does-not-establish", async ({
    page,
  }) => {
    await page.goto("/en/security/");
    const headings = await page
      .locator("[data-boundary-card] h3")
      .allTextContents();
    expect(headings[0]).toBe(EN.establishes);
    expect(headings[1]).toBe(EN.notEstablishes);
  });

  test("boundary copy avoids unsupported assurance wording", async ({
    page,
  }) => {
    for (const route of ["/en/security/", "/en/privacy/"]) {
      await page.goto(route);
      const text = await page.locator("[data-boundary-card]").innerText();
      expect(text).not.toMatch(/certified|guaranteed|trust score|score/i);
    }
  });

  test("320px keeps the boundary card readable", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto("/vi/security/");
    await expect(page.locator("[data-boundary-card]")).toBeVisible();
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    );
    expect(overflow).toBe(false);
  });
});

test.describe("boundary cards without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("privacy boundary renders statically", async ({ page }) => {
    await page.goto("/en/privacy/");
    await expect(
      page.getByRole("heading", { level: 3, name: EN.notEstablishes }),
    ).toBeVisible();
  });
});
