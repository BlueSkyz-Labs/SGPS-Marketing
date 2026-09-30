import { expect, test } from "@playwright/test";

/**
 * Experience v6 S1/S3 — the home proof band replaces the homepage Trust
 * ledger; the three-lane ledger (`TrustLedger`) is staged on /verify, where
 * its runtime specs below are restored (they were removed from the home
 * spec in S1). The proof band keeps the same truth constraints: no assurance
 * vocabulary, one real internal route (/verify), localized in every locale.
 */
const FORBIDDEN = [
  /certif/i,
  /\bISO\b/,
  /\bSOC\b/,
  /bank-grade/i,
  /military-grade/i,
  /trust score/i,
  /maturity score/i,
];

const LOCALES = [
  { lang: "en", heading: "Trust you can verify", link: "How we verify" },
  {
    lang: "vi",
    heading: "Tin cậy bạn có thể xác minh",
    link: "Cách chúng tôi xác minh",
  },
  { lang: "zh", heading: "您可以核实的信任", link: "我们如何核验" },
  { lang: "zh-hant", heading: "您可以核實的信任", link: "我們如何核驗" },
] as const;

for (const locale of LOCALES) {
  test(`/${locale.lang}/ proof band is one heading, one line and one real route`, async ({
    page,
  }) => {
    await page.goto(`/${locale.lang}/`);
    await expect(page.locator("[data-trust-ledger]")).toHaveCount(0);
    const band = page.locator("[data-trust-band]");
    await expect(band).toBeVisible();
    await expect(
      band.getByRole("heading", { level: 2, name: locale.heading }),
    ).toBeVisible();
    const links = band.getByRole("link");
    await expect(links).toHaveCount(1);
    await expect(links.first()).toContainText(locale.link);
    await expect(links.first()).toHaveAttribute(
      "href",
      `/${locale.lang}/verify/`,
    );
    const text = await band.innerText();
    for (const pattern of FORBIDDEN) {
      expect(text).not.toMatch(pattern);
    }
  });
}

test("the proof-band link navigates to the real /verify route", async ({
  page,
}) => {
  await page.goto("/en/");
  await page.locator("[data-trust-band]").getByRole("link").click();
  await expect(page).toHaveURL(/\/en\/verify\/$/);
  await expect(page.locator("[data-trust-ledger]")).toBeVisible();
});

// --- Trust ledger runtime specs, restored on /verify (S3) -----------------

test("/en/verify/ trust ledger renders three truthful lanes", async ({
  page,
}) => {
  await page.goto("/en/verify/");
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
  await page.goto("/en/verify/");
  const ledger = page.locator("[data-trust-ledger]");
  await expect(ledger.locator('a[href="/en/privacy/"]')).toBeAttached();
  await expect(ledger.locator('a[href="/en/security/"]')).toBeAttached();
  await expect(ledger.locator('a[href="/en/support/"]')).toBeAttached();
  // Real click on the native summary (no DOM mutation), then the route is seen.
  await ledger.locator("details > summary").first().click();
  await expect(ledger.getByRole("link", { name: /Privacy/i })).toBeVisible();
});

test("ledger routes navigate without contacting external channels", async ({
  page,
}) => {
  await page.goto("/en/verify/");
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
  await ledger.locator("details > summary").first().click();
  await ledger.getByRole("link", { name: /Privacy/i }).click();
  await expect(page).toHaveURL(/\/en\/privacy\/$/);
});

for (const locale of [
  { lang: "vi", labels: ["Quyền riêng tư", "Bảo mật", "Hỗ trợ"], ok: /Có sẵn/ },
  { lang: "zh", labels: ["隐私", "安全", "支持"], ok: /可用/ },
  { lang: "zh-hant", labels: ["隱私", "安全", "支援"], ok: /可用/ },
] as const) {
  test(`trust ledger renders localized lanes on /${locale.lang}/verify/`, async ({
    page,
  }) => {
    await page.goto(`/${locale.lang}/verify/`);
    const ledger = page.locator("[data-trust-ledger]");
    await expect(ledger).toBeVisible();
    const text = await ledger.innerText();
    for (const label of locale.labels) {
      expect(text).toContain(label);
    }
    await expect(ledger.getByText(locale.ok).first()).toBeVisible();
    await expect(
      ledger.locator(`a[href="/${locale.lang}/privacy/"]`),
    ).toBeAttached();
  });
}

test("ledger keeps accessible names free of decorative status noise", async ({
  page,
}) => {
  await page.goto("/en/verify/");
  const ledger = page.locator("[data-trust-ledger]");
  await ledger.locator("details > summary").first().click();
  const link = ledger.getByRole("link", { name: /Privacy/i });
  const name = await link.evaluate((element) => element.textContent ?? "");
  expect(name).toContain("Privacy");
  expect(name).not.toMatch(/available|not published/i);
});

test("the ledger works without JavaScript on /verify", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/en/verify/");
  const ledger = page.locator("[data-trust-ledger]");
  await expect(ledger.getByRole("listitem")).toHaveCount(3);
  await ledger.locator("details > summary").first().click();
  await expect(ledger.getByRole("link", { name: /Privacy/i })).toBeVisible();
  await context.close();
});
