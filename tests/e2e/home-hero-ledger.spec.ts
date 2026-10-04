import { expect, test, type Page } from "@playwright/test";
import { hasPublicProducts } from "./product-helpers.ts";

/**
 * UI upgrade WP-B — hero first screen (F4), Horizon & Sail (W1) and the home
 * evidence ledger (W3).
 *
 * - F4: at 390 px the one primary action is inside the FIRST viewport, because
 *   the flagship name + CTA come before the capture in DOM order (not by CSS
 *   `order`), and the product-line links are plain inline links, so every line
 *   of that paragraph has the same pitch while each link stays >= 44 px tall
 *   (the project target standard; padding on an inline box adds no height).
 * - W1: the desktop mark is not hidden behind the capture (most of it reads),
 *   and the capture keeps its reserved ratio under the 3D tilt.
 * - W3: the ledger shows at most three rows, each a published claim joined to
 *   source names; the band still has exactly one link (/verify).
 *
 * Negative proof (in this file): each checker is also run against a page that
 * was deliberately broken in the browser and must report the defect.
 */

const LOCALES = ["en", "vi", "zh", "zh-hant"] as const;

async function seedLanguage(page: Page, lang: string) {
  // The cross-locale suggestion banner is not part of this composition.
  await page.addInitScript((language) => {
    try {
      window.localStorage.setItem("blueskyz.ui.language", language);
    } catch {
      // storage unavailable: the suggestion stays absent as well.
    }
  }, lang);
}

/** Bottom of the primary CTA, and whether it precedes the capture in DOM order. */
async function firstScreen(page: Page) {
  return page.evaluate(() => {
    const cta = document.querySelector("[data-hero-primary]")!;
    const capture = document.querySelector("[data-hero-flagship] figure")!;
    return {
      ctaBottom: cta.getBoundingClientRect().bottom,
      ctaBeforeCapture: Boolean(
        cta.compareDocumentPosition(capture) & Node.DOCUMENT_POSITION_FOLLOWING,
      ),
      cssOrder: getComputedStyle(cta.closest(".hero-flagship__body")!).order,
    };
  });
}

/** Line tops of the product-line paragraph and its link heights. */
async function productLine(page: Page) {
  return page.evaluate(() => {
    const line = document.querySelector("[data-hero-product-line]")!;
    // Text-node line boxes only (a padded inline link adds its own taller
    // rect); bottoms within 3 px are the same line.
    const bottoms: number[] = [];
    const walker = document.createTreeWalker(line, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      const range = document.createRange();
      range.selectNodeContents(node);
      for (const r of range.getClientRects()) {
        if (r.width > 1) bottoms.push(r.bottom);
      }
    }
    const tops: number[] = [];
    for (const b of bottoms.sort((x, y) => x - y)) {
      if (!tops.length || b - tops.at(-1)! > 3) tops.push(b);
    }
    const gaps = tops.slice(1).map((top, i) => top - tops[i]!);
    const links = [...line.querySelectorAll("a")].map((a) => ({
      display: getComputedStyle(a).display,
      height: a.getBoundingClientRect().height,
    }));
    const lineHeight = Number.parseFloat(getComputedStyle(line).lineHeight);
    return { gaps, links, lineHeight };
  });
}

/** Ledger rows and the band's links. */
async function ledger(page: Page) {
  return page.evaluate(() => {
    const band = document.querySelector("[data-trust-band]")!;
    return {
      rows: [...band.querySelectorAll("[data-evidence-ledger] > li")].map(
        (li) => ({
          id: li.getAttribute("data-claim-id"),
          claim: li.querySelector(".evidence-ledger__claim")?.textContent ?? "",
          source:
            li.querySelector(".evidence-ledger__source")?.textContent ?? "",
          threadHidden:
            li
              .querySelector(".evidence-ledger__thread")
              ?.getAttribute("aria-hidden") === "true",
        }),
      ),
      links: [...band.querySelectorAll("a[href]")].map((a) =>
        a.getAttribute("href"),
      ),
    };
  });
}

for (const lang of LOCALES) {
  test(`/${lang}/ at 390: the one primary action is in the first viewport, before the capture`, async ({
    page,
  }) => {
    test.skip(!hasPublicProducts, "No published hero product is available");
    await seedLanguage(page, lang);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/${lang}/`);
    const m = await firstScreen(page);
    expect(m.ctaBottom, "CTA bottom at 390x844").toBeLessThanOrEqual(844);
    expect(m.ctaBeforeCapture, "CTA precedes the capture in DOM").toBe(true);
    expect(m.cssOrder, "no CSS reordering").toBe("0");
  });
}

for (const lang of ["en", "vi"] as const) {
  test(`/${lang}/ at 390: product-line links are inline, >= 44 px tall, line pitch = line-height`, async ({
    page,
  }) => {
    test.skip(!hasPublicProducts, "No published hero product is available");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/${lang}/`);
    const { gaps, links, lineHeight } = await productLine(page);
    expect(links).toHaveLength(2);
    for (const link of links) {
      expect(link.display).toBe("inline");
      expect(link.height).toBeGreaterThanOrEqual(44);
    }
    expect(gaps.length, "the line wraps at 390").toBeGreaterThan(0);
    // Every line advances by the paragraph's own line-height: no link box
    // pushes its line apart.
    for (const gap of gaps) {
      expect(
        Math.abs(gap - lineHeight),
        `${gaps} vs ${lineHeight}`,
      ).toBeLessThan(1.5);
    }
  });
}

