import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Browser } from "@playwright/test";

const KEY = "blueskyz.ui.language";
const banner = (page: import("@playwright/test").Page) =>
  page.getByRole("region", { name: "Xem trang bằng Tiếng Việt?" });

async function viPage(
  browser: Browser,
  options: { javaScriptEnabled?: boolean; reducedMotion?: "reduce" } = {},
) {
  const context = await browser.newContext({ locale: "vi-VN", ...options });
  return { context, page: await context.newPage() };
}

test("a vi-VN browser on /en/ sees the suggestion with a link to /vi/", async ({
  browser,
}) => {
  const { context, page } = await viPage(browser);
  try {
    await page.goto("/en/about/");
    await expect(banner(page)).toBeVisible();
    await expect(
      banner(page).getByRole("link", { name: "Chuyển sang Tiếng Việt" }),
    ).toHaveAttribute("href", "/vi/about/");
    await expect(
      banner(page).getByRole("button", { name: "Giữ English" }),
    ).toBeVisible();
    // Never an automatic redirect, and nothing stored just by looking.
    await expect(page).toHaveURL(/\/en\/about\/$/);
    expect(await page.evaluate((k) => localStorage.getItem(k), KEY)).toBeNull();
    // 44px targets.
    for (const control of await banner(page).locator("a, button").all()) {
      const box = await control.boundingBox();
      expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
    }
  } finally {
    await context.close();
  }
});

test("accepting navigates and stores the suggested language", async ({
  browser,
}) => {
  const { context, page } = await viPage(browser);
  try {
    await page.goto("/en/");
    await banner(page)
      .getByRole("link", { name: "Chuyển sang Tiếng Việt" })
      .click();
    await expect(page).toHaveURL(/\/vi\/$/);
    expect(await page.evaluate((k) => localStorage.getItem(k), KEY)).toBe("vi");
    await expect(banner(page)).toHaveCount(0);
  } finally {
    await context.close();
  }
});

test("dismissal stores the current language, restores focus, and persists", async ({
  browser,
}) => {
  const { context, page } = await viPage(browser);
  try {
    await page.goto("/en/");
    await banner(page).getByRole("button", { name: "Giữ English" }).click();
    await expect(banner(page)).toHaveCount(0);
    expect(await page.evaluate((k) => localStorage.getItem(k), KEY)).toBe("en");
    await expect(page.locator("#main-content")).toBeFocused();
    // Only the one key exists, and no cookie was set.
    expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([KEY]);
    expect(await context.cookies()).toEqual([]);
    await page.reload();
    await page.goto("/en/about/");
    await expect(banner(page)).toHaveCount(0);
  } finally {
    await context.close();
  }
});

test("an explicit stored choice suppresses the banner", async ({ browser }) => {
  const { context, page } = await viPage(browser);
  try {
    await page.addInitScript((k) => window.localStorage.setItem(k, "en"), KEY);
    await page.goto("/en/");
    await expect(page.locator("main")).toBeVisible();
    await expect(banner(page)).toHaveCount(0);
  } finally {
    await context.close();
  }
});

test("no banner when the browser language matches the page, or is unknown", async ({
  browser,
}) => {
  const { context, page } = await viPage(browser);
  try {
    await page.goto("/vi/");
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("[data-locale-suggestion]")).toHaveCount(0);
  } finally {
    await context.close();
  }
  const fr = await browser.newContext({ locale: "fr-FR" });
  try {
    const frPage = await fr.newPage();
    await frPage.goto("/en/");
    await expect(frPage.locator("main")).toBeVisible();
    await expect(frPage.locator("[data-locale-suggestion]")).toHaveCount(0);
  } finally {
    await fr.close();
  }
});

test("no JavaScript: banner absent, page fully usable", async ({ browser }) => {
  const { context, page } = await viPage(browser, { javaScriptEnabled: false });
  try {
    await page.goto("/en/");
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("[data-locale-suggestion]")).toHaveCount(0);
  } finally {
    await context.close();
  }
});

test("makes no network request of its own and sets no cookie", async ({
  browser,
}) => {
  const { context, page } = await viPage(browser);
  try {
    await page.goto("/en/");
    await expect(banner(page)).toBeVisible();
    const seen: string[] = [];
    page.on("request", (request) => seen.push(request.url()));
    await banner(page).getByRole("button", { name: "Giữ English" }).click();
    expect(seen).toEqual([]);
    expect(await context.cookies()).toEqual([]);
  } finally {
    await context.close();
  }
});

for (const scheme of ["light", "dark"] as const) {
  test(`axe clean with the banner open (${scheme})`, async ({ browser }) => {
    const context = await browser.newContext({
      locale: "vi-VN",
      colorScheme: scheme,
      reducedMotion: "reduce",
    });
    try {
      const page = await context.newPage();
      await page.goto("/en/");
      await expect(banner(page)).toBeVisible();
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(results.violations).toEqual([]);
    } finally {
      await context.close();
    }
  });
}
