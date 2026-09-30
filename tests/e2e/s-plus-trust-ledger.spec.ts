import { expect, test } from "@playwright/test";

/**
 * Experience v6 S1 — the home proof band replaces the homepage Trust ledger.
 *
 * The three-lane ledger (`TrustLedger`, per-lane evidence disclosures and
 * Decision Room hooks) was removed from the home to meet the copy/link caps;
 * S3 re-stages it on /verify, where its runtime spec must be restored. Until
 * then the home proof band keeps the same truth constraints: no assurance
 * vocabulary, one real internal route, localized in every locale.
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
  { lang: "en", heading: "Trust you can verify", link: "Security" },
  { lang: "vi", heading: "Tin cậy bạn có thể xác minh", link: "Bảo mật" },
  { lang: "zh", heading: "您可以核实的信任", link: "安全" },
  { lang: "zh-hant", heading: "您可以核實的信任", link: "安全" },
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
      `/${locale.lang}/security/`,
    );
    const text = await band.innerText();
    for (const pattern of FORBIDDEN) {
      expect(text).not.toMatch(pattern);
    }
  });
}

test("the proof-band link navigates to the real security route", async ({
  page,
}) => {
  await page.goto("/en/");
  await page.locator("[data-trust-band]").getByRole("link").click();
  await expect(page).toHaveURL(/\/en\/security\/$/);
});
