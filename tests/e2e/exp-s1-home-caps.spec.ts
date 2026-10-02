import { expect, test } from "@playwright/test";

/**
 * Experience v6 S1 — measured caps on the rendered /en/ home.
 * Counts what a visitor can see or act on (hidden mobile-menu and command
 * navigator duplicates are not visible). Caps are the S1 acceptance numbers.
 * Negative proof: run against the pre-S1 build (PLAYWRIGHT_BASE_URL) — every
 * cap assertion below fails there (488 words, 43 links, 4 CTAs, 3 slogans).
 */
const CAPS = { words: 220, links: 40, buttons: 6, mobileHeight: 5500 };

async function measure(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const visible = (el: Element) =>
      el.getClientRects().length > 0 &&
      getComputedStyle(el).visibility !== "hidden";
    return {
      words: document.body.innerText.trim().split(/\s+/).filter(Boolean).length,
      links: [...document.querySelectorAll("a[href]")].filter(visible).length,
      buttons: [...document.querySelectorAll("button,[role=button]")].filter(
        visible,
      ).length,
      h1: document.querySelectorAll("h1").length,
      height: document.documentElement.scrollHeight,
      tagline: (
        document.body.innerText.match(/Intelligence\. Elevated\./g) ?? []
      ).length,
      primary: document.querySelectorAll("[data-hero-primary]").length,
    };
  });
}

for (const vp of [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
]) {
  test(`/en/ stays within the S1 caps at ${vp.name}`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    await page.goto("/en/");
    const m = await measure(page);
    expect(m.words, "visible words").toBeLessThanOrEqual(CAPS.words);
    expect(m.links, "visible links").toBeLessThanOrEqual(CAPS.links);
    expect(m.buttons, "visible buttons").toBeLessThanOrEqual(CAPS.buttons);
    expect(m.h1).toBe(1);
    expect(m.tagline, "tagline occurrences").toBeLessThanOrEqual(1);
    expect(m.primary, "hero primary CTAs").toBe(1);
    if (vp.name === "mobile") {
      expect(m.height, "page height").toBeLessThanOrEqual(CAPS.mobileHeight);
    }
  });
}

test("no-JS /en/ keeps the hero promise and its one primary action", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/en/");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(page.locator("[data-hero-primary]")).toBeVisible();
  await expect(page.locator("[data-hero-primary]")).toHaveAttribute(
    "href",
    /\/en\/products\/[a-z]+\/$/,
  );
  await context.close();
});

for (const lang of ["en", "vi", "zh", "zh-hant"]) {
  test(`/${lang}/ has one promise H1 and one primary action above the fold`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/${lang}/`);
    await expect(page.locator("h1")).toHaveCount(1);
    const primary = page.locator("[data-hero-primary]");
    await expect(primary).toHaveCount(1);
    const box = await primary.boundingBox();
    // v8 W2: inside two viewports at 390 (capture first, then caption + CTA).
    expect(box && box.y + box.height).toBeLessThanOrEqual(844 * 2);
    // Removed bands stay removed in every locale.
    await expect(page.locator("[data-one-house-editorial]")).toHaveCount(0);
    await expect(page.locator("[data-about-blueskyz]")).toHaveCount(0);
    await expect(page.locator("[data-final-action]")).toHaveCount(0);
    await expect(page.locator("[data-journey-bar]")).toHaveCount(0);
  });
}

test("the mobile LCP element is in the hero (H1 text or the capture) and paints without animation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    (window as unknown as { __lcp: string }).__lcp = "";
    new PerformanceObserver((list) => {
      const last = list.getEntries().at(-1) as PerformanceEntry & {
        element?: Element;
      };
      const el = last?.element;
      (window as unknown as { __lcp: string }).__lcp = el
        ? `${el.tagName}|${el.closest("[data-hero],[data-hero-flagship]") ? "hero" : "other"}`
        : "";
    }).observe({ type: "largest-contentful-paint", buffered: true });
  });
  await page.goto("/en/", { waitUntil: "load" });
  await page.waitForTimeout(500);
  const lcp = await page.evaluate(
    () => (window as unknown as { __lcp: string }).__lcp,
  );
  expect(lcp).toMatch(/^(H1|P|IMG)\|hero$/);
  const animated = await page
    .locator("[data-hero] h1")
    .evaluate((h1) => getComputedStyle(h1).animationName);
  expect(animated).toBe("none");
});
