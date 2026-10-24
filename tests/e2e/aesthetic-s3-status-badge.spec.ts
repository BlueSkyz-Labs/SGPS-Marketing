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
const ROUTES = ["", "products/", "products/sotro/", "about/"] as const;

interface Probe {
  total: number;
  offClass: string[];
  mismatches: string[];
  lowContrast: string[];
}

/** Violations of the single-badge invariant on the current page. */
async function probeBadges(page: Page): Promise<Probe> {
  const inkBackdrops = await measureInkBackdrops(page);
  return page.evaluate((inkBackdrops: number[][]) => {
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
    let inkIndex = 0;
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
      const fgRaw = toRgba(getComputedStyle(el).color);
      // Ink badges sit on a gradient: use the lightest pixel actually painted
      // behind the badge (worst case for light text), measured from a
      // screenshot with the badge's own ink hidden. Everything else uses the
      // nearest opaque ancestor backdrop.
      const bg =
        variant === "ink"
          ? (inkBackdrops[inkIndex++] ?? backdrop(el))
          : backdrop(el);
      // Composite a translucent foreground over its backdrop before measuring.
      const a = fgRaw[3];
      const fg = [0, 1, 2].map((i) => fgRaw[i] * a + bg[i] * (1 - a));
      if (ratio(fg, bg) < 4.5) out.lowContrast.push(`${variant}:${label}`);
    }
    // Same geometry across variants too: only colour may differ.
    const shapes = new Set([...byVariant.values()]);
    if (shapes.size > 1) out.mismatches.push("variants differ in geometry");
    return out;
  }, inkBackdrops);
}

/**
 * Lightest painted pixel behind each ink badge, in DOM order. The badge's text
 * and border are made transparent for the capture, then restored.
 */
async function measureInkBackdrops(page: Page): Promise<number[][]> {
  const badges = page.locator(".status-badge--ink");
  const count = await badges.count();
  const out: number[][] = [];
  for (let i = 0; i < count; i++) {
    const el = badges.nth(i);
    await el.scrollIntoViewIfNeeded();
    const prev = await el.evaluate((n) => {
      const h = n as HTMLElement;
      const saved = h.getAttribute("style");
      h.style.color = "transparent";
      h.style.borderColor = "transparent";
      return saved;
    });
    const png = (await el.screenshot()).toString("base64");
    await el.evaluate((n, saved) => {
      const h = n as HTMLElement;
      if (saved === null) h.removeAttribute("style");
      else h.setAttribute("style", saved);
    }, prev);
    out.push(
      await page.evaluate(async (b64) => {
        const img = new Image();
        img.src = `data:image/png;base64,${b64}`;
        await img.decode();
        const c = document.createElement("canvas");
        c.width = img.width;
        c.height = img.height;
        const ctx = c.getContext("2d", { willReadFrequently: true })!;
        ctx.drawImage(img, 0, 0);
        const d = ctx.getImageData(0, 0, c.width, c.height).data;
        let best = [0, 0, 0];
        let bestSum = -1;
        for (let k = 0; k < d.length; k += 4) {
          const sum = d[k] + d[k + 1] + d[k + 2];
          if (sum > bestSum) {
            bestSum = sum;
            best = [d[k], d[k + 1], d[k + 2], 1];
          }
        }
        return best;
      }, png),
    );
  }
  return out;
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

test.describe("S3 contrast guard", () => {
  test("negative proof: pale text on the light theme is flagged exactly once", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await open(page, "en", "products/", "light");
    expect((await probeBadges(page)).lowContrast).toEqual([]);
    await page.evaluate(() => {
      (
        document.querySelector("[data-product-status]") as HTMLElement
      ).style.color = "#cbd5e1";
    });
    expect((await probeBadges(page)).lowContrast.length).toBe(1);
  });

  test("negative proof: a translucent foreground is measured after compositing", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await open(page, "en", "products/", "light");
    await page.evaluate(() => {
      (
        document.querySelector("[data-product-status]") as HTMLElement
      ).style.color = "rgba(51, 65, 85, 0.25)";
    });
    expect((await probeBadges(page)).lowContrast.length).toBe(1);
  });

  test("negative proof: a pale ink-variant text on the real hero backdrop is flagged", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await open(page, "en", "", "light");
    expect((await probeBadges(page)).lowContrast).toEqual([]);
    await page.evaluate(() => {
      (
        document.querySelector(".status-badge--ink") as HTMLElement
      ).style.color = "#475569";
    });
    expect((await probeBadges(page)).lowContrast.length).toBe(1);
  });
});

test.describe("S3 product thumbnail edge", () => {
  const edges = (page: Page) =>
    page.evaluate(() => {
      const thumb = document.querySelector(".product-thumb")!;
      // G3 G-06: the index card is a hairline row whose visible rule is the
      // card's own border-top (--c4-hairline); the thumbnail edge is pinned to
      // that rendered rule, not to a token probe, so drift is caught.
      const row = thumb.closest(".product-card--ledger")!;
      return {
        thumb: getComputedStyle(thumb).borderTopColor,
        card: getComputedStyle(row).borderTopColor,
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

  test("negative proof: a thumb edge off the visible ledger rule is detected", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await open(page, "en", "products/", "light");
    await page.evaluate(() => {
      (
        document.querySelector(".product-thumb") as HTMLElement
      ).style.borderColor = "var(--border-hairline)";
    });
    const { thumb, card } = await edges(page);
    expect(thumb).not.toBe(card);
  });
});
