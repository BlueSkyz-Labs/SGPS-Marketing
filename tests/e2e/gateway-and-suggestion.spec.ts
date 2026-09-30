import { expect, test, type Page } from "@playwright/test";

/**
 * Experience v6 S5 guards.
 *
 * 1. The root `/` language gateway is a branded static page: readable and
 *    styled with JavaScript disabled, scheme-correct at first paint (styles
 *    are inline in <head>, so no stylesheet has to arrive before the first
 *    paint), four native-name tiles, 44px targets, no cookies.
 * 2. The locale suggestion never overlays first-viewport content at 390x844.
 *
 * ADR 0009 behaviour (redirect logic, storage key) is covered by
 * language-switching.spec.ts and locale-suggestion.spec.ts and is untouched.
 */

const SCHEMES = {
  light: { background: "rgb(247, 248, 250)", text: "rgb(11, 16, 32)" },
  dark: { background: "rgb(11, 16, 32)", text: "rgb(255, 255, 255)" },
} as const;

for (const scheme of ["light", "dark"] as const) {
  test(`gateway is styled and readable with JS off (${scheme})`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      colorScheme: scheme,
      viewport: { width: 390, height: 844 },
    });
    try {
      const page = await context.newPage();
      await page.goto("/");
      const gateway = page.locator('nav[aria-label="Language"]');
      const links = gateway.getByRole("link");
      await expect(links).toHaveCount(4);
      await expect(page.locator("h1")).toHaveCount(1);
      // Native labels for the four live choices.
      await expect(links).toHaveText([
        "Tiếng Việt",
        "English",
        "简体中文",
        "繁體中文",
      ]);
      const tokens = SCHEMES[scheme];
      const facts = await page.evaluate(() => {
        const first = document.querySelector<HTMLElement>(
          "[data-language-choice]",
        )!;
        const style = getComputedStyle(first);
        return {
          fontFamily: style.fontFamily,
          textDecoration: style.textDecorationLine,
          body: getComputedStyle(document.body).backgroundColor,
          html: getComputedStyle(document.documentElement).backgroundColor,
          text: style.color,
          colorScheme: getComputedStyle(document.documentElement).colorScheme,
          overflow:
            document.documentElement.scrollWidth >
            document.documentElement.clientWidth,
        };
      });
      // Not the default serif: the site font stack is applied to the links.
      expect(facts.fontFamily).toContain("Inter Variable");
      expect(facts.fontFamily).toContain("sans-serif");
      expect(facts.textDecoration).toBe("none");
      expect(facts.html).toBe(tokens.background);
      expect(facts.body).toBe(tokens.background);
      expect(facts.text).toBe(tokens.text);
      expect(facts.colorScheme).toContain(scheme);
      expect(facts.overflow).toBe(false);
      // 44px targets.
      for (const link of await links.all()) {
        const box = await link.boundingBox();
        expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
        expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
      }
      expect(await context.cookies()).toEqual([]);
    } finally {
      await context.close();
    }
  });
}

test("gateway first paint needs no external stylesheet or script (no dark flash)", async ({
  page,
}) => {
  const html = await (await page.request.get("/")).text();
  const head = html.slice(0, html.indexOf("</head>"));
  // Inline styles in <head>: the scheme background exists before first paint.
  expect(head).toMatch(/<style[^>]*>[\s\S]*prefers-color-scheme: dark/);
  expect(head).toMatch(/name="color-scheme" content="light dark"/);
  expect(head).not.toMatch(/<link[^>]+rel="stylesheet"/);
  expect(head).not.toMatch(/<script/);
  // Search-engine contract unchanged: noindex gateway, no cookie, no hreflang.
  expect(head).toMatch(/name="robots" content="noindex, follow"/);
});

test("gateway with the redirect script blocked still paints dark at first paint", async ({
  browser,
}) => {
  const context = await browser.newContext({ colorScheme: "dark" });
  try {
    const page = await context.newPage();
    await page.route("**/*.js", (route) => route.abort());
    await page.goto("/");
    const bg = await page.evaluate(
      () => getComputedStyle(document.documentElement).backgroundColor,
    );
    expect(bg).toBe(SCHEMES.dark.background);
  } finally {
    await context.close();
  }
});

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}
const intersects = (a: Rect, b: Rect) =>
  a.x < b.x + b.width &&
  b.x < a.x + a.width &&
  a.y < b.y + b.height &&
  b.y < a.y + a.height;

