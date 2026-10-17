import { expect, test, type Page } from "@playwright/test";

const LOCALES = ["en", "vi", "zh", "zh-hant"] as const;
const VIEWPORTS = [
  { name: "short compact viewport", width: 390, height: 360 },
  { name: "short landscape viewport", width: 844, height: 390 },
] as const;

async function zoomText200(page: Page): Promise<void> {
  await page.route("**/*", async (route) => {
    if (route.request().resourceType() !== "document") {
      await route.continue();
      return;
    }
    const response = await route.fetch();
    const body = (await response.text()).replace(
      "</head>",
      "<style>html { font-size: 200% !important; }</style></head>",
    );
    await route.fulfill({ response, body });
  });
}

for (const viewport of VIEWPORTS) {
  for (const locale of LOCALES) {
    test(`${locale}: language choices stay reachable at 200% text on a ${viewport.name}`, async ({
      page,
    }) => {
      await page.setViewportSize({
        width: viewport.width,
        height: viewport.height,
      });
      await zoomText200(page);
      await page.goto(`/${locale}/`);

      const compactMenu = page.locator("header details").first();
      const trigger = page
        .locator("header [data-language-trigger]:visible")
        .first();
      if (!(await trigger.isVisible())) {
        await compactMenu.locator("summary").click();
      }
      await trigger.click();

      const panel = page.locator("header [data-language-panel]:popover-open");
      await expect(panel).toBeVisible();
      const bounds = await panel.evaluate((node) => {
        const rect = node.getBoundingClientRect();
        return {
          top: rect.top,
          bottom: rect.bottom,
          clientHeight: node.clientHeight,
          scrollHeight: node.scrollHeight,
          overflowY: getComputedStyle(node).overflowY,
        };
      });
      expect(bounds.top, JSON.stringify(bounds)).toBeGreaterThanOrEqual(-0.5);
      expect(bounds.bottom, JSON.stringify(bounds)).toBeLessThanOrEqual(
        viewport.height + 0.5,
      );
      expect(bounds.overflowY).toMatch(/auto|scroll/);
      expect(bounds.scrollHeight).toBeGreaterThan(bounds.clientHeight);

      const choices = panel.locator("[data-language-choice]");
      await expect(choices).toHaveCount(4);
      const lastChoice = choices.last();
      await lastChoice.scrollIntoViewIfNeeded();
      await expect(lastChoice).toBeInViewport();
    });
  }
}
