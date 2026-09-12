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

test("every ledger entry reports a working route behind its disclosure", async ({
  page,
}) => {
  await page.goto("/en/");
  const ledger = page.locator("[data-trust-ledger]");
  // Evidence links live behind a native disclosure (v3 S+6): assert the
  // routes are attached, then prove one row is reachable when opened.
  await expect(ledger.locator('a[href="/en/privacy/"]')).toBeAttached();
  await expect(ledger.locator('a[href="/en/security/"]')).toBeAttached();
  await expect(ledger.locator('a[href="/en/support/"]')).toBeAttached();
  await ledger
    .locator("details")
    .first()
    .evaluate((el) => {
      (el as HTMLDetailsElement).open = true;
    });
  await expect(ledger.getByRole("link", { name: /Privacy/i })).toBeVisible();
});

test("ledger routes navigate without contacting external channels", async ({
  page,
}) => {
  await page.goto("/en/");
  const ledger = page.locator("[data-trust-ledger]");
  const hrefs = await ledger
    .locator("a")
    .evaluateAll((elements) =>
      elements.map((element) => element.getAttribute("href")),
    );
  expect(hrefs.length).toBeGreaterThan(0);
  for (const href of hrefs) {
    expect(href).toMatch(/^\/(en|vi)\//);
  }
  await ledger
    .locator("details")
    .first()
    .evaluate((el) => {
      (el as HTMLDetailsElement).open = true;
    });
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
  await expect(ledger.locator('a[href="/vi/privacy/"]')).toBeAttached();
});

test("ledger keeps accessible names free of decorative status noise", async ({
  page,
}) => {
  await page.goto("/en/");
  const ledger = page.locator("[data-trust-ledger]");
  await ledger
    .locator("details")
    .first()
    .evaluate((el) => {
      (el as HTMLDetailsElement).open = true;
    });
  const link = ledger.getByRole("link", { name: /Privacy/i });
  const name = await link.evaluate((element) => element.textContent ?? "");
  expect(name).toContain("Privacy");
  expect(name).not.toMatch(/available|not published/i);
});
