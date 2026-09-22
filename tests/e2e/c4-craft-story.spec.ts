import { expect, test } from "@playwright/test";

const LANGS = ["en", "vi", "zh"] as const;
const STORY = "private-security-reporting";
const SECTIONS = [
  "problem",
  "designChoice",
  "constraint",
  "implementation",
  "limitations",
];

test.describe("C4-B craft provenance story", () => {
  for (const lang of LANGS) {
    test(`/${lang}/security/ renders the full source-backed story`, async ({
      page,
    }) => {
      await page.goto(`/${lang}/security/`);
      const story = page.locator(`[data-craft-story="${STORY}"]`);
      await expect(story).toBeVisible();
      await expect(story).toHaveCount(1);

      const sections = story.locator("[data-craft-section]");
      await expect(sections).toHaveCount(SECTIONS.length);
      const order = await sections.evaluateAll((nodes) =>
        nodes.map((node) => node.getAttribute("data-craft-section")),
      );
      expect(order).toEqual(SECTIONS);
      // Limitations are never hidden: they render last and are not empty.
      const limitations = story.locator('[data-craft-section="limitations"]');
      await expect(limitations).toContainText(/.{20,}/);

      const evidence = story.locator("[data-craft-evidence]");
      await expect(evidence).toHaveCount(2);
      for (let index = 0; index < 2; index += 1) {
        await expect(evidence.nth(index).locator("a")).toBeVisible();
      }
    });

    test(`/${lang}/security/ story is complete without JavaScript`, async ({
      request,
    }) => {
      const html = await (await request.get(`/${lang}/security/`)).text();
      expect(html).toContain(`data-craft-story="${STORY}"`);
      for (const section of SECTIONS) {
        expect(html, `${section} must be server-rendered`).toContain(
          `data-craft-section="${section}"`,
        );
      }
    });
  }

  test("the story claims no assurance it does not hold", async ({ page }) => {
    await page.goto("/en/security/");
    const text = await page
      .locator(`[data-craft-story="${STORY}"]`)
      .innerText();
    for (const banned of [
      "ISO 27001",
      "SOC 2",
      "certified",
      "audited",
      "bug bounty is",
      "guaranteed",
    ]) {
      expect(
        text.toLowerCase(),
        `story must not claim ${banned}`,
      ).not.toContain(banned.toLowerCase());
    }
  });

  test("the story stays inside 320px and 390px", async ({ page }) => {
    for (const width of [320, 390]) {
      await page.setViewportSize({ width, height: 844 });
      await page.goto("/en/security/");
      const overflow = await page.evaluate(
        () =>
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
      );
      expect(overflow, `no sideways scroll at ${width}`).toBeLessThanOrEqual(1);
    }
  });

  test("the story stays readable in print", async ({ page }) => {
    await page.goto("/en/security/");
    await page.emulateMedia({ media: "print" });
    const story = page.locator(`[data-craft-story="${STORY}"]`);
    await expect(story).toBeVisible();
    await expect(story.locator("[data-craft-section]").last()).toBeVisible();
    await expect(story.locator("[data-craft-evidence]").first()).toBeVisible();
  });
});