test("negative proof: an inline-flex 44 px link breaks the line pitch", async ({
  page,
}) => {
  test.skip(!hasPublicProducts, "No published hero product is available");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/vi/");
  await page.addStyleTag({
    content:
      "[data-hero-product-line] a{display:inline-flex!important;min-height:2.75rem!important;align-items:center;vertical-align:middle}",
  });
  const { gaps, links, lineHeight } = await productLine(page);
  expect(links[0]!.display).toBe("inline-flex");
  expect(
    Math.max(...gaps.map((gap) => Math.abs(gap - lineHeight))),
  ).toBeGreaterThanOrEqual(1.5);
});

test("negative proof: a capture moved before the CTA is detected", async ({
  page,
}) => {
  test.skip(!hasPublicProducts, "No published hero product is available");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en/");
  await page.evaluate(() => {
    const body = document.querySelector(".hero-flagship__body")!;
    const stage = document.querySelector(".hero-stage")!;
    body.parentElement!.insertBefore(stage, body);
  });
  const m = await firstScreen(page);
  expect(m.ctaBeforeCapture).toBe(false);
  expect(m.ctaBottom).toBeGreaterThan(844);
});

test("1440: the prismatic mark reads beside the capture and the capture keeps its ratio", async ({
  page,
}) => {
  test.skip(!hasPublicProducts, "No published hero product is available");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/en/");
  const m = await page.evaluate(() => {
    const mark = document.querySelector(".hero-mark")!.getBoundingClientRect();
    const img = document
      .querySelector("[data-hero-flagship] [data-flagship-capture] img")!
      .getBoundingClientRect();
    const overlapX = Math.max(
      0,
      Math.min(mark.right, img.right) - Math.max(mark.left, img.left),
    );
    return {
      markWidth: mark.width,
      uncovered: 1 - overlapX / mark.width,
      ratio: img.height / img.width,
    };
  });
  expect(m.markWidth).toBeGreaterThan(300);
  // F5: at least half of the mark's width is clear of the capture.
  expect(m.uncovered).toBeGreaterThanOrEqual(0.5);
  expect(m.ratio).toBeCloseTo(1440 / 780, 1);
});

for (const lang of LOCALES) {
  test(`/${lang}/ evidence ledger: <= 3 published claims joined to sources, one link`, async ({
    page,
  }) => {
    await page.goto(`/${lang}/`);
    const { rows, links } = await ledger(page);
    expect(rows.length).toBeGreaterThan(0);
    expect(rows.length).toBeLessThanOrEqual(3);
    for (const row of rows) {
      expect(row.id).toMatch(/^[a-z0-9-]+$/);
      expect(row.claim.trim().length).toBeGreaterThan(0);
      expect(row.source.trim().length).toBeGreaterThan(0);
      expect(row.threadHidden).toBe(true);
    }
    expect(links).toEqual([`/${lang}/verify/`]);
  });
}

test("evidence ledger rows are claims /verify publishes", async ({ page }) => {
  await page.goto("/en/");
  const ids = (await ledger(page)).rows.map((row) => row.id);
  await page.goto("/en/verify/");
  for (const id of ids) {
    await expect(page.locator(`[data-claim-id="${id}"]`)).toHaveCount(1);
  }
});

test("negative proof: a fourth row, a sourceless row or a second link is detected", async ({
  page,
}) => {
  await page.goto("/en/");
  await page.evaluate(() => {
    const list = document.querySelector("[data-evidence-ledger]")!;
    const extra = list.firstElementChild!.cloneNode(true) as HTMLElement;
    extra.querySelector(".evidence-ledger__source")!.textContent = "";
    list.appendChild(extra);
    const link = document.createElement("a");
    link.href = "/en/security/";
    link.textContent = "Security";
    document.querySelector("[data-trust-band]")!.appendChild(link);
  });
  const { rows, links } = await ledger(page);
  expect(rows.length).toBeGreaterThan(3);
  expect(rows.some((row) => row.source.trim() === "")).toBe(true);
  expect(links).not.toEqual(["/en/verify/"]);
});

test("reduced motion: ledger threads rest fully drawn and the capture is static", async ({
  browser,
}) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.goto("/en/");
  const state = await page.evaluate(() => ({
    offsets: [
      ...document.querySelectorAll(".evidence-ledger__thread line"),
    ].map((line) => getComputedStyle(line).strokeDashoffset),
    focal: getComputedStyle(document.querySelector("[data-hero-focal]")!)
      .animationName,
  }));
  expect(state.offsets.length).toBeGreaterThan(0);
  for (const offset of state.offsets) expect(offset).toMatch(/^0(px)?$/);
  expect(state.focal).toBe("none");
  await context.close();
});
