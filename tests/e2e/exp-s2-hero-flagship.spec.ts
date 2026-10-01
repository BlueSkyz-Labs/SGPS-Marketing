import { expect, test } from "@playwright/test";
import { hasPublicProducts } from "./product-helpers.ts";

/**
 * Experience v6 S2 — brand + flagship hero (Owner 2026-10-01).
 * H1 = the existing localized site proposition; immediately below, the Sổ Trọ
 * flagship with a real, labelled capture, name, status chip, registry
 * description and ONE primary action into the profile page.
 * Negative proof: the S1 build puts the registry job line in the H1 and has no
 * capture, so the H1 and capture assertions fail there.
 */
const H1 = {
  en: "We build intelligent products that empower people and elevate the way work gets done.",
  vi: "Chúng tôi xây dựng những sản phẩm thông minh để trao quyền cho con người và nâng tầm cách công việc được thực hiện.",
  zh: "我们打造智能化产品，赋能个人并提升工作方式。",
  "zh-hant": "我們打造智慧化產品，賦能個人並提升工作方式。",
} as const;

for (const lang of Object.keys(H1) as (keyof typeof H1)[]) {
  test(`/${lang}/ hero: promise H1, labelled capture, one profile CTA in the first screens`, async ({
    page,
  }) => {
    test.skip(!hasPublicProducts, "No published hero product is available");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/${lang}/`);

    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toHaveText(H1[lang]);

    const hero = page.locator("[data-hero-flagship]");
    await expect(hero).toHaveCount(1);
    await expect(hero.locator("[data-product-status]")).toBeVisible();

    const primary = page.locator("[data-hero-primary]");
    await expect(primary).toHaveCount(1);
    await expect(primary).toHaveAttribute(
      "href",
      new RegExp(`^/${lang}/products/sotro/$`),
    );
    const cta = await primary.boundingBox();
    expect(
      cta && cta.y + cta.height,
      "CTA inside first viewport",
    ).toBeLessThanOrEqual(844);

    const figure = hero.locator("[data-flagship-capture]");
    const img = figure.locator("img");
    await expect(figure.locator("figcaption")).toBeVisible();
    await expect(img).toHaveAttribute("fetchpriority", "high");
    await expect(img).not.toHaveAttribute("loading", "lazy");
    await expect(img).toHaveAttribute("width", /^\d+$/);
    await expect(img).toHaveAttribute("height", /^\d+$/);
    await expect(img).toHaveAttribute("alt", /.{10,}/);
    await expect(img).toHaveAttribute(
      "src",
      "/products/sotro/showcase/op-01-home.webp",
    );
    await expect(page.locator('img[src*="identity"]')).toHaveCount(0);
  });
}

test("capture weight stays within the 120 KB LCP budget and reserves its box", async ({
  page,
  request,
}) => {
  test.skip(!hasPublicProducts, "No published hero product is available");
  await page.goto("/en/");
  const src = await page
    .locator("[data-hero-flagship] img[data-capture-src]")
    .getAttribute("src");
  const body = await (await request.get(src!)).body();
  expect(body.byteLength).toBeLessThanOrEqual(120_000);
  const box = await page
    .locator("[data-hero-flagship] [data-flagship-capture] img")
    .boundingBox();
  expect(box && box.height / box.width).toBeCloseTo(1440 / 780, 1);
});

test("desktop first viewport holds the promise, the capture and the one CTA", async ({
  page,
}) => {
  test.skip(!hasPublicProducts, "No published hero product is available");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/en/");
  for (const selector of [
    "h1",
    "[data-hero-flagship] img[data-capture-src]",
    "[data-hero-primary]",
  ]) {
    const box = await page.locator(selector).boundingBox();
    expect(box && box.y + box.height, selector).toBeLessThanOrEqual(900);
  }
});

test("no-JS keeps the capture, its label and the single CTA", async ({
  browser,
}) => {
  test.skip(!hasPublicProducts, "No published hero product is available");
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/en/");
  await expect(page.locator("[data-hero-flagship] figcaption")).toBeVisible();
  await expect(page.locator("[data-hero-primary]")).toHaveCount(1);
  await context.close();
});

test("reduced motion: the hero capture is static and fully opaque", async ({
  browser,
}) => {
  test.skip(!hasPublicProducts, "No published hero product is available");
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/en/");
  const style = await page
    .locator("[data-hero-flagship] img[data-capture-src]")
    .evaluate((el) => {
      const cs = getComputedStyle(el);
      return { opacity: cs.opacity, animation: cs.animationName };
    });
  expect(style).toEqual({ opacity: "1", animation: "none" });
  await context.close();
});
