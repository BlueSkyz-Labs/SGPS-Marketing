import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

/**
 * Journal press standard (docs/editorial/JOURNAL_PRESS_STANDARD.md R1, R3, R5):
 * every published post renders a loaded lead illustration with caption and
 * credit, a drop cap, an end-of-article summary infographic before the
 * sources, the closing rights line, the stamped hero as og:image, and no
 * AI-assistance line (Owner, 2026-10-24). No axe violations, no overflow.
 */
const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const POSTS = [
  {
    path: "/vi/journal/thue-cho-thue-tro-2026/",
    id: "thue-cho-thue-tro-2026",
    lang: "vi",
  },
  {
    path: "/en/journal/thue-cho-thue-tro-2026/",
    id: "thue-cho-thue-tro-2026",
    lang: "en",
  },
  { path: "/vi/journal/so-tro-xem-truoc/", id: "so-tro-xem-truoc", lang: "vi" },
  { path: "/en/journal/so-tro-xem-truoc/", id: "so-tro-xem-truoc", lang: "en" },
] as const;
const RIGHTS = {
  vi: "© 2026 BlueSkyz Labs. Bảo lưu mọi quyền.",
  en: "© 2026 BlueSkyz Labs. All rights reserved.",
};
const AI_LINES = ["Drafted with AI assistance", "có sự hỗ trợ của AI"];

for (const { path, id, lang } of POSTS) {
  test(`${path} is set as a press page`, async ({ page }) => {
    await page.goto(path);
    const hero = page.locator("[data-journal-hero] img");
    await expect(hero).toHaveAttribute(
      "src",
      `/images/journal/${id}/hero.${lang}.webp`,
    );
    await expect(hero).toHaveAttribute("fetchpriority", "high");
    await expect
      .poll(() =>
        hero.evaluate(
          (img: HTMLImageElement) => img.complete && img.naturalWidth,
        ),
      )
      .toBeGreaterThan(0);
    await expect(
      page.locator("[data-journal-hero] figcaption [data-journal-credit]"),
    ).toContainText("BlueSkyz Labs");

    const order = await page.evaluate(() => {
      const at = (sel: string) => {
        const el = document.querySelector(sel);
        return el ? [...document.querySelectorAll("*")].indexOf(el) : -1;
      };
      return {
        hero: at("[data-journal-hero]"),
        body: at("[data-journal-body]"),
        summary: at("[data-journal-infographic]"),
        sources: at("[data-journal-sources]"),
        rights: at("[data-journal-rights]"),
      };
    });
    expect(order.hero).toBeGreaterThan(-1);
    expect(order.hero).toBeLessThan(order.body);
    expect(order.body).toBeLessThan(order.summary);
    expect(order.summary).toBeLessThan(order.sources);
    expect(order.sources).toBeLessThan(order.rights);

    const info = page.locator("[data-journal-infographic] img");
    await expect(info).toHaveAttribute(
      "src",
      `/images/journal/${id}/infographic.${lang}.webp`,
    );
    await info.scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        info.evaluate(
          (img: HTMLImageElement) => img.complete && img.naturalWidth,
        ),
      )
      .toBeGreaterThan(0);
    await expect(page.locator("[data-journal-rights]")).toHaveText(
      RIGHTS[lang],
    );

    const dropCap = await page.evaluate(() => {
      const p = document.querySelector("[data-journal-body] > p");
      if (!p) return 0;
      return (
        parseFloat(getComputedStyle(p, "::first-letter").fontSize) /
        parseFloat(getComputedStyle(p).fontSize)
      );
    });
    expect(dropCap).toBeGreaterThan(2);

    await expect(page.locator("[data-journal-ai-disclosure]")).toHaveCount(0);
    const text = await page.locator("main").innerText();
    for (const line of AI_LINES) expect(text).not.toContain(line);

    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      new RegExp(`/images/journal/${id}/hero\\.${lang}\\.og\\.jpg$`),
    );
    const ld = await page
      .locator('script[type="application/ld+json"]')
      .allTextContents();
    const posting = ld
      .map((t) => JSON.parse(t))
      .flat()
      .find((n) => n["@type"] === "BlogPosting");
    expect(posting?.image).toMatch(
      new RegExp(`/images/journal/${id}/hero\\.${lang}\\.og\\.jpg$`),
    );
    expect(posting?.copyrightHolder?.name).toBe("BlueSkyz Labs");
  });

  test(`${path} press page has no axe violations or overflow at 390 px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(path);
    const overflow = await page.evaluate(
      () =>
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    const results = await new AxeBuilder({ page })
      .include("[data-journal-post]")
      .withTags(AXE_TAGS)
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
