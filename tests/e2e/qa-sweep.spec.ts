import { expect, test } from "@playwright/test";

const LOCALES = ["en", "vi", "zh", "zh-hant"] as const;

test.describe("QA sweep regressions", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  for (const lang of LOCALES) {
    test(`/${lang}/verify/ has unique ids and no dead in-page anchors`, async ({
      page,
    }) => {
      await page.goto(`/${lang}/verify/`);
      const result = await page.evaluate(() => {
        const counts = new Map<string, number>();
        for (const el of document.querySelectorAll("[id]")) {
          counts.set(el.id, (counts.get(el.id) ?? 0) + 1);
        }
        const duplicates = [...counts]
          .filter(([, n]) => n > 1)
          .map(([id]) => id);
        const dead = [...document.querySelectorAll("a[href^='#']")]
          .map((a) => a.getAttribute("href") ?? "")
          .filter((h) => h.length > 1 && !document.getElementById(h.slice(1)));
        return { duplicates, dead };
      });
      expect(result.duplicates).toEqual([]);
      expect(result.dead).toEqual([]);
    });
  }

  test("command navigator: Enter opens the first result, arrows move focus", async ({
    page,
  }) => {
    await page.goto("/en/");
    await page.keyboard.press("Control+k");
    const input = page.locator("[data-command-input]");
    await input.fill("privacy");
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/en\/privacy\/$/);

    await page.goto("/en/");
    await page.keyboard.press("Control+k");
    await expect(page.locator("[data-command-input]")).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await expect(
      page.locator("[data-command-item]:not([hidden]) a").first(),
    ).toBeFocused();
    await page.keyboard.press("ArrowUp");
    await expect(page.locator("[data-command-input]")).toBeFocused();
  });

  test("decision atelier announces the number of distinct items shown", async ({
    page,
  }) => {
    await page.goto("/en/decision-room/");
    await page.locator("[data-atelier-goal]").selectOption("explore");
    const visible = await page
      .locator("[data-decision-items] [data-decision-item]:not([hidden])")
      .count();
    const status = await page.locator("[data-atelier-status]").innerText();
    expect(status).toContain(String(visible));
    const total = await page.locator("[data-decision-item]").count();
    expect(Number(status.match(/\d+/)?.[0])).toBeLessThanOrEqual(total);
  });

  test("decision room reset keeps keyboard focus on the page", async ({
    page,
  }) => {
    await page.goto("/en/decision-room/");
    await page.locator("[data-decision-add]").first().click();
    await page.locator("[data-decision-reset]").click();
    const focused = await page.evaluate(
      () => document.activeElement?.tagName ?? "",
    );
    expect(focused).toBe("BUTTON");
  });
});
