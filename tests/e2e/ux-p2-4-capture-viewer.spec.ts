import { expect, test } from "@playwright/test";

/**
 * UX P2-4 (C-A6/A8): capture links open an in-page viewer instead of a bare
 * image. No-JS keeps the plain href fallback.
 */
const CLOSE = {
  en: "Close",
  vi: "Đóng",
  zh: "关闭",
  "zh-hant": "關閉",
} as const;

for (const lang of ["en", "vi", "zh", "zh-hant"] as const) {
  test(`${lang}: viewer opens, shows captured alt, Esc closes, focus returns`, async ({
    page,
  }) => {
    await page.goto(`/${lang}/products/sotro/`);
    const links = page.locator("a[data-capture-inspect]");
    const trigger = links.first();
    await trigger.scrollIntoViewIfNeeded();
    const href = await trigger.getAttribute("href");
    const alt = await trigger.getAttribute("data-viewer-alt");
    expect(alt).toBeTruthy();
    await page.waitForFunction(() =>
      document.documentElement.hasAttribute("data-capture-viewer-ready"),
    );
    await trigger.focus();
    await trigger.click();
    const dialog = page.locator("dialog[data-capture-viewer]");
    await expect(dialog).toBeVisible();
    expect(page.url()).not.toMatch(/\.webp$/);
    await expect(dialog.locator("img")).toHaveAttribute("src", href!);
    await expect(dialog.locator("img")).toHaveAttribute("alt", alt!);
    const close = dialog.locator("[data-capture-viewer-close]");
    await expect(close).toHaveText(CLOSE[lang]);
    await expect(close).toBeFocused();
    // Focus stays trapped inside the modal.
    await page.keyboard.press("Tab");
    await expect(close).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    // Close button path.
    await trigger.click();
    await expect(dialog).toBeVisible();
    await close.click();
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });
}

test("no-JS fallback: links keep an image href and open in a new tab", async ({
  browser,
}) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto("/en/products/sotro/");
  const links = page.locator("a[data-capture-inspect]");
  expect(await links.count()).toBeGreaterThanOrEqual(10);
  await expect(links.first()).toHaveAttribute("href", /\.webp$/);
  await expect(links.first()).toHaveAttribute("target", "_blank");
  await expect(page.locator("dialog[data-capture-viewer]")).toHaveCount(0);
  await ctx.close();
});

test("modifier-click is left to the browser (no viewer)", async ({ page }) => {
  await page.goto("/en/products/sotro/");
  await page.waitForFunction(() =>
    document.documentElement.hasAttribute("data-capture-viewer-ready"),
  );
  const trigger = page.locator("a[data-capture-inspect]").first();
  await trigger.scrollIntoViewIfNeeded();
  const popup = page.context().waitForEvent("page");
  await trigger.click({ modifiers: ["Shift"] });
  await (await popup).close();
  await expect(page.locator("dialog[data-capture-viewer][open]")).toHaveCount(
    0,
  );
});

test("negative proof: a link without the capture marker never opens the viewer", async ({
  page,
}) => {
  await page.goto("/en/products/sotro/");
  await page.waitForFunction(() =>
    document.documentElement.hasAttribute("data-capture-viewer-ready"),
  );
  await page.evaluate(() => {
    const a = document.createElement("a");
    a.id = "plain";
    a.href = "#plain-target";
    a.textContent = "plain";
    document.body.prepend(a);
  });
  await page.locator("#plain").click();
  await expect(page.locator("dialog[data-capture-viewer]")).toHaveCount(0);
});