/** Visible `main` content that sits (even partly) in the first viewport. */
async function firstViewportContent(page: Page): Promise<Rect[]> {
  return page.evaluate(() => {
    const height = window.innerHeight;
    const rects: Rect[] = [];
    for (const el of document.querySelectorAll(
      "main h1, main h2, main p, main a, main button, main img, main svg",
    )) {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < height)
        rects.push({ x: r.x, y: r.y, width: r.width, height: r.height });
    }
    return rects;
  });
}

for (const scheme of ["light", "dark"] as const) {
  test(`locale suggestion does not overlay first-viewport content at 390x844 (${scheme})`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      locale: "vi-VN",
      colorScheme: scheme,
      reducedMotion: "reduce",
      viewport: { width: 390, height: 844 },
    });
    try {
      const page = await context.newPage();
      await page.goto("/en/");
      const banner = page.locator("[data-locale-suggestion]");
      await expect(banner).toBeVisible();

      const position = await banner.evaluate(
        (el) => getComputedStyle(el).position,
      );
      expect(["static", "relative"]).toContain(position);

      const box = (await banner.boundingBox())!;
      const cta = (await page
        .locator("main")
        .getByRole("link")
        .first()
        .boundingBox())!;
      const content = await firstViewportContent(page);
      expect(content.length).toBeGreaterThan(0);
      expect(intersects(box, cta)).toBe(false);
      for (const rect of content) expect(intersects(box, rect)).toBe(false);

      // Negative proof: the previous bottom-fixed overlay placement is caught
      // by the very same predicate.
      await banner.evaluate((el) => {
        el.style.cssText =
          "position:fixed;left:16px;right:16px;bottom:16px;z-index:40";
      });
      const overlaid = (await banner.boundingBox())!;
      const hits = (await firstViewportContent(page)).filter((rect) =>
        intersects(overlaid, rect),
      );
      expect(hits.length).toBeGreaterThan(0);
    } finally {
      await context.close();
    }
  });
}

/** Sum of layout-shift entries (no recent input) observed from navigation. */
async function observeShifts(page: Page) {
  await page.addInitScript(() => {
    const w = window as unknown as { __cls: number };
    w.__cls = 0;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as unknown as {
        value: number;
        hadRecentInput: boolean;
      }[])
        if (!entry.hadRecentInput) w.__cls += entry.value;
    }).observe({ type: "layout-shift", buffered: true });
  });
}
const shifts = (page: Page) =>
  page.evaluate(() => (window as unknown as { __cls: number }).__cls);

for (const [width, height] of [
  [390, 844],
  [1440, 900],
] as const) {
  test(`locale suggestion causes no layout shift (${width}x${height})`, async ({
    browser,
  }) => {
    const context = await browser.newContext({
      locale: "vi-VN",
      viewport: { width, height },
    });
    try {
      const page = await context.newPage();
      await observeShifts(page);
      await page.goto("/en/", { waitUntil: "load" });
      // The Layout Instability API exists only in Chromium engines; WebKit and
      // Firefox report no entries at all, so a CLS number there proves nothing.
      // The chromium and mobile-chromium projects enforce this contract.
      const layoutShiftSupported = await page.evaluate(() =>
        (PerformanceObserver.supportedEntryTypes ?? []).includes(
          "layout-shift",
        ),
      );
      test.skip(
        !layoutShiftSupported,
        "Layout Instability API not implemented in this engine: NOT VERIFIED here",
      );
      await expect(page.locator("[data-locale-suggestion]")).toBeVisible();
      // Let fonts, images and any late insertion settle.
      await page.waitForTimeout(1500);
      expect(await shifts(page)).toBeLessThan(0.01);

      // Negative proof: inserting the same strip in flow AFTER first paint
      // (the previous behaviour) is measured as a real shift by this probe.
      await page.evaluate(
        () =>
          new Promise<void>((resolve) =>
            requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
          ),
      );
      const before = await shifts(page);
      await page.evaluate(() => {
        const strip = document.querySelector("[data-locale-suggestion]")!;
        const late = strip.cloneNode(true) as HTMLElement;
        late.removeAttribute("data-locale-suggestion");
        strip.after(late);
      });
      await page.waitForTimeout(500);
      expect((await shifts(page)) - before).toBeGreaterThan(0.01);
    } finally {
      await context.close();
    }
  });
}
