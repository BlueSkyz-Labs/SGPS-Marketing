import { expect, test } from "@playwright/test";

const LOCALES = ["en", "vi", "zh", "zh-hant"] as const;

test.describe("command palette covers existing pages", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  for (const lang of LOCALES) {
    test(`/${lang}/ palette lists decision room, verify, guide and evidence pages`, async ({
      page,
    }) => {
      await page.goto(`/${lang}/`);
      const hrefs = await page
        .locator("[data-command-item] a")
        .evaluateAll((els) => els.map((el) => el.getAttribute("href")));
      expect(hrefs).toContain(`/${lang}/decision-room/`);
      expect(hrefs).toContain(`/${lang}/verify/`);
      expect(hrefs).toContain(`/${lang}/products/sotro/guide/`);
      for (const id of [
        "security-reporting-is-private",
        "privacy-no-tracking-on-this-site",
        "registry-publishes-only-proven-products",
      ]) {
        expect(hrefs).toContain(`/${lang}/evidence/${id}/`);
      }
      // every internal result is a built page
      for (const href of hrefs.filter((h) => h?.startsWith("/"))) {
        const response = await page.request.get(href!);
        expect(response.status(), href!).toBe(200);
      }
    });
  }

  for (const lang of LOCALES) {
    test(`/${lang}/ footer and palette link editions and dossier, main nav does not`, async ({
      page,
    }) => {
      await page.goto(`/${lang}/`);
      for (const route of ["editions", "dossier"]) {
        const href = `/${lang}/${route}/`;
        await expect(page.locator(`footer a[href="${href}"]`)).toHaveCount(1);
        await expect(
          page.locator(`[data-command-item] a[href="${href}"]`),
        ).toHaveCount(1);
        await expect(
          page.locator(`header nav[aria-label] a[href="${href}"]`),
        ).toHaveCount(0);
      }
    });
  }

  test("zh and zh-hant verify are findable by the labels the site uses", async ({
    page,
  }) => {
    const cases: [string, string, string][] = [
      ["zh", "核验", "/zh/verify/"],
      ["zh", "核实", "/zh/verify/"],
      ["zh-hant", "核驗", "/zh-hant/verify/"],
      ["zh-hant", "查證", "/zh-hant/verify/"],
    ];
    for (const [lang, query, href] of cases) {
      await page.goto(`/${lang}/`);
      await page.keyboard.press("Control+k");
      await page.locator("[data-command-input]").fill(query);
      await expect(
        page.locator(`[data-command-item]:not([hidden]) a[href="${href}"]`),
      ).toHaveCount(1);
    }
  });

  test("guide and compare are searchable in English", async ({ page }) => {
    await page.goto("/en/");
    await page.keyboard.press("Control+k");
    const input = page.locator("[data-command-input]");
    await input.fill("guide");
    await expect(
      page.locator(
        '[data-command-item]:not([hidden]) a[href="/en/products/sotro/guide/"]',
      ),
    ).toHaveCount(1);
    await input.fill("compare");
    await expect(
      page.locator(
        '[data-command-item]:not([hidden]) a[href="/en/decision-room/"]',
      ),
    ).toHaveCount(1);
  });
});

test.describe("compact menu closes with Escape and outside press", () => {
  test.use({ viewport: { width: 390, height: 800 } });

  test("Escape closes the menu and returns focus to the summary", async ({
    page,
  }) => {
    await page.goto("/en/");
    const details = page.locator("header details");
    const summary = details.locator("summary");
    await summary.click();
    await expect(details).toHaveAttribute("open", "");
    await page.keyboard.press("Escape");
    await expect(details).not.toHaveAttribute("open", "");
    await expect(summary).toBeFocused();
  });

  test("an outside press closes the menu; a press inside does not", async ({
    page,
  }) => {
    await page.goto("/en/");
    const details = page.locator("header details");
    await details.locator("summary").click();
    await expect(details).toHaveAttribute("open", "");
    await details.locator(":scope > div").click({ position: { x: 4, y: 4 } });
    await expect(details).toHaveAttribute("open", "");
    await page.mouse.click(10, 700);
    await expect(details).not.toHaveAttribute("open", "");
  });

  test("Escape inside an open language popover closes only the popover", async ({
    page,
  }) => {
    await page.goto("/en/");
    const details = page.locator("header details");
    await details.locator("summary").click();
    await details.locator("[data-language-trigger]").click();
    const panel = page.locator("#lang-panel-menu");
    await expect(panel).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    await expect(details).toHaveAttribute("open", "");
  });

  test("without JavaScript the menu still opens natively", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 800 },
    });
    const page = await context.newPage();
    await page.goto("/en/");
    const details = page.locator("header details");
    await details.locator("summary").click();
    await expect(details).toHaveAttribute("open", "");
    await context.close();
  });
});
