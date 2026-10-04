import { expect, test, type Page } from "@playwright/test";

/**
 * UI upgrade WP-D (F3, F12): inner-page display hierarchy and the editorial
 * trust pages.
 *
 * F3: from 768 px the page H1 is strictly larger than every section H2 on the
 * same page (it was 32 px, the same as the H2s). On phones it may share the
 * 32 px display step.
 * F12: /security/ and /privacy/ render their labelled statements as a
 * definition list whose label (`dt`) precedes its body (`dd`) in the DOM and on
 * screen at every width; the About eyebrow that repeated the H1 is gone.
 * Negative proofs break each invariant in the page and show the probe fails.
 */
const LANGS = ["en", "vi", "zh", "zh-hant"] as const;
const H1_ROUTES = ["about", "security", "privacy", "404"] as const;

async function hierarchy(page: Page) {
  return page.evaluate(() => {
    const size = (el: Element) => parseFloat(getComputedStyle(el).fontSize);
    const h1 = document.querySelector("main h1");
    const h2s = [...document.querySelectorAll("main h2")].filter(
      (el) => (el as HTMLElement).offsetParent !== null,
    );
    return {
      h1: h1 ? size(h1) : 0,
      maxH2: Math.max(0, ...h2s.map(size)),
    };
  });
}

/** Every dt sits before its dd in the DOM and is not painted after it. */
async function factOrder(page: Page) {
  return page.evaluate(() => {
    const rows = [...document.querySelectorAll("main dl > div")];
    return rows.map((row) => {
      const dt = row.querySelector(":scope > dt");
      const dd = row.querySelector(":scope > dd");
      if (!dt || !dd) return { ok: false, why: "missing dt/dd" };
      const domOrder =
        dt.compareDocumentPosition(dd) & Node.DOCUMENT_POSITION_FOLLOWING;
      const a = dt.getBoundingClientRect();
      const b = dd.getBoundingClientRect();
      // Stacked: dd below dt. Side by side: dd right of dt on the same row.
      const visual =
        b.top >= a.bottom - 1 || (b.left >= a.right - 1 && b.top >= a.top - 4);
      return { ok: Boolean(domOrder) && visual, why: `${a.top}/${b.top}` };
    });
  });
}

test.describe("F3 page H1 outranks section H2 from 768 px", () => {
  for (const width of [768, 1440]) {
    test.describe(`${width} px`, () => {
      test.use({ viewport: { width, height: 900 } });
      for (const lang of LANGS) {
        for (const route of H1_ROUTES) {
          test(`/${lang}/${route}/`, async ({ page }) => {
            await page.goto(`/${lang}/${route}/`);
            const { h1, maxH2 } = await hierarchy(page);
            expect(h1).toBeGreaterThanOrEqual(44);
            expect(h1).toBeGreaterThan(maxH2);
          });
        }
      }
    });
  }

  test("phones keep the 32 px display step", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/en/security/");
    expect((await hierarchy(page)).h1).toBe(32);
  });

  test("negative proof: a flattened H1 fails the probe", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/en/about/");
    await page.evaluate(() => {
      (document.querySelector("main h1") as HTMLElement).style.fontSize =
        "var(--size-7)";
      for (const h2 of document.querySelectorAll("main h2"))
        (h2 as HTMLElement).style.fontSize = "var(--size-7)";
    });
    const { h1, maxH2 } = await hierarchy(page);
    expect(h1 > maxH2 && h1 >= 44).toBe(false);
  });
});

test.describe("F12 trust facts keep reading order", () => {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 1440, height: 900 },
  ]) {
    test.describe(`${viewport.width} px`, () => {
      test.use({ viewport });
      for (const lang of LANGS) {
        for (const [route, rows] of [
          ["security", 3],
          ["privacy", 2],
        ] as const) {
          test(`/${lang}/${route}/`, async ({ page }) => {
            await page.goto(`/${lang}/${route}/`);
            const order = await factOrder(page);
            expect(order).toHaveLength(rows);
            for (const row of order) expect(row.ok, row.why).toBe(true);
          });
        }
      }
    });
  }

  test("negative proof: a body painted above its label is caught", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/en/security/");
    await page.evaluate(() => {
      const row = document.querySelector("main dl > div") as HTMLElement;
      row.style.display = "flex";
      row.style.flexDirection = "column-reverse";
    });
    const order = await factOrder(page);
    expect(order.some((row) => !row.ok)).toBe(true);
  });

  test("the security lead column stays in view beside the facts from 1024 px", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/en/security/");
    const h1 = await page.locator("main h1").boundingBox();
    const dl = await page.locator("main dl").boundingBox();
    expect(dl!.x).toBeGreaterThan(h1!.x + 300);
    await page.setViewportSize({ width: 390, height: 844 });
    const h1m = await page.locator("main h1").boundingBox();
    const dlm = await page.locator("main dl").boundingBox();
    expect(dlm!.y).toBeGreaterThan(h1m!.y + h1m!.height);
  });
});

test.describe("F12 About header", () => {
  for (const lang of LANGS) {
    test(`/${lang}/about/ has no eyebrow repeating the H1`, async ({
      page,
    }) => {
      await page.goto(`/${lang}/about/`);
      await expect(page.locator("main .page-header__eyebrow")).toHaveCount(0);
    });
  }

  test("negative proof: the eyebrow probe sees a PageHeader eyebrow", async ({
    page,
  }) => {
    await page.goto("/en/404/");
    await expect(page.locator("main .page-header__eyebrow")).toHaveCount(1);
  });
});
