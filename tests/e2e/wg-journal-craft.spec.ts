import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * Wave G1: the Journey index has exactly one lead item, quiet titles
 * (`--text-primary`, no resting underline), publisher-hostname labels on post
 * sources with the full URL still visible, no horizontal overflow at 390 px,
 * and no axe violations.
 */
const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const INDEXES = ["/vi/journal/", "/en/journal/"] as const;
const POSTS = [
  "/vi/journal/thue-cho-thue-tro-2026/",
  "/en/journal/thue-cho-thue-tro-2026/",
] as const;

for (const path of INDEXES) {
  test(`${path} has one lead and quiet titles`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator("[data-journal-lead]")).toHaveCount(1);
    const titles = page.locator("[data-journal-item] h3 a");
    expect(await titles.count()).toBeGreaterThan(1);
    const primary = await page.evaluate(() => {
      const probe = document.createElement("span");
      probe.style.color = "var(--text-primary)";
      document.body.append(probe);
      const value = getComputedStyle(probe).color;
      probe.remove();
      return value;
    });
    for (const title of await titles.all()) {
      const style = await title.evaluate((el) => {
        const cs = getComputedStyle(el);
        return { color: cs.color, line: cs.textDecorationLine };
      });
      expect(style.color).toBe(primary);
      expect(style.line).toBe("none");
    }
  });

  test(`${path} @390 does not overflow and passes axe`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(path);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(390);
    const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
    expect(results.violations).toEqual([]);
  });
}

for (const path of POSTS) {
  test(`${path} labels each source with its hostname and keeps the URL`, async ({
    page,
  }) => {
    await page.goto(path);
    const sources = page.locator("[data-journal-source]");
    expect(await sources.count()).toBeGreaterThan(0);
    for (const source of await sources.all()) {
      const href = (await source.getAttribute("href"))!;
      const host = new URL(href).hostname.replace(/^www\./, "");
      const label = source.locator(
        "xpath=preceding-sibling::*[@data-journal-source-host]",
      );
      await expect(label).toHaveCount(1);
      await expect(label).toHaveText(host);
      await expect(source).toHaveText(href);
      await expect(source).toBeVisible();
    }
  });

  test(`${path} @390 does not overflow and passes axe`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(path);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(390);
    const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
    expect(results.violations).toEqual([]);
  });
}
