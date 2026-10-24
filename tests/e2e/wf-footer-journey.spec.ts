import { expect, test } from "@playwright/test";

/**
 * Audit IX-02: the footer links the Journey (the section's own title) for
 * languages with a published post of their own (en, vi), once, and not for
 * zh / zh-Hant.
 */
const CASES = [
  { lang: "en", label: "Journey", present: true },
  { lang: "vi", label: "Hành trình", present: true },
  { lang: "zh", label: "日志", present: false },
  { lang: "zh-hant", label: "日誌", present: false },
] as const;

for (const { lang, label, present } of CASES) {
  test(`${lang}: footer Journey link ${present ? "present" : "absent"}`, async ({
    page,
  }) => {
    await page.goto(`/${lang}/`);
    const link = page.locator(`footer a[href="/${lang}/journal/"]`);
    await expect(link).toHaveCount(present ? 1 : 0);
    if (present) await expect(link).toHaveText(label);
  });
}
