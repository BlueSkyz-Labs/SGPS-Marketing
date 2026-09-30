import { expect, test, type Page } from "@playwright/test";

/**
 * Regression guard: the craft provenance story on /{lang}/security/ sits on the
 * page surface, which follows the theme. Its body copy was authored as
 * `porcelain @ 82%` (a dark-surface colour), so in light mode it rendered
 * near-white on a near-white page. This spec asserts the WCAG 1.4.3 floor
 * (4.5:1) between each text element's computed colour and its effective
 * background, in both OS colour schemes and every locale.
 */

const LANGS = ["en", "vi", "zh", "zh-hant"] as const;
const SCHEMES = ["light", "dark"] as const;
const FLOOR = 4.5;

// Body-text selectors on the security page. `.c4-craft__text` is the P0 target.
const SELECTORS = [
  ".c4-craft__text",
  ".c4-craft__heading",
  ".c4-craft__evidence-link",
  "main p",
] as const;

interface Sample {
  selector: string;
  text: string;
  ratio: number;
}

// Every other C4 surface authored with the same porcelain-alpha text colour.
const C4_ROUTES = [
  "/en/",
  "/en/editions/",
  "/en/editions/trust-foundations/",
  "/en/dossier/",
  "/en/dossier/print/",
  "/en/decision-room/",
  "/en/architecture/",
] as const;
const C4_SELECTORS = ["[class*=c4-]", "[class*=decision-room]"] as const;

async function measure(
  page: Page,
  selectors: readonly string[],
): Promise<Sample[]> {
  return page.evaluate<Sample[], readonly string[]>((selectors) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
    // Resolve any CSS colour (incl. color-mix / color()) to sRGBA.
    const rgba = (css: string): [number, number, number, number] => {
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = "#000";
      ctx.fillStyle = css;
      ctx.fillRect(0, 0, 1, 1);
      const d = ctx.getImageData(0, 0, 1, 1).data;
      return [d[0], d[1], d[2], d[3] / 255];
    };
    const over = (
      top: [number, number, number, number],
      bottom: [number, number, number],
    ): [number, number, number] => [
      top[0] * top[3] + bottom[0] * (1 - top[3]),
      top[1] * top[3] + bottom[1] * (1 - top[3]),
      top[2] * top[3] + bottom[2] * (1 - top[3]),
    ];
    const lum = ([r, g, b]: number[]) => {
      const f = (v: number) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const effectiveBackground = (el: Element): [number, number, number] => {
      const layers: [number, number, number, number][] = [];
      for (let node: Element | null = el; node; node = node.parentElement) {
        const bg = rgba(getComputedStyle(node).backgroundColor);
        if (bg[3] > 0) layers.push(bg);
        if (bg[3] === 1) break;
      }
      // Canvas default when nothing is opaque: the UA canvas is white.
      let base: [number, number, number] = [255, 255, 255];
      for (const layer of layers.reverse()) base = over(layer, base);
      return base;
    };

    const out: { selector: string; text: string; ratio: number }[] = [];
    for (const selector of selectors) {
      for (const el of Array.from(document.querySelectorAll(selector))) {
        if (!(el instanceof HTMLElement)) continue;
        const rect = el.getBoundingClientRect();
        if (!rect.width || !rect.height || !el.textContent?.trim()) {
          continue;
        }
        const bg = effectiveBackground(el);
        const fg = over(rgba(getComputedStyle(el).color), bg);
        const l1 = lum(fg);
        const l2 = lum(bg);
        const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
        out.push({
          selector,
          text: (el.textContent ?? "").trim().slice(0, 40),
          ratio: Math.round(ratio * 100) / 100,
        });
      }
    }
    return out;
  }, selectors);
}

for (const scheme of SCHEMES) {
  for (const lang of LANGS) {
    test(`/${lang}/security/ body text meets 4.5:1 in ${scheme} mode`, async ({
      browser,
    }) => {
      const context = await browser.newContext({ colorScheme: scheme });
      const page = await context.newPage();
      await page.goto(`/${lang}/security/`);
      await expect(page.locator(".c4-craft__text").first()).toBeVisible();
      const samples = await measure(page, SELECTORS);
      expect(
        samples.filter((s) => s.selector === ".c4-craft__text").length,
      ).toBeGreaterThan(0);
      const failures = samples.filter((s) => s.ratio < FLOOR);
      expect(failures, JSON.stringify(failures, null, 2)).toEqual([]);
      await context.close();
    });
  }

  test(`C4 editorial surfaces meet 4.5:1 in ${scheme} mode`, async ({
    browser,
  }) => {
    const context = await browser.newContext({ colorScheme: scheme });
    const page = await context.newPage();
    const failures: (Sample & { route: string })[] = [];
    for (const route of C4_ROUTES) {
      await page.goto(route);
      const samples = await measure(page, C4_SELECTORS);
      for (const sample of samples) {
        if (sample.ratio < FLOOR) failures.push({ route, ...sample });
      }
    }
    expect(failures, JSON.stringify(failures, null, 2)).toEqual([]);
    await context.close();
  });
}
