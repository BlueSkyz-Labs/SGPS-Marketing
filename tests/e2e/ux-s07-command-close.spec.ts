import { expect, test } from "@playwright/test";

/**
 * S07: touch visitors need an explicit, localized way to close quick search.
 * Native form method="dialog" closes without adding another client handler.
 */
const CLOSE = {
  en: "Close",
  vi: "Đóng",
  zh: "关闭",
  "zh-hant": "關閉",
} as const;

test.use({ viewport: { width: 1280, height: 800 } });

for (const lang of ["en", "vi", "zh", "zh-hant"] as const) {
  test(`${lang}: visible close action dismisses search and restores focus`, async ({
    page,
  }) => {
    await page.goto(`/${lang}/`);
    const opener = page.locator("header nav [data-command-trigger]").first();
    await opener.click();

    const dialog = page.locator("dialog[data-command-navigator]");
    await expect(dialog).toBeVisible();
    const close = dialog.locator("[data-command-close]");
    await expect(close).toHaveAccessibleName(CLOSE[lang]);
    await expect(close).toBeVisible();

    const bounds = await close.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.width).toBeGreaterThanOrEqual(44);
    expect(bounds!.height).toBeGreaterThanOrEqual(44);

    const originalURL = page.url();
    await close.click();
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
    expect(page.url()).toBe(originalURL);
  });
}

test("mobile: closing search returns focus to the menu summary", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/vi/");
  const menu = page.locator("header details");
  const summary = menu.locator("summary");
  await summary.click();
  await menu.locator("[data-command-trigger]").click();
  const dialog = page.locator("dialog[data-command-navigator]");
  await expect(dialog).toBeVisible();
  await dialog.locator("[data-command-close]").click();
  await expect(dialog).toBeHidden();
  await expect(menu).not.toHaveAttribute("open", "");
  await expect(summary).toBeFocused();
});

test("negative proof: Escape still dismisses search with the close control", async ({
  page,
}) => {
  await page.goto("/en/");
  await page.keyboard.press("Control+k");
  const dialog = page.locator("dialog[data-command-navigator]");
  await expect(dialog).toBeVisible();
  await expect(dialog.locator("[data-command-close]")).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
});
