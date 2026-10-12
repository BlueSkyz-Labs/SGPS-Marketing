import { expect, test, type Browser } from "@playwright/test";

/**
 * W0 render-truth gap guards (horizon-sail plan, evidence
 * docs/evidence/2026-10-12-w0-render-truth.md).
 *
 * G3: the locale-suggestion strip may take space, but it must stay in flow,
 *     keep the hero H1 and primary action inside a phone's first viewport and
 *     cause no layout shift.
 * G4: Simplified/Traditional Chinese H1 must not split a word across lines at
 *     phone widths (text-wrap: balance ignores CJK word boundaries).
 *
 * Chromium only: line breaking and `text-wrap: pretty` are engine-specific.
 */
test.skip(
  ({ browserName }) => browserName !== "chromium",
  "engine-specific line breaking",
);

const BANNER_LOCALES = ["vi", "zh", "zh-hant"] as const;

async function phone(
  browser: Browser,
  height: number,
  width = 390,
  locale = "en-US",
) {
  const context = await browser.newContext({
    viewport: { width, height },
    locale,
    isMobile: true,
    hasTouch: true,
  });
  return { context, page: await context.newPage() };
}

for (const lang of BANNER_LOCALES) {
  for (const height of [844, 667]) {
    test(`G3 ${lang} @390x${height}: banner shown, H1 + primary action in first viewport, CLS 0, in flow`, async ({
      browser,
    }) => {
      const { context, page } = await phone(browser, height);
      try {
        // No input happens in this test, so every layout shift counts. Do not
        // filter on hadRecentInput: Chromium can flag a late-injected banner's
        // shift as input-related, which would hide a real hero jump.
        await page.addInitScript(() => {
          (window as unknown as { __cls: number }).__cls = 0;
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries() as unknown as {
              value: number;
            }[]) {
              (window as unknown as { __cls: number }).__cls += entry.value;
            }
          }).observe({ type: "layout-shift", buffered: true });
        });
        await page.goto(`/${lang}/`);
        const banner = page.locator("[data-locale-suggestion]");
        await expect(banner).toBeVisible();
        await page.waitForTimeout(800);

        const m = await page.evaluate(() => {
          const rect = (el: Element | null) => el?.getBoundingClientRect();
          const b = document.querySelector("[data-locale-suggestion]");
          const h1 = rect(document.querySelector("main h1"));
          const cta = rect(document.querySelector("main [data-hero-primary]"));
          return {
            position: b ? getComputedStyle(b).position : null,
            bannerHeight: rect(b)?.height ?? 0,
            h1Bottom: h1?.bottom ?? Infinity,
            ctaBottom: cta?.bottom ?? Infinity,
            vh: window.innerHeight,
            cls: (window as unknown as { __cls: number }).__cls,
          };
        });
        expect(["static", "relative"]).toContain(m.position);
        // Compact: at most two text lines of strip plus 44px actions.
        expect(m.bannerHeight).toBeLessThanOrEqual(100);
        expect(m.h1Bottom).toBeLessThanOrEqual(m.vh);
        expect(m.ctaBottom).toBeLessThanOrEqual(m.vh);
        expect(m.cls).toBe(0);
      } finally {
        await context.close();
      }
    });
  }
}

/** Text of each rendered line of an element's single text node. */
async function h1Lines(page: import("@playwright/test").Page) {
  return page.evaluate(() => {
    const h = document.querySelector("main h1") as HTMLElement;
    const lines: string[] = [];
    let current: number | null = null;
    let text = "";
    const walker = document.createTreeWalker(h, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const node = n as Text;
      for (let i = 0; i < node.length; i++) {
        const r = document.createRange();
        r.setStart(node, i);
        r.setEnd(node, i + 1);
        const top = Math.round(r.getBoundingClientRect().top);
        if (current !== null && top !== current) {
          lines.push(text);
          text = "";
        }
        current = top;
        text += node.data[i];
      }
    }
    lines.push(text);
    return lines;
  });
}

const PRODUCT_WORD = { zh: "产品", "zh-hant": "產品" } as const;

for (const lang of ["zh", "zh-hant"] as const) {
  for (const width of [390, 360]) {
    test(`G4 ${lang} @${width}: H1 keeps the word ${PRODUCT_WORD[lang]} on one line and never overflows`, async ({
      browser,
    }) => {
      const { context, page } = await phone(browser, 844, width, "en-US");
      try {
        await page.goto(`/${lang}/`);
        const lines = await h1Lines(page);
        const word = PRODUCT_WORD[lang];
        expect(lines.join("")).toContain(word);
        // A split word means one line ends with its first char and the next
        // line starts with its second char.
        for (let i = 0; i + 1 < lines.length; i++) {
          expect(
            lines[i]!.endsWith(word[0]!) && lines[i + 1]!.startsWith(word[1]!),
          ).toBe(false);
        }
        // Reflow safety (WCAG 1.4.10): no horizontal scroll.
        const sw = await page.evaluate(
          () => document.documentElement.scrollWidth,
        );
        expect(sw).toBeLessThanOrEqual(width);
        // Balanced wrapping is what split the word: it must stay off.
        const tw = await page.evaluate(
          () => getComputedStyle(document.querySelector("main h1")!).textWrap,
        );
        expect(tw).not.toBe("balance");
      } finally {
        await context.close();
      }
    });
  }
}

/**
 * W0 review B2: the visible "in development" badges on zh/zh-hant Products
 * must read as one line. (The section h2 with the same words is `sr-only`,
 * a 1px clipped box that is never painted, so it is excluded.)
 */
for (const lang of ["zh", "zh-hant"] as const) {
  for (const width of [360, 390, 1440]) {
    test(`B2 ${lang} @${width}: visible in-development badges stay on one line`, async ({
      browser,
    }) => {
      const { context, page } = await phone(browser, 900, width);
      try {
        await page.goto(`/${lang}/products/`);
        const badges = await page.evaluate(() => {
          const out: { lines: number; width: number }[] = [];
          const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
          );
          for (let n = walker.nextNode(); n; n = walker.nextNode()) {
            const node = n as Text;
            if (!/^\s*(开发中|開發中)\s*$/.test(node.data)) continue;
            const el = node.parentElement!;
            if (el.getBoundingClientRect().width <= 1) continue; // sr-only
            const range = document.createRange();
            range.selectNodeContents(node);
            const tops = new Set(
              [...range.getClientRects()].map((r) => Math.round(r.top)),
            );
            out.push({
              lines: tops.size,
              width: el.getBoundingClientRect().width,
            });
          }
          return out;
        });
        expect(badges.length).toBeGreaterThanOrEqual(2);
        for (const badge of badges) {
          expect(badge.lines).toBe(1);
          expect(badge.width).toBeGreaterThan(40);
        }
      } finally {
        await context.close();
      }
    });
  }
}
