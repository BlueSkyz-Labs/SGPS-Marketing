import { expect, test } from "@playwright/test";

/**
 * Mobile PageSpeed sweep 2026-10-26 (Lighthouse 13, all 89 sitemap URLs).
 * - The product hero capture reaches the first phone viewport and was the
 *   measured LCP element on Sổ Tâm, so it is not lazy and is high priority.
 * - Guide shots, journal figures and the author portrait offer phone-sized
 *   derivatives, so a 412 px phone no longer fetches the 1920/1200/256 px cut.
 * - The header lockup is an image: the old letter-spacing animation drew
 *   nothing and forced a layout every frame (non-composited animation).
 */

type Img = { srcset: string; sizes: string; loading: string; priority: string };

const readImgs = (page: import("@playwright/test").Page, selector: string) =>
  page.locator(selector).evaluateAll((imgs) =>
    imgs.map((img) => ({
      srcset: img.getAttribute("srcset") ?? "",
      sizes: img.getAttribute("sizes") ?? "",
      loading: img.getAttribute("loading") ?? "auto",
      priority: img.getAttribute("fetchpriority") ?? "auto",
    })),
  );

/** Widths an `<img srcset>` offers. */
export const srcsetWidths = (srcset: string) =>
  [...srcset.matchAll(/\s(\d+)w(?:,|$)/g)].map((m) => Number(m[1]));

/** True when the image offers a candidate no wider than `max` px. */
export const offersPhoneCut = (img: Img, max: number) =>
  img.sizes !== "" && srcsetWidths(img.srcset).some((w) => w <= max);

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
});

for (const slug of ["sotam", "vungtaylai"]) {
  test(`${slug} hero capture is eager and high priority`, async ({ page }) => {
    await page.goto(`/en/products/${slug}/`);
    const [art] = await readImgs(page, ".phero__art img");
    expect(art).toBeDefined();
    expect(art.loading).not.toBe("lazy");
    expect(art.priority).toBe("high");
  });
}

test("guide shots offer 480/768 px derivatives", async ({ page }) => {
  await page.goto("/en/products/sotro/guide/");
  const shots = await readImgs(page, ".guide__shot img");
  expect(shots.length).toBeGreaterThanOrEqual(4);
  for (const shot of shots) expect(offersPhoneCut(shot, 768)).toBe(true);
});

test("journal figures offer an 800 px cut and the portrait a 128 px cut", async ({
  page,
}) => {
  await page.goto("/en/journal/so-tro-xem-truoc/");
  const figures = await readImgs(page, ".journal-figure__img");
  expect(figures.length).toBe(2);
  for (const fig of figures) expect(srcsetWidths(fig.srcset)).toContain(800);
  const portraits = await readImgs(
    page,
    ".journal-post__byline-portrait, .journal-author__avatar",
  );
  expect(portraits.length).toBe(2);
  for (const p of portraits) expect(offersPhoneCut(p, 128)).toBe(true);
});

test("header lockup runs no animation", async ({ page }) => {
  await page.goto("/en/");
  const name = await page
    .locator("header .brand-lockup")
    .first()
    .evaluate((el) => getComputedStyle(el).animationName);
  expect(name).toBe("none");
});

test("negative proof: a master-only image is reported", () => {
  const master: Img = {
    srcset: "",
    sizes: "",
    loading: "lazy",
    priority: "auto",
  };
  expect(offersPhoneCut(master, 768)).toBe(false);
  expect(
    offersPhoneCut({ ...master, srcset: "/a.webp 1920w", sizes: "100vw" }, 768),
  ).toBe(false);
  expect(
    offersPhoneCut(
      { ...master, srcset: "/a-768.webp 768w, /a.webp 1920w", sizes: "100vw" },
      768,
    ),
  ).toBe(true);
});
