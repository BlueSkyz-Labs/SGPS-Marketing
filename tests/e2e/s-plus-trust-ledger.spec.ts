import { expect, test } from "@playwright/test";

const FORBIDDEN = [
  /certif/i,
  /\bISO\b/,
  /\bSOC\b/,
  /bank-grade/i,
  /military-grade/i,
  /trust score/i,
  /maturity score/i,
];

test("homepage trust ledger renders three truthful lanes on /en/", async ({
  page,
}) => {
  await page.goto("/en/");
  const ledger = page.locator("[data-trust-ledger]");
  await expect(ledger).toBeVisible();
  const rows = ledger.getByRole("listitem");
  await expect(rows).toHaveCount(3);
  const text = await ledger.innerText();
  for (const label of ["Privacy", "Security", "Support"]) {
    expect(text).toContain(label);
  }
  await expect(ledger.getByText(/Available/).first()).toBeVisible();
  for (const pattern of FORBIDDEN) {
    expect(text).not.toMatch(pattern);
  }
});

test("every visible ledger entry reports a working route", async ({ page }) => {
  await page.goto("/en/");
  const ledger = page.locator("[data-trust-ledger]");
  await expect(ledger.getByRole("link", { name: /Privacy/i })).toHaveAttribute(
    "href",
    "/en/privacy/",
  );
  await expect(ledger.getByRole("link", { name: /Security/i })).toHaveAttribute(
    "href",
    "/en/security/",
  );
  await expect(ledger.getByRole("link", { name: /Support/i })).toHaveAttribute(
    "href",
    "/en/support/",
  );
});

test("ledger routes navigate without contacting external channels", async ({
  page,
}) => {
  await page.goto("/en/");
  const ledger = page.locator("[data-trust-ledger]");
  const hrefs = await ledger
    .getByRole("link")
    .evaluateAll((elements) =>
      elements.map((element) => element.getAttribute("href")),
    );
  for (const href of hrefs) {
    expect(href).toMatch(/^\/(en|vi)\//);
  }
  await ledger.getByRole("link", { name: /Privacy/i }).click();
  await expect(page).toHaveURL(/\/en\/privacy\/$/);
});

test("trust ledger renders localized lanes on /vi/", async ({ page }) => {
  await page.goto("/vi/");
  const ledger = page.locator("[data-trust-ledger]");
  await expect(ledger).toBeVisible();
  const text = await ledger.innerText();
  for (const label of ["Quyền riêng tư", "Bảo mật", "Hỗ trợ"]) {
    expect(text).toContain(label);
  }
  await expect(ledger.getByText(/Có sẵn/).first()).toBeVisible();
  await expect(
    ledger.getByRole("link", { name: /Quyền riêng tư/i }),
  ).toHaveAttribute("href", "/vi/privacy/");
});

test("ledger keeps accessible names free of decorative status noise", async ({
  page,
}) => {
  await page.goto("/en/");
  const ledger = page.locator("[data-trust-ledger]");
  const link = ledger.getByRole("link", { name: /Privacy/i });
  const name = await link.evaluate((element) => element.textContent ?? "");
  expect(name).toContain("Privacy");
});
