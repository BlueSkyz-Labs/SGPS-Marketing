import { expect, test } from "@playwright/test";

/**
 * UX audit wave 1 (non-visual fixes).
 * - D-03: a products-index thumbnail that starts inside the first viewport is
 *   the LCP candidate, so it must not be lazy and the first one is fetched at
 *   high priority; thumbnails below the fold stay lazy.
 * - A-05: the root 404 page is English with Vietnamese recovery text, so the
 *   Vietnamese runs carry lang="vi" (WCAG 3.1.2).
 */
const LANGS = ["en", "vi", "zh", "zh-hant"] as const;

type Thumb = { top: number; loading: string; priority: string | null };

/** Thumbnails that start in the first viewport yet are left lazy. */
export const lazyAboveFold = (thumbs: Thumb[], viewportHeight: number) =>
  thumbs.filter((t) => t.top < viewportHeight && t.loading === "lazy");

const readThumbs = (page: import("@playwright/test").Page) =>
  page.locator("[data-product-thumb] img").evaluateAll((imgs) =>
    imgs.map((img) => ({
      top: img.getBoundingClientRect().top + window.scrollY,
      loading: img.getAttribute("loading") ?? "auto",
      priority: img.getAttribute("fetchpriority"),
    })),
  );

for (const lang of LANGS) {
  for (const [w, h] of [
    [390, 844],
    [1440, 900],
  ] as const) {
    test(`${lang} products ${w}: no above-the-fold thumbnail is lazy`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: w, height: h });
      await page.goto(`/${lang}/products/`);
      const thumbs = await readThumbs(page);
      expect(thumbs.length).toBeGreaterThanOrEqual(2);
      expect(
        thumbs[0].top,
        "first thumbnail starts in the first viewport",
      ).toBeLessThan(h);
      expect(lazyAboveFold(thumbs, h)).toEqual([]);
      expect(thumbs[0].priority).toBe("high");
      expect(thumbs.slice(1).every((t) => t.priority === null)).toBe(true);
      // Only the first row (two columns from md up) loads eagerly.
      expect(thumbs.slice(2).every((t) => t.loading === "lazy")).toBe(true);
    });
  }
}

test("negative proof: a lazy thumbnail in the first viewport is reported", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en/products/");
  await page
    .locator("[data-product-thumb] img")
    .first()
    .evaluate((img) => img.setAttribute("loading", "lazy"));
  expect(lazyAboveFold(await readThumbs(page), 844)).toHaveLength(1);
});

test("root 404: Vietnamese recovery text and links are marked lang=vi", async ({
  page,
}) => {
  await page.goto("/404.html");
  expect(await page.locator("html").getAttribute("lang")).toBe("en");
  const unmarked = await page.locator("main").evaluate((main) => {
    const vi = /[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i;
    const out: string[] = [];
    const walker = document.createTreeWalker(main, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const text = n.textContent?.trim() ?? "";
      if (
        vi.test(text) &&
        n.parentElement?.closest("[lang]")?.getAttribute("lang") !== "vi"
      )
        out.push(text);
    }
    return out;
  });
  expect(unmarked).toEqual([]);
});

test("negative proof: removing lang=vi exposes the Vietnamese run", async ({
  page,
}) => {
  await page.goto("/404.html");
  const leaked = await page.locator("main").evaluate((main) => {
    for (const el of main.querySelectorAll('[lang="vi"]'))
      el.removeAttribute("lang");
    const vi = /[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i;
    return [...main.querySelectorAll("p, a")].filter(
      (el) =>
        vi.test(el.textContent ?? "") &&
        el.closest("[lang]")?.getAttribute("lang") !== "vi",
    ).length;
  });
  expect(leaked).toBeGreaterThan(0);
});
