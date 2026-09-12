import { expect, test } from "@playwright/test";

/**
 * Wave H7 — markup baseline.
 * Every public document needs exactly one h1, the right document language, an
 * absolute canonical and a description. The evidence passport pages shipped
 * without an h1 until this wave; this spec keeps it that way fixed.
 */
const ROUTES: Array<{ path: string; lang: "en" | "vi" }> = [
  { path: "/en/", lang: "en" },
  { path: "/vi/", lang: "vi" },
  { path: "/en/about/", lang: "en" },
  { path: "/vi/about/", lang: "vi" },
  { path: "/en/products/", lang: "en" },
  { path: "/en/decision-room/", lang: "en" },
  { path: "/vi/decision-room/", lang: "vi" },
  { path: "/en/evidence/security-reporting-is-private/", lang: "en" },
  { path: "/vi/evidence/security-reporting-is-private/", lang: "vi" },
];

for (const route of ROUTES) {
  test(`${route.path} has one h1, correct language and canonical`, async ({
    page,
  }) => {
    await page.goto(route.path);
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1").first()).toBeVisible();

    const documentState = await page.evaluate(() => ({
      lang: document.documentElement.lang,
      canonical:
        document.querySelector('link[rel="canonical"]')?.getAttribute("href") ??
        "",
      description:
        document
          .querySelector('meta[name="description"]')
          ?.getAttribute("content") ?? "",
    }));
    expect(documentState.lang.startsWith(route.lang)).toBe(true);
    expect(documentState.canonical).toMatch(/^https?:\/\//);
    expect(documentState.canonical).toContain(route.path.replace(/\/$/, ""));
    expect(documentState.description.trim().length).toBeGreaterThan(10);
  });
}

test("the evidence passport page names its document and its claim", async ({
  page,
}) => {
  await page.goto("/en/evidence/security-reporting-is-private/");
  await expect(page.locator("[data-passport-page-title]")).toHaveText(
    "Evidence passport",
  );
  // The claim itself stays a section heading below the document title.
  await expect(page.locator(".evidence-passport__claim")).toHaveCount(1);
});
