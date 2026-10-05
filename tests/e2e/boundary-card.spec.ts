import { expect, test } from "@playwright/test";

const EN = {
  establishes: "What this covers",
  notEstablishes: "What this does not cover",
};
const VI = {
  establishes: "Phạm vi áp dụng",
  notEstablishes: "Ngoài phạm vi",
};

test.describe("boundary cards on evidence pages", () => {
  for (const [route, labels] of [
    ["/en/evidence/security-reporting-is-private/", EN],
    ["/en/evidence/privacy-no-tracking-on-this-site/", EN],
    ["/vi/evidence/security-reporting-is-private/", VI],
    ["/vi/evidence/privacy-no-tracking-on-this-site/", VI],
  ] as const) {
    test(`${route} shows both boundary concepts`, async ({ page }) => {
      await page.goto(route);
      const card = page.locator("[data-boundary-card]");
      await expect(card).toBeVisible();
      await expect(
        card.getByRole("heading", { level: 2, name: labels.establishes }),
      ).toBeVisible();
      await expect(
        card.getByRole("heading", { level: 2, name: labels.notEstablishes }),
      ).toBeVisible();
    });
  }

  test("reading order is establishes before does-not-establish", async ({
    page,
  }) => {
    await page.goto("/en/evidence/security-reporting-is-private/");
    const headings = await page
      .locator("[data-boundary-card] h2")
      .allTextContents();
    expect(headings[0]).toBe(EN.establishes);
    expect(headings[1]).toBe(EN.notEstablishes);
  });

  test("boundary copy avoids unsupported assurance wording", async ({
    page,
  }) => {
    for (const route of [
      "/en/evidence/security-reporting-is-private/",
      "/en/evidence/privacy-no-tracking-on-this-site/",
    ]) {
      await page.goto(route);
      const text = await page.locator("[data-boundary-card]").innerText();
      expect(text).not.toMatch(/certified|guaranteed|trust score|score/i);
    }
  });

  test("320px keeps the boundary card readable", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 900 });
    await page.goto("/vi/evidence/security-reporting-is-private/");
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
    await page.goto("/en/evidence/privacy-no-tracking-on-this-site/");
    await expect(
      page.getByRole("heading", { level: 2, name: EN.notEstablishes }),
    ).toBeVisible();
  });
});
