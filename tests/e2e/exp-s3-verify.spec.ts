import { expect, test } from "@playwright/test";
import { openVerifyLayer } from "./verify-helpers.ts";

/**
 * Experience v6 S3 — the /verify route and the evidence relocation.
 * Mounted-component checks on the rendered pages (not source-only).
 * Negative proof: against the pre-S3 build /verify is a 404 and /products/
 * inlines the Atlas (340 words, [data-atlas] present) — every assertion below
 * fails there.
 */
const LOCALES = [
  { lang: "en", label: "Verify", products: "Products" },
  { lang: "vi", label: "Xác minh", products: "Sản phẩm" },
  { lang: "zh", label: "核验", products: "产品" },
  { lang: "zh-hant", label: "核驗", products: "產品" },
] as const;

// Visible words on the <main> content. English is held to the plan cap; the
// other locales are held to the plan's 1.15x length rule where their script
// counts words the same way. Vietnamese is syllable-delimited (its registry
// copy is ~1.6x the English token count), so it is bounded separately.
const WORD_CAP = { en: 120, vi: 175, zh: 138, "zh-hant": 138 } as const;

for (const locale of LOCALES) {
  test.describe(`/${locale.lang}/verify/`, () => {
    test("exists with one h1, localized title and hreflang alternates", async ({
      page,
    }) => {
      const response = await page.goto(`/${locale.lang}/verify/`);
      expect(response?.status()).toBe(200);
      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page).toHaveTitle(new RegExp(`^${locale.label} · `));
      const canonical = await page
        .locator('link[rel="canonical"]')
        .getAttribute("href");
      expect(canonical ?? "").toContain(`/${locale.lang}/verify/`);
      const alternates = await page
        .locator('link[rel="alternate"][hreflang]')
        .evaluateAll((nodes) =>
          nodes.map((node) => node.getAttribute("hreflang")),
        );
      expect(alternates).toEqual(
        expect.arrayContaining(["en", "vi", "zh-Hans", "zh-Hant", "x-default"]),
      );
    });

    test("front layer is plain language: claims, backing, how to check", async ({
      page,
    }) => {
      await page.goto(`/${locale.lang}/verify/`);
      await expect(page.locator("[data-evidence-teaser]")).toBeVisible();
      await expect(page.locator("[data-trust-ledger]")).toBeVisible();
      await expect(page.locator("[data-verify-room]")).toHaveAttribute(
        "href",
        `/${locale.lang}/decision-room/`,
      );
      // Node codes and the source-to-surface chain stay in collapsed layers.
      for (const layer of ["atlas", "trace", "pages"]) {
        const details = page.locator(`details[data-verify-layer="${layer}"]`);
        await expect(details).toHaveCount(1);
        expect(
          await details.evaluate((el) => (el as HTMLDetailsElement).open),
        ).toBe(false);
      }
      await expect(page.locator("[data-atlas]")).toBeHidden();
      await expect(page.locator("[data-source-trace]").first()).toBeHidden();
      const front = await page.locator("main").innerText();
      expect(front).not.toMatch(/\b[CE][1-9]\b/);
    });

    test("footer links to /verify and the page links back to products", async ({
      page,
    }) => {
      await page.goto(`/${locale.lang}/verify/`);
      await expect(
        page.locator(`footer a[href="/${locale.lang}/verify/"]`),
      ).toHaveCount(1);
      await expect(
        page.locator(`main a[href="/${locale.lang}/products/"]`),
      ).toHaveCount(1);
    });

    test("the technical layers open with a click and hold the moved content", async ({
      page,
    }) => {
      await openVerifyLayer(page, `/${locale.lang}/verify/`, "atlas");
      await expect(page.locator("[data-atlas]")).toBeVisible();
      await page
        .locator('details[data-verify-layer="trace"] summary')
        .first()
        .click();
      await expect(page.locator("[data-source-trace]").first()).toBeVisible();
    });

    test("/products/ holds the copy cap and carries one quiet link to /verify", async ({
      page,
    }) => {
      await page.goto(`/${locale.lang}/products/`);
      const words = await page
        .locator("main")
        .evaluate(
          (el) => (el as HTMLElement).innerText.trim().split(/\s+/).length,
        );
      expect(words, "visible words in main").toBeLessThanOrEqual(
        WORD_CAP[locale.lang],
      );
      await expect(page.locator("[data-atlas]")).toHaveCount(0);
      await expect(page.locator("[data-source-trace]")).toHaveCount(0);
      await expect(page.locator("[data-integrity-lens]")).toHaveCount(0);
      await expect(
        page.locator(`main a[href="/${locale.lang}/verify/"]`),
      ).toHaveCount(1);
    });

    test("/security/ no longer inlines the source-to-surface chain", async ({
      page,
    }) => {
      await page.goto(`/${locale.lang}/security/`);
      await expect(page.locator("[data-source-trace]")).toHaveCount(0);
      // Evidence disclosure itself stays on the security page.
      await expect(
        page.locator('[data-integrity-lens][data-surface="security"]'),
      ).toBeVisible();
    });
  });
}

test("the moved routes stay reachable", async ({ request }) => {
  for (const path of [
    "/en/decision-room/",
    "/en/dossier/",
    "/en/architecture/",
    "/en/editions/",
    "/en/security/",
    "/en/products/",
  ]) {
    const response = await request.get(path);
    expect(response.status(), path).toBe(200);
  }
});
