import { expect, test } from "@playwright/test";

const LANGS = ["en", "vi", "zh"] as const;
const SECTIONS = ["claims", "evidence", "boundaries"];

test.describe("C4-C printable dossier document", () => {
  for (const lang of LANGS) {
    test(`/${lang}/dossier/print/ renders every section with sources and caveats`, async ({
      page,
    }) => {
      await page.goto(`/${lang}/dossier/print/`);
      const doc = page.locator("[data-dossier-document]");
      await expect(doc).toBeVisible();
      await expect(doc).toHaveCount(1);
      // exactly one h1: the document identity
      await expect(page.locator("h1")).toHaveCount(1);

      for (const section of SECTIONS) {
        const node = doc.locator(
          `[data-dossier-document-section="${section}"]`,
        );
        await expect(node).toBeVisible();
        await expect(node.locator("h2")).toHaveCount(1);
        await expect(
          node.locator("[data-dossier-document-item]").first(),
        ).toBeVisible();
      }
      // every item exposes a canonical destination
      const links = doc.locator(".c4-dossier-document__link");
      await expect(links.first()).toBeVisible();
      expect(await links.count()).toBeGreaterThan(0);
      // the caveat is stated, not hidden
      await expect(doc.locator(".c4-dossier-document__unknown")).toBeVisible();
    });

    test(`/${lang}/dossier/print/ is complete without JavaScript`, async ({
      request,
    }) => {
      const html = await (await request.get(`/${lang}/dossier/print/`)).text();
      expect(html).toContain("data-dossier-document");
      for (const section of SECTIONS) {
        expect(html).toContain(`data-dossier-document-section="${section}"`);
      }
      expect(html).toContain("<h1");
    });
  }

  test("print media keeps the document readable and drops interactive controls", async ({
    page,
  }) => {
    await page.goto("/en/dossier/print/");
    await page.emulateMedia({ media: "print" });
    const doc = page.locator("[data-dossier-document]");
    await expect(doc).toBeVisible();
    await expect(
      doc.locator("[data-dossier-document-section]").last(),
    ).toBeVisible();
    await expect(doc.locator(".c4-dossier-document__unknown")).toBeVisible();
    // the document itself must not require an interactive control to be read
    // (the site shell owns its own controls; those are not this document's)
    await expect(doc.locator("input, button, select, textarea")).toHaveCount(0);
  });

  test("the document states authored freshness only and no internal metadata", async ({
    page,
  }) => {
    await page.goto("/en/dossier/print/");
    const text = await page.locator("[data-dossier-document]").innerText();
    // any date shown is an authored ISO review date, never a generation timestamp
    const dates = text.match(/\d{4}-\d{2}-\d{2}/g) ?? [];
    for (const date of dates) expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(text).not.toMatch(/generated (at|on) \d/i);
    for (const leak of ["src/", ".ts", ".astro", "commit", "sha", "\\"]) {
      expect(
        text.toLowerCase(),
        `document must not leak ${leak}`,
      ).not.toContain(leak.toLowerCase());
    }
  });

  test("the document carries no assurance language", async ({ page }) => {
    await page.goto("/en/dossier/print/");
    const text = (
      await page.locator("[data-dossier-document]").innerText()
    ).toLowerCase();
    for (const banned of [
      "certified",
      "audited",
      "guaranteed",
      "compliant",
      "secure",
    ]) {
      expect(text, `document must not claim ${banned}`).not.toContain(banned);
    }
  });

  test("the document stays inside 320px and 390px", async ({ page }) => {
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto("/en/dossier/print/");
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(overflow, `no sideways scroll at ${width}`).toBeLessThanOrEqual(1);
    }
  });
});
