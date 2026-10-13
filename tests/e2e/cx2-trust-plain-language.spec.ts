import { expect, test, type Page } from "@playwright/test";

/**
 * CX audit M2: internal vocabulary must not reach customers as link text on
 * the trust pages, and no two links in the page body may share one label.
 * Presentation copy only; what the pages assert is guarded by the existing
 * verify / truth specs.
 */
const JARGON: Record<string, RegExp> = {
  en: /\b(claims?|evidence)\b/i,
  // vi keeps the binding v8 §5.3 glossary nouns (tuyên bố, bằng chứng); only
  // the repeated generic action label is retired.
  vi: /Xem bằng chứng/i,
};

async function linkTexts(page: Page): Promise<string[]> {
  return page
    .locator("main a")
    .evaluateAll((anchors) =>
      anchors
        .map((a) => (a.textContent ?? "").replace(/\s+/g, " ").trim())
        .filter((text) => text.length > 0),
    );
}

function duplicates(texts: string[]): string[] {
  return texts.filter((text, i) => texts.indexOf(text) !== i);
}

for (const route of ["verify", "about"] as const) {
  for (const lang of ["en", "vi", "zh", "zh-hant"] as const) {
    test(`/${lang}/${route}/ link texts are unique`, async ({ page }) => {
      await page.goto(`/${lang}/${route}/`);
      const texts = await linkTexts(page);
      expect(texts.length).toBeGreaterThan(3);
      expect(duplicates(texts)).toEqual([]);
    });
  }

  for (const lang of ["en", "vi"] as const) {
    test(`/${lang}/${route}/ link texts avoid internal vocabulary`, async ({
      page,
    }) => {
      await page.goto(`/${lang}/${route}/`);
      const texts = await linkTexts(page);
      expect(texts.filter((text) => JARGON[lang]!.test(text))).toEqual([]);
    });
  }
}

test("verify headings avoid internal vocabulary (en, vi)", async ({ page }) => {
  for (const lang of ["en", "vi"] as const) {
    await page.goto(`/${lang}/verify/`);
    const headings = await page
      .locator("main h2, main summary")
      .allTextContents();
    expect(headings.length).toBeGreaterThan(1);
    expect(headings.filter((text) => JARGON[lang]!.test(text))).toEqual([]);
  }
});

test("negative proof: the guards detect a repeated and a jargon link", async ({
  page,
}) => {
  await page.goto("/en/verify/");
  await page.evaluate(() => {
    const main = document.querySelector("main")!;
    for (const text of ["See the evidence", "See the evidence"]) {
      const a = document.createElement("a");
      a.href = "/en/verify/";
      a.textContent = text;
      main.appendChild(a);
    }
  });
  const texts = await linkTexts(page);
  expect(duplicates(texts)).toContain("See the evidence");
  expect(texts.filter((text) => JARGON.en!.test(text))).toContain(
    "See the evidence",
  );
});
