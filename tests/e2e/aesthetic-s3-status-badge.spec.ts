import { test, expect, type Page } from "@playwright/test";

/**
 * Aesthetic S3 (audit 2026-10-12, HIGH-2 and LOW-1): every product lifecycle
 * status badge is drawn by the one `.status-badge` class (plus the `--ink`
 * variant on ink scenes), so font-size, padding, radius and border width are
 * identical across the hero, product house, product cards and profile. The
 * product thumbnail edge uses the card's own hairline token. Truth-state chips
 * are claim states, not lifecycle status, and are intentionally outside this
 * guard. Each guard has a negative proof that breaks the invariant in the DOM.
 */

const LANGS = ["en", "vi", "zh", "zh-hant"] as const;
const THEMES = ["light", "dark"] as const;
const ROUTES = ["", "products/", "products/sotro/"] as const;

interface Probe {
  total: number;
  offClass: string[];
  mismatches: string[];
  lowContrast: string[];
}

/** Violations of the single-badge invariant on the current page. */
async function probeBadges(page: Page): Promise<Probe> {
  return page.evaluate(() => {
    const toRgba = (css: string): [number, number, number, number] => {
      const c = document.createElement("canvas");
      c.width = c.height = 1;
      const ctx = c.getContext("2d", { willReadFrequently: true })!;
      ctx.clearRect(0, 0, 1, 1);
      ctx.fillStyle = css;
      ctx.fillRect(0, 0, 1, 1);
      const d = ctx.getImageData(0, 0, 1, 1).data;
      return [d[0], d[1], d[2], d[3] / 255];
    };
    const lum = ([r, g, b]: number[]) => {
      const f = (v: number) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
      };
      return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
    };
    const ratio = (a: number[], b: number[]) => {
      const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
      return (hi + 0.05) / (lo + 0.05);
    };
    const backdrop = (el: Element): number[] => {
      for (let n: Element | null = el.parentElement; n; n = n.parentElement) {
        const bg = toRgba(getComputedStyle(n).backgroundColor);
        if (bg[3] > 0.99) return bg;
      }
      return toRgba(getComputedStyle(document.body).backgroundColor);
    };
    const badges = [...document.querySelectorAll("[data-product-status]")];
    const out: Probe = {
      total: badges.length,
      offClass: [],
      mismatches: [],
      lowContrast: [],
    };
    const geom = (el: Element) => {
      const s = getComputedStyle(el);
      return [
        s.fontSize,
        s.paddingTop,
        s.paddingRight,
        s.paddingBottom,
        s.paddingLeft,
        s.borderTopLeftRadius,
        s.borderTopWidth,
      ].join("|");
    };
    const byVariant = new Map<string, string>();
    for (const el of badges) {
      const label = el.textContent?.trim() ?? "?";
      if (!el.classList.contains("status-badge")) {
        out.offClass.push(label);
        continue;
      }
      const variant = el.classList.contains("status-badge--ink")
        ? "ink"
        : "default";
      const g = geom(el);
      const seen = byVariant.get(variant);
      if (seen === undefined) byVariant.set(variant, g);
      else if (seen !== g) out.mismatches.push(`${variant}:${label}`);
      const fg = toRgba(getComputedStyle(el).color);
      // Ink scenes keep a brand-ink base in both themes; the page backdrop
      // is used everywhere else.
      const bg =
        variant === "ink"
          ? toRgba(
              getComputedStyle(document.documentElement)
                .getPropertyValue("--brand-ink")
                .trim(),
            )
          : backdrop(el);
      if (ratio(fg, bg) < 4.5) out.lowContrast.push(`${variant}:${label}`);
    }
    // Same geometry across variants too: only colour may differ.
    const shapes = new Set([...byVariant.values()]);
    if (shapes.size > 1) out.mismatches.push("variants differ in geometry");
    return out;
  });
}

async function open(page: Page, lang: string, route: string, theme: string) {
  await page.addInitScript((mode) => {
    try {
      localStorage.setItem("blueskyz-theme", mode);
    } catch {
      /* storage unavailable: the page falls back to colorScheme */
    }
  }, theme);
  await page.emulateMedia({ colorScheme: theme as "light" | "dark" });
  await page.goto(`/${lang}/${route}`);
  await page.evaluate(() => document.fonts.ready);
}

test.describe("S3 one status badge", () => {
  for (const lang of LANGS)
    for (const theme of THEMES)
      for (const route of ROUTES) {
        test(`/${lang}/${route} ${theme}: every status badge is .status-badge with one geometry and AA text`, async ({
          page,
        }) => {
          await page.setViewportSize({ width: 1440, height: 900 });
          await open(page, lang, route, theme);
          const probe = await probeBadges(page);
          expect(probe.total).toBeGreaterThan(0);
          expect(probe.offClass).toEqual([]);
          expect(probe.mismatches).toEqual([]);
          expect(probe.lowContrast).toEqual([]);
        });
      }

  test("390px: home, products and profile keep one geometry", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const route of ROUTES) {
      await open(page, "vi", route, "dark");
      const probe = await probeBadges(page);
      expect(probe.offClass, route).toEqual([]);
      expect(probe.mismatches, route).toEqual([]);
    }
  });

  test("home carries the ink variant in the hero and the default variant in the product house", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await open(page, "en", "", "light");
    await expect(
      page.locator(
        "[data-hero-flagship] [data-product-status].status-badge--ink",
      ),
    ).toHaveCount(1);
    await expect(
      page.locator("[data-product-house] [data-product-status].status-badge"),
    ).not.toHaveCount(0);
  });

  test("negative proof: reverting one badge to a bespoke style is detected", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await open(page, "en", "products/", "light");
    expect((await probeBadges(page)).offClass).toEqual([]);
    // The old ProductCard badge: card radius, action colour, own padding.
    await page.evaluate(() => {
      const el = document.querySelector("[data-product-status]")!;
      el.classList.remove("status-badge");
      el.setAttribute(
        "style",
        "border:1px solid #cbd5e1;border-radius:0.75rem;padding:0.25rem 0.75rem;font-size:12px",
      );
    });
    expect((await probeBadges(page)).offClass.length).toBe(1);
  });

  test("negative proof: a geometry drift on a classed badge is detected", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await open(page, "en", "products/", "light");
    await page.evaluate(() => {
      const el = document.querySelectorAll<HTMLElement>(
        "[data-product-status]",
      )[1];
      el.style.padding = "2px 10px";
    });
    expect((await probeBadges(page)).mismatches.length).toBeGreaterThan(0);
  });
});

test.describe("S3 product thumbnail edge", () => {
  const edges = (page: Page) =>
    page.evaluate(() => {
      const thumb = document.querySelector(".product-thumb")!;
      const card = document.querySelector(".product-card")!;
      return {
        thumb: getComputedStyle(thumb).borderTopColor,
        card: getComputedStyle(card).borderTopColor,
      };
    });

  for (const theme of THEMES)
    test(`/en/products/ ${theme}: thumbnail border is the card's own hairline`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await open(page, "en", "products/", theme);
      const { thumb, card } = await edges(page);
      expect(thumb).toBe(card);
    });

  test("negative proof: the stronger control border is detected", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await open(page, "en", "products/", "light");
    await page.evaluate(() => {
      (
        document.querySelector(".product-thumb") as HTMLElement
      ).style.borderColor = "var(--border-subtle)";
    });
    const { thumb, card } = await edges(page);
    expect(thumb).not.toBe(card);
  });
});
