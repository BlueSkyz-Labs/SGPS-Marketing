import { test, expect } from "@playwright/test";

/** Real-site EN/VI parity while the production registry is intentionally empty. */
test.describe("bilingual parity — live routes (empty registry)", () => {
  const EN_LEAKS = [
    "Featured products",
    "Explore all products",
    "View profile",
    "Contact us",
    "Search pages",
    "Verified public artifact",
  ];

  test("Vietnamese pages never leak English shared-component copy", async ({
    page,
  }) => {
    for (const route of ["/vi/", "/vi/products/", "/vi/about/"]) {
      await page.goto(route);
      const body = await page.locator("body").innerText();
      for (const leak of EN_LEAKS) {
        expect(body, `${route} must not leak "${leak}"`).not.toContain(leak);
      }
    }
  });

  test("header CTA is locale-correct on both locales (empty registry)", async ({
    page,
  }) => {
    await page.goto("/vi/");
    const viCta = page.locator('header nav[aria-label="Chính"] a').last();
    await expect(viCta).toHaveAttribute("href", /^\/vi\//);

    await page.goto("/en/");
    const enCta = page.locator('header nav[aria-label="Primary"] a').last();
    await expect(enCta).toHaveAttribute("href", /^\/en\//);
  });

  test("primary and footer links on /vi/ stay in the vi locale", async ({
    page,
  }) => {
    await page.goto("/vi/");
    const hrefs = await page
      .locator(
        'header nav[aria-label="Primary"] a:not([hreflang]), footer a:not([hreflang])',
      )
      .evaluateAll((els) =>
        els.map((el) => el.getAttribute("href") ?? "").filter(Boolean),
      );
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      const isInternal = href.startsWith("/");
      if (!isInternal) continue;
      expect(href, `internal link ${href} must stay in /vi/`).toMatch(
        /^\/vi\//,
      );
    }
  });
});
