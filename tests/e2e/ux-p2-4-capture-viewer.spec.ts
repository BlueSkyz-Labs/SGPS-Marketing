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
  // Whether the browser then opens a window is browser behaviour (and not
  // reliable in CI); what the site owns is leaving the default alone. A
  // window-level listener runs after the viewer's handler, records whether
  // the default was prevented, then cancels navigation so the test stays on
  // the page.
  await page.evaluate(() => {
    window.addEventListener("click", (event) => {
      const target = event.target as Element | null;
      if (!target?.closest("a[data-capture-inspect]")) return;
      document.documentElement.dataset.testDefaultPrevented = String(
        event.defaultPrevented,
      );
      event.preventDefault();
    });
  });
  const trigger = page.locator("a[data-capture-inspect]").first();
  await trigger.scrollIntoViewIfNeeded();
  await trigger.click({ modifiers: ["Shift"] });
  await expect(page.locator("html")).toHaveAttribute(
    "data-test-default-prevented",
    "false",
  );
  await expect(page.locator("dialog[data-capture-viewer][open]")).toHaveCount(
    0,
  );
});

test("negative proof: a plain click is taken by the viewer", async ({
  page,
}) => {
  await page.goto("/en/products/sotro/");
  await page.waitForFunction(() =>
    document.documentElement.hasAttribute("data-capture-viewer-ready"),
  );
  await page.evaluate(() => {
    window.addEventListener("click", (event) => {
      const target = event.target as Element | null;
      if (!target?.closest("a[data-capture-inspect]")) return;
      document.documentElement.dataset.testDefaultPrevented = String(
        event.defaultPrevented,
      );
    });
  });
  const trigger = page.locator("a[data-capture-inspect]").first();
  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();
  await expect(page.locator("html")).toHaveAttribute(
    "data-test-default-prevented",
    "true",
  );
  await expect(page.locator("dialog[data-capture-viewer][open]")).toHaveCount(
    1,
  );
});

test("browser with broken showModal leaves the native image link available", async ({
  page,
}) => {
  await page.goto("/en/products/sotro/");
  await page.waitForFunction(() =>
    document.documentElement.hasAttribute("data-capture-viewer-ready"),
  );
  await page.evaluate(() => {
    // In-app browser emulation: dialog exists but invoking showModal fails.
    HTMLDialogElement.prototype.showModal = () => {
      throw new Error("modal unavailable");
    };
    window.addEventListener("click", (event) => {
      const target = event.target as Element | null;
      if (!target?.closest("a[data-capture-inspect]")) return;
      document.documentElement.dataset.testDefaultPrevented = String(
        event.defaultPrevented,
      );
      // Capture default behavior without opening a new tab in the test.
      event.preventDefault();
    });
  });
  const trigger = page.locator("a[data-capture-inspect]").first();
  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();
  await expect(page.locator("html")).toHaveAttribute(
    "data-test-default-prevented",
    "false",
  );
  await expect(trigger).toHaveAttribute("href", /\.webp$/);
  await expect(trigger).toHaveAttribute("target", "_blank");
  await expect(page.locator("dialog[data-capture-viewer][open]")).toHaveCount(0);
  await expect(page.locator("dialog[data-capture-viewer] img")).not.toHaveAttribute("src", /.+/);
});

test("browser without showModal also keeps the native image link", async ({
  page,
}) => {
  await page.goto("/en/products/sotro/");
  await page.waitForFunction(() =>
    document.documentElement.hasAttribute("data-capture-viewer-ready"),
  );
  await page.evaluate(() => {
    Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
      value: undefined,
      configurable: true,
    });
    window.addEventListener("click", (event) => {
      const target = event.target as Element | null;
      if (!target?.closest("a[data-capture-inspect]")) return;
      document.documentElement.dataset.testDefaultPrevented = String(
        event.defaultPrevented,
      );
      event.preventDefault();
    });
  });
  await page.locator("a[data-capture-inspect]").first().click();
  await expect(page.locator("html")).toHaveAttribute(
    "data-test-default-prevented",
    "false",
  );
  await expect(page.locator("dialog[data-capture-viewer][open]")).toHaveCount(0);
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
