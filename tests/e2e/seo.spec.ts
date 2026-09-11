import { expect, test } from "@playwright/test";

test("home exposes canonical, OG, and Organization JSON-LD", async ({
  page,
}) => {
  await page.goto("/en/");
  const canonical = page.locator('link[rel="canonical"]');
  await expect(canonical).toHaveAttribute("href", /\/$/);
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    "content",
    /BlueSkyz Labs/,
  );
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    /\/social\/og-default\.png$/,
  );
  // Local/default SITE.url must not be indexable.
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    /noindex/,
  );

  const jsonLd = await page
    .locator('script[type="application/ld+json"]')
    .allTextContents();
  const parsed = jsonLd.map((raw) => JSON.parse(raw));
  expect(parsed.some((entry) => entry["@type"] === "Organization")).toBe(true);
  expect(parsed.some((entry) => entry["@type"] === "WebSite")).toBe(true);
});

test("robots and sitemap are public and exclude staging hard-codes", async ({
  request,
}) => {
  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBeTruthy();
  const robotsBody = await robots.text();
  // Without PUBLIC_SITE_URL, local fallback disallows indexing.
  expect(robotsBody).toMatch(/Disallow:\s*\//);
  expect(robotsBody).not.toMatch(/portfolio\.tonydemo\.com/);

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBeTruthy();
  const sitemapBody = await sitemap.text();
  expect(sitemapBody).toContain("<urlset");
  // Non-production SITE.url must not advertise absolute locs.
  expect(sitemapBody).not.toContain("<loc>");
  expect(sitemapBody).not.toMatch(/portfolio\.tonydemo\.com/);
});
