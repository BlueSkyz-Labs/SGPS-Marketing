import { expect, test } from "@playwright/test";

/**
 * Wave H11 — recovery from a wrong URL.
 * The 404 page exists to recover a visitor; its recovery links must actually
 * work (200 + the page they promise), in both locales. Failure/recovery is an
 * explicit QA/QC dimension that was never asserted.
 *
 * Note: the local/CI preview does not execute public/_redirects (that is a
 * Cloudflare Workers feature); it serves the meta-refresh stubs instead. The
 * production 301 is verified by scripts/smoke-production.mjs. This spec accepts
 * both paths and always checks where the visitor actually ends up.
 */
const CASES = [
  {
    missing: "/en/no-such-page/",
    links: [
      { href: "/en/" },
      { href: "/en/products/", heading: /Products you can verify/i },
      { href: "/en/security/", heading: /Report privately/i },
    ],
  },
  {
    missing: "/vi/khong-ton-tai/",
    links: [
      { href: "/vi/" },
      { href: "/vi/products/", heading: /Sản phẩm bạn có thể xác minh/i },
      { href: "/vi/security/", heading: /Báo cáo riêng tư/i },
    ],
  },
];

for (const scenario of CASES) {
  test(`${scenario.missing} offers working recovery links`, async ({
    page,
  }) => {
    await page.goto(scenario.missing);
    await expect(page.locator("h1")).toHaveCount(1);
    for (const link of scenario.links) {
      const anchor = page.locator(`main a[href="${link.href}"]`).first();
      await expect(anchor).toBeVisible();
      const response = await page.goto(link.href);
      expect(response?.status(), `${link.href} should answer 200`).toBe(200);
      await expect(page.locator("h1").first()).not.toHaveText(/^\s*$/);
      if (link.heading) {
        await expect(page.locator("h1").first()).toHaveText(link.heading);
      }
    }
  });
}

test("a legacy root URL recovers to its localized page", async ({ page }) => {
  await page.goto("/about/", { waitUntil: "load" });
  // Production: HTTP 301 (smoke-verified). Local/CI: meta-refresh stub, which
  // the browser follows. Either way the visitor must end on /en/about/.
  await expect(page.locator("h1").first()).toHaveText(/Who we are/i);
  expect(new URL(page.url()).pathname).toBe("/en/about/");
});
