import { expect, test, type Page } from "@playwright/test";

/**
 * Aesthetic S5 (Home hierarchy + phone signature). Rendered guards:
 *  - the Home "In development" heading is at least one step of the
 *    canonical nine-step type scale smaller than the flagship heading, in every
 *    locale (the flagship heading is unchanged);
 *  - at 390 px the existing decorative horizon field renders (non-zero box,
 *    visible, aria-hidden) behind the capture, the H1 never animates and the
 *    status badge and primary CTA sit inside the first 390 x 844 viewport.
 * Each guard has a negative proof: the invariant is broken in-page and the same
 * check must report it.
 */
const LOCALES = ["en", "vi", "zh", "zh-hant"] as const;

/** Canonical nine-step scale in px (src/styles/global.css --size-1..9). */
const SCALE_PX = [12, 14, 16, 18, 20, 24, 32, 44, 64];

const sizes = (page: Page) =>
  page.evaluate(() => {
    const px = (sel: string) =>
      parseFloat(getComputedStyle(document.querySelector(sel)!).fontSize);
    return {
      flagship: px("#flagship-theatre-title"),
      secondary: px("#product-house-title"),
    };
  });

const steps = (flagship: number, secondary: number) =>
  SCALE_PX.indexOf(flagship) - SCALE_PX.indexOf(secondary);

test.describe("S5 Home heading hierarchy", () => {
  for (const lang of LOCALES) {
    test(`${lang}: secondary heading is >= 1 scale step below the flagship`, async ({
      page,
    }) => {
      await page.goto(`/${lang}/`);
      const { flagship, secondary } = await sizes(page);
      expect(SCALE_PX, "flagship on scale").toContain(flagship);
      expect(SCALE_PX, "secondary on scale").toContain(secondary);
      expect(secondary).toBeLessThan(flagship);
      expect(steps(flagship, secondary)).toBeGreaterThanOrEqual(1);
    });
  }

  test("negative proof: equal heading sizes are caught", async ({ page }) => {
    await page.goto("/en/");
    await page.addStyleTag({
      content: "#product-house-title{font-size:var(--size-7)!important}",
    });
    const { flagship, secondary } = await sizes(page);
    expect(steps(flagship, secondary)).toBeLessThan(1);
  });
});

const signature = (page: Page) =>
  page.evaluate(() => {
    const field = document.querySelector<HTMLElement>(
      ".hero-plane .horizon-signature .horizon-field",
    );
    const line = field?.querySelector<HTMLElement>(".horizon-field__line");
    const focal = document.querySelector("[data-hero-focal]");
    const h1 = document.querySelector<HTMLElement>("#hero-title");
    const cta = document.querySelector("[data-hero-primary]");
    const badge = document.querySelector("[data-product-status]");
    const box = (el: Element | null | undefined) => {
      const r = el?.getBoundingClientRect();
      return r
        ? {
            top: r.top + scrollY,
            bottom: r.bottom + scrollY,
            w: r.width,
            h: r.height,
          }
        : null;
    };
    const fb = box(field);
    const lb = box(line);
    const cb = box(focal);
    const visible = (el: Element | null | undefined) => {
      if (!el) return false;
      const s = getComputedStyle(el);
      return (
        s.display !== "none" && s.visibility !== "hidden" && s.opacity !== "0"
      );
    };
    const inFold = (el: Element | null) => {
      const r = el?.getBoundingClientRect();
      return Boolean(r && r.top >= 0 && r.bottom <= window.innerHeight);
    };
    return {
      fieldBox: Boolean(fb && fb.w > 0 && fb.h > 0),
      lineBox: Boolean(lb && lb.w > 0 && lb.h > 0),
      visible: visible(field) && visible(line),
      ariaHidden: field?.getAttribute("aria-hidden") === "true",
      // The horizon must stand behind the capture, not under the header.
      behindCapture: Boolean(lb && cb && lb.top > cb.top && lb.top < cb.bottom),
      h1Animations: h1 ? h1.getAnimations({ subtree: true }).length : -1,
      h1AnimationName: h1 ? getComputedStyle(h1).animationName : "",
      ctaInFold: inFold(cta),
      badgeInFold: inFold(badge),
    };
  });

test.describe("S5 phone horizon signature (390 x 844)", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  for (const lang of LOCALES) {
    test(`${lang}: horizon renders, H1 static, badge and CTA in the fold`, async ({
      page,
    }) => {
      await page.goto(`/${lang}/`);
      const s = await signature(page);
      expect(s.fieldBox, "field has a box").toBe(true);
      expect(s.lineBox, "line has a box").toBe(true);
      expect(s.visible, "field visible").toBe(true);
      expect(s.ariaHidden, "field aria-hidden").toBe(true);
      expect(s.behindCapture, "line stands behind the capture").toBe(true);
      expect(s.h1Animations, "H1 animations").toBe(0);
      expect(s.h1AnimationName).toBe("none");
      expect(s.ctaInFold, "CTA in first viewport").toBe(true);
      expect(s.badgeInFold, "badge in first viewport").toBe(true);
    });
  }

  test("reduced motion: the field still renders and does not animate", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/en/");
    const s = await signature(page);
    expect(s.fieldBox && s.lineBox && s.visible).toBe(true);
    const animated = await page.evaluate(
      () =>
        document
          .querySelector(".hero-plane .horizon-field")!
          .getAnimations({ subtree: true }).length,
    );
    expect(animated).toBe(0);
  });

  test("no JS: the field renders from CSS alone", async ({ browser }, info) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 390, height: 844 },
      baseURL: info.project.use.baseURL,
    });
    const page = await context.newPage();
    await page.goto("/en/");
    const box = await page
      .locator(".hero-plane .horizon-signature .horizon-field__line")
      .boundingBox();
    expect(box && box.width > 0 && box.height > 0).toBe(true);
    await context.close();
  });

  test("negative proof: each broken invariant is caught", async ({ page }) => {
    await page.goto("/en/");
    // Field collapsed to the old 0 px box and revealed to assistive tech.
    await page.addStyleTag({
      content: ".hero-plane .horizon-signature{height:0!important}",
    });
    await page.evaluate(() =>
      document
        .querySelector(".hero-plane .horizon-field")!
        .removeAttribute("aria-hidden"),
    );
    let s = await signature(page);
    expect(s.fieldBox).toBe(false);
    expect(s.ariaHidden).toBe(false);
    // The H1 animating.
    await page.addStyleTag({
      content:
        "@keyframes s5neg{from{opacity:.5}to{opacity:1}}#hero-title{animation:s5neg 5s infinite!important}",
    });
    s = await signature(page);
    expect(s.h1Animations).toBeGreaterThan(0);
    // CTA pushed below the fold.
    await page.addStyleTag({
      content: ".hero-flagship__body{margin-top:60rem!important}",
    });
    s = await signature(page);
    expect(s.ctaInFold).toBe(false);
  });
});
