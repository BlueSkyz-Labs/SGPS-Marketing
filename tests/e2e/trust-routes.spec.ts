import { expect, test } from "@playwright/test";

const TRUST_ROUTES = [
  "/about/",
  "/contact/",
  "/support/",
  "/privacy/",
  "/security/",
] as const;

const BANNED = [
  /global offices/i,
  /bank-grade/i,
  /military-grade/i,
  /\bISO\b/,
  /\bSOC\b/,
  /Have something worth making\?/i,
  /docs\/evidence/i,
  /PUBLIC_CONTACT_EMAIL/,
  /PUBLIC_SECURITY_EMAIL/,
  /this environment is configured/i,
  /owner review/i,
  /public inclusion gates/i,
  /approved public truth/i,
];

for (const route of TRUST_ROUTES) {
  test(`${route} is reachable without trust anti-patterns`, async ({
    page,
  }) => {
    const response = await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(response, `${route} response`).not.toBeNull();
    expect(response!.status(), `${route} status`).toBeLessThan(400);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const body = await page.locator("body").innerText();
    for (const pattern of BANNED) {
      expect(body, `${route} must not match ${pattern}`).not.toMatch(pattern);
    }
  });
}

test("/security/ exposes private vulnerability reporting CTA", async ({
  page,
}) => {
  await page.goto("/en/security/");
  const link = page.getByRole("link", {
    name: /Open private vulnerability reporting/i,
  });
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute(
    "href",
    "https://github.com/BlueSkyz-Labs/SGPS-Marketing/security/advisories/new",
  );
});

test("/about/ shows approved founder title", async ({ page }) => {
  await page.goto("/en/about/");
  await expect(page.getByText(/Tony Nguyen — Founder & CEO/i)).toBeVisible();
});

test("/privacy/ summarizes practical trust answers", async ({ page }) => {
  await page.goto("/en/privacy/");
  await expect(page.getByText(/What is collected/i)).toBeVisible();
  await expect(page.getByText(/Deletion and product privacy/i)).toBeVisible();
});

test("homepage omits flagship proof without verified screenshot", async ({
  page,
}) => {
  await page.goto("/en/");
  await expect(page.locator("[data-flagship-proof]")).toHaveCount(0);
});
