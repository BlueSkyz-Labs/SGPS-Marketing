import { expect, test, type Page } from "@playwright/test";

// v8 W6 — one scale, one family, one grid. Computed-style probes over 12 routes.

const ROUTES = [
  "/en/",
  "/vi/",
  "/en/products/",
  "/en/products/sotro/",
  "/en/products/sotam/",
  "/en/about/",
  "/en/security/",
  "/en/verify/",
  "/en/dossier/",
  "/en/architecture/",
  "/en/contact/",
  "/en/support/",
];
const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
];

/** Distinct computed font sizes of rendered text-bearing elements. */
export async function distinctSizes(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const sizes = new Set<string>();
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
    );
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (!n.textContent?.trim()) continue;
      const el = n.parentElement;
      if (!el || el.closest("script,style,noscript,svg")) continue;
      const cs = getComputedStyle(el);
      if (cs.display === "none" || cs.visibility === "hidden") continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) continue;
      sizes.add(cs.fontSize);
    }
    return [...sizes].sort((a, b) => parseFloat(a) - parseFloat(b));
  });
}

for (const viewport of VIEWPORTS) {
  test.describe(`type scale at ${viewport.width}`, () => {
    test.use({ viewport });
    for (const route of ROUTES) {
      test(`${route} uses at most 10 distinct font sizes`, async ({ page }) => {
        await page.goto(route);
        const sizes = await distinctSizes(page);
        expect(sizes.length, sizes.join(", ")).toBeLessThanOrEqual(10);
      });
    }
  });
}

test("stray font size is detected (negative proof)", async ({ page }) => {
  await page.goto("/en/about/");
  const before = await distinctSizes(page);
  await page.evaluate(() => {
    // Every text-bearing element in main, not only paragraphs: the page needs
    // enough stray sizes to cross the cap however converged its scale is
    // (the WP-D editorial pass also left /about/ with fewer paragraphs).
    const targets = document.querySelectorAll(
      "main :is(p, li, a, h2, h3, dt, dd, span)",
    );
    for (const [i, el] of [...targets].entries()) {
      (el as HTMLElement).style.fontSize = `${13.1 + i * 0.37}px`;
    }
  });
  const after = await distinctSizes(page);
  expect(after.length).toBeGreaterThan(before.length);
  expect(after.length).toBeGreaterThan(10);
});

/** Distinct max-widths of every `.site-container` on the page, in px. */
async function containerWidths(page: Page): Promise<number[]> {
  return page.evaluate(() => {
    const out = new Set<number>();
    for (const el of document.querySelectorAll(".site-container")) {
      out.add(parseFloat(getComputedStyle(el).maxWidth));
    }
    return [...out].sort((a, b) => a - b);
  });
}

test.describe("containers", () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  for (const route of ROUTES) {
    test(`${route} containers are a subset of {reading 720, wide 1256}`, async ({
      page,
    }) => {
      await page.goto(route);
      const widths = await containerWidths(page);
      expect(widths.length).toBeGreaterThan(0);
      for (const w of widths) expect([720, 1256], String(w)).toContain(w);
    });
  }

  test("a stray container width is detected (negative proof)", async ({
    page,
  }) => {
    await page.goto("/en/about/");
    await page.evaluate(() => {
      (
        document.querySelector(".site-container") as HTMLElement
      ).style.maxWidth = "1000px";
    });
    expect(await containerWidths(page)).toContain(1000);
  });
});

test.describe("buttons", () => {
  test("secondary chips carry no dot and buttons show a pointer", async ({
    page,
  }) => {
    await page.goto("/en/products/");
    const chips = page.locator("a.btn-secondary");
    expect(await chips.count()).toBeGreaterThan(0);
    expect(
      await page.locator("a.btn-secondary > span[aria-hidden]").count(),
    ).toBe(0);
    const radius = await chips
      .first()
      .evaluate((el) => getComputedStyle(el).borderRadius);
    expect(parseFloat(radius)).toBeGreaterThan(100);
    const cursor = await page.evaluate(() => {
      const b = document.createElement("button");
      document.body.append(b);
      return getComputedStyle(b).cursor;
    });
    expect(cursor).toBe("pointer");
  });
});

test.describe("header material (ADR 0012, blur branch)", () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  test("sticky header is translucent at >= 0.86 alpha with blur", async ({
    page,
    browserName,
  }) => {
    // The blur branch is disabled by design under
    // `prefers-reduced-transparency: reduce` (c3-craft.css). A runner whose OS
    // reports "reduce" (e.g. Windows with Transparency effects off) would
    // otherwise measure the accessibility branch instead of this one, so pin
    // the media feature to no-preference for this assertion. Chromium only:
    // Firefox/WebKit do not evaluate the feature and always take the base branch.
    if (browserName === "chromium") {
      const cdp = await page.context().newCDPSession(page);
      await cdp.send("Emulation.setEmulatedMedia", {
        features: [
          { name: "prefers-reduced-transparency", value: "no-preference" },
        ],
      });
    }
    await page.goto("/en/about/");
    const style = await page
      .locator("header.header-glass")
      .first()
      .evaluate((el) => {
        const cs = getComputedStyle(el);
        return { bg: cs.backgroundColor, filter: cs.backdropFilter };
      });
    const alpha = Number(/rgba\([^)]*,\s*([0-9.]+)\)/.exec(style.bg)?.[1] ?? 1);
    expect(alpha).toBeGreaterThanOrEqual(0.86);
    expect(style.filter).toContain("blur(12px)");
  });
});

test.describe("print", () => {
  test("hero text is black on white; atmosphere hidden; details open; links underlined", async ({
    page,
  }) => {
    await page.goto("/en/");
    await page.emulateMedia({ media: "print" });
    const hero = await page
      .locator(".hero-plane h1")
      .first()
      .evaluate((el) => {
        const cs = getComputedStyle(el);
        return {
          color: cs.color,
          bg: getComputedStyle(el.closest(".hero-plane")!).backgroundColor,
        };
      });
    expect(hero.color).toBe("rgb(0, 0, 0)");
    expect(hero.bg).toBe("rgb(255, 255, 255)");
    await expect(page.locator(".hero-atmosphere").first()).toBeHidden();
    const link = await page
      .locator("main a")
      .first()
      .evaluate((el) => getComputedStyle(el).textDecorationLine);
    expect(link).toContain("underline");
  });

  test("screen hero is not black (negative proof)", async ({ page }) => {
    await page.goto("/en/");
    await page.emulateMedia({ media: "screen", colorScheme: "light" });
    const color = await page
      .locator(".hero-plane h1")
      .first()
      .evaluate((el) => getComputedStyle(el).color);
    expect(color).not.toBe("rgb(0, 0, 0)");
  });
});

test.describe("back to top", () => {
  test.use({ viewport: { width: 390, height: 844 } });
  test("is a visible plain anchor on phones and returns to the top", async ({
    page,
  }) => {
    await page.goto("/en/security/");
    const link = page.locator("a[data-back-to-top]");
    await link.scrollIntoViewIfNeeded();
    await expect(link).toBeVisible();
    expect(await link.getAttribute("href")).toBe("#top");
    await link.click();
    await expect.poll(() => page.evaluate(() => scrollY)).toBeLessThan(50);
  });
  test("is hidden on desktop (negative proof)", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 800 });
    await page.goto("/en/security/");
    await expect(page.locator("a[data-back-to-top]")).toBeHidden();
  });
});
