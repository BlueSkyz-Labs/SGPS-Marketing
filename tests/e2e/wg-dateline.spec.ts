import { expect, test } from "@playwright/test";
import { formatDate } from "../../src/lib/i18n";

/**
 * Wave G2: every visible date is one `Dateline` role. On rendered pages each
 * `<time datetime>` carries the authored ISO value, shows the localized text
 * (never the raw ISO), and uses tabular numerals.
 */
const LOCALES = ["en", "vi", "zh", "zh-hant"] as const;
const ISO = /^\d{4}-\d{2}-\d{2}$/;

for (const lang of LOCALES) {
  test(`${lang}: dossier print dates are localized Datelines with tabular numerals`, async ({
    page,
  }) => {
    await page.goto(`/${lang}/dossier/print/`);
    const times = page.locator("[data-dossier-document] time[datetime]");
    const count = await times.count();
    expect(count, "at least one authored review date").toBeGreaterThan(0);
    for (let i = 0; i < count; i += 1) {
      const time = times.nth(i);
      const iso = (await time.getAttribute("datetime")) ?? "";
      expect(iso).toMatch(ISO);
      await expect(time).toHaveClass(/\bdateline\b/);
      await expect(time).toHaveText(formatDate(lang, iso));
      await expect(time).not.toHaveText(iso);
      expect(
        await time.evaluate((el) => getComputedStyle(el).fontVariantNumeric),
      ).toContain("tabular-nums");
    }
  });
}

for (const lang of ["en", "vi"] as const) {
  test(`${lang}: journal index dateline is localized, meta-sized and tabular`, async ({
    page,
  }) => {
    await page.goto(`/${lang}/journal/`);
    const time = page.locator("[data-journal-item] time[datetime]").first();
    const iso = (await time.getAttribute("datetime")) ?? "";
    expect(iso).toMatch(ISO);
    await expect(time).toHaveClass(/\bdateline\b/);
    await expect(time).toHaveText(formatDate(lang, iso));
    const style = await time.evaluate((el) => {
      const cs = getComputedStyle(el);
      return { numeric: cs.fontVariantNumeric, spacing: cs.letterSpacing };
    });
    expect(style.numeric).toContain("tabular-nums");
    expect(style.spacing).not.toBe("normal");
  });
}

for (const lang of LOCALES) {
  test(`${lang}: home capture caption shows the localized capture date, ISO stays in data-capture-date`, async ({
    page,
  }) => {
    await page.goto(`/${lang}/`);
    const captures = page.locator("[data-capture-date]");
    const count = await captures.count();
    expect(count, "home hero has a capture").toBeGreaterThan(0);
    let checked = 0;
    for (let i = 0; i < count; i += 1) {
      const capture = captures.nth(i);
      const iso = (await capture.getAttribute("data-capture-date")) ?? "";
      expect(iso).toMatch(ISO);
      const time = capture.locator(
        "figcaption .flagship-capture__provenance time[datetime]",
      );
      if ((await time.count()) === 0) continue; // label dropped by a sibling
      await expect(time).toHaveAttribute("datetime", iso);
      await expect(time).toHaveText(formatDate(lang, iso));
      await expect(capture.locator("figcaption")).not.toContainText(iso);
      checked += 1;
    }
    expect(checked, "a caption date was checked").toBeGreaterThan(0);
  });
}

test("showcase disclosure shows no raw ISO date on a product page", async ({
  page,
}) => {
  await page.goto("/en/products/sotro/");
  const disclosure = page.locator("[data-showcase-disclosure]");
  expect(await disclosure.count()).toBeGreaterThan(0);
  await expect(disclosure.first()).not.toHaveText(/\d{4}-\d{2}-\d{2}/);
});
