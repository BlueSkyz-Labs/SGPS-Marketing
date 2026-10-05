import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

/**
 * v13 W2 — WCAG 2.2 AA sweep that locks in the clean baseline measured on
 * main@fd8776f (2026-10-05): 80 crawled routes x {1440 light, 1440 dark,
 * 390 light} had ZERO axe violations at ANY impact (wcag2a..wcag22aa +
 * best-practice), and no failures of the criteria axe cannot see:
 *   - 2.4.11 Focus Not Obscured (Minimum): the sticky header never fully
 *     hides the keyboard-focused element;
 *   - 1.4.10 Reflow: no horizontal scroll at 320 CSS px;
 *   - 1.4.12 Text Spacing: WCAG spacing overrides cause no horizontal scroll
 *     and no clipped visible text.
 * The per-engine accessibility.spec.ts keeps its critical/serious matrix;
 * this sweep is engine-independent and runs once, on the chromium project.
 */

const SEEDS = ["/en/", "/vi/", "/zh/", "/zh-hant/"];
const ROUTE = /^\/(en|vi|zh|zh-hant)\/(?:[a-z0-9-]+\/)*$/;
const TAGS = [
  "wcag2a",
  "wcag2aa",
  "wcag21a",
  "wcag21aa",
  "wcag22a",
  "wcag22aa",
  "best-practice",
];

/** 2.4.11: the focused element, when the sticky header fully covers it. */
async function obscuredFocus(page: Page): Promise<string | null> {
  // Let focus styles settle: the skip link slides in on :focus, and even a
  // reduced-motion transition (0.01ms) runs as an animation first.
  await page.evaluate(async () => {
    const el = document.activeElement;
    if (!el) return;
    await Promise.all(
      el.getAnimations().map((animation) => animation.finished.catch(() => {})),
    );
  });
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    const header = document.querySelector("header");
    if (!el || el === document.body || !header) return null;
    if (header.contains(el)) return null;
    if (!["sticky", "fixed"].includes(getComputedStyle(header).position))
      return null;
    const box = el.getBoundingClientRect();
    if (box.width === 0 || box.height === 0) return null;
    // Hidden means the header, not the element, is what paints at the
    // element's centre (a skip link drawn above the header is not hidden).
    const x = Math.min(Math.max(box.left + box.width / 2, 0), innerWidth - 1);
    const y = Math.min(Math.max(box.top + box.height / 2, 0), innerHeight - 1);
    const hit = document.elementFromPoint(x, y);
    const covered = !!hit && header.contains(hit) && !el.contains(hit);
    return covered ? el.outerHTML.slice(0, 80) : null;
  });
}

const TEXT_SPACING =
  "*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}";

/** 1.4.10 / 1.4.12 problems for the current page at its viewport. */
async function reflowProblems(page: Page, label: string): Promise<string[]> {
  const problems: string[] = [];
  const plain = await page.evaluate(() => document.documentElement.scrollWidth);
  if (plain > 320) problems.push(`${label} reflow scrollWidth=${plain}`);
  await page.addStyleTag({ content: TEXT_SPACING });
  const spaced = await page.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    clipped: [
      ...document.querySelectorAll<HTMLElement>("h1,h2,h3,p,a,button,li,label"),
    ]
      .filter((el) => {
        const style = getComputedStyle(el);
        const srOnly =
          style.position === "absolute" &&
          el.getBoundingClientRect().width <= 1;
        return (
          !srOnly &&
          (style.overflow === "hidden" || style.overflowY === "hidden") &&
          el.clientHeight > 0 &&
          el.scrollHeight > el.clientHeight + 2
        );
      })
      .map((el) => el.textContent?.trim().slice(0, 40) ?? ""),
  }));
  if (spaced.width > 320) {
    problems.push(`${label} text-spacing scrollWidth=${spaced.width}`);
  }
  for (const text of spaced.clipped) {
    problems.push(`${label} text-spacing clips "${text}"`);
  }
  return problems;
}

async function crawl(page: Page): Promise<string[]> {
  const queue = [...SEEDS];
  const seen = new Set(queue);
  while (queue.length > 0 && seen.size <= 200) {
    const route = queue.shift()!;
    const response = await page.goto(route);
    if (!response || response.status() >= 400) continue;
    const hrefs = await page.$$eval("a[href]", (links) =>
      links.map((link) => link.getAttribute("href") ?? ""),
    );
    for (const href of hrefs) {
      const url = new URL(href, page.url());
      if (url.origin !== new URL(page.url()).origin) continue;
      if (!ROUTE.test(url.pathname) || seen.has(url.pathname)) continue;
      seen.add(url.pathname);
      queue.push(url.pathname);
    }
  }
  return [...seen];
}

test.describe("WCAG 2.2 AA sweep", () => {
  let routes: string[] = [];

  test.beforeAll(async ({ browser }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium",
      "engine-independent sweep: runs once, on the chromium project",
    );
    const page = await browser.newPage();
    routes = await crawl(page);
    await page.close();
  });

  test("the crawl reaches the whole public site", () => {
    expect(routes.length).toBeGreaterThanOrEqual(60);
    for (const route of ["/en/products/sotro/", "/vi/decision-room/"]) {
      expect(routes, route).toContain(route);
    }
  });

  for (const config of [
    { width: 1440, scheme: "light" as const },
    { width: 1440, scheme: "dark" as const },
    { width: 390, scheme: "light" as const },
  ]) {
    test(`axe: zero violations at any impact (${config.width} ${config.scheme})`, async ({
      browser,
    }) => {
      test.setTimeout(600_000);
      const context = await browser.newContext({
        viewport: { width: config.width, height: 900 },
        colorScheme: config.scheme,
        reducedMotion: "reduce",
      });
      const page = await context.newPage();
      const problems: string[] = [];
      for (const route of routes) {
        await page.goto(route);
        const results = await new AxeBuilder({ page }).withTags(TAGS).analyze();
        for (const violation of results.violations) {
          problems.push(
            `${route} ${violation.id} [${violation.impact}] x${violation.nodes.length}: ${violation.nodes[0]?.target.join(" ")}`,
          );
        }
      }
      await context.close();
      expect(problems).toEqual([]);
    });
  }

  test("2.4.11: the sticky header never fully hides the focused element", async ({
    browser,
  }) => {
    test.setTimeout(600_000);
    const problems: string[] = [];
    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 390, height: 844 },
    ]) {
      const context = await browser.newContext({
        viewport,
        reducedMotion: "reduce",
      });
      const page = await context.newPage();
      for (const route of routes) {
        await page.goto(route);
        for (let step = 0; step < 40; step++) {
          await page.keyboard.press("Tab");
          const hidden = await obscuredFocus(page);
          if (hidden) problems.push(`${viewport.width} ${route}: ${hidden}`);
        }
      }
      await context.close();
    }
    expect(problems).toEqual([]);
  });

  test("1.4.10 and 1.4.12: no horizontal scroll at 320px, with or without text spacing", async ({
    browser,
  }) => {
    test.setTimeout(600_000);
    const context = await browser.newContext({
      viewport: { width: 320, height: 800 },
    });
    const page = await context.newPage();
    const problems: string[] = [];
    for (const route of routes) {
      await page.goto(route);
      problems.push(...(await reflowProblems(page, route)));
    }
    await context.close();
    expect(problems).toEqual([]);
  });

  test("negative proof: each check turns red on a deliberately broken page", async ({
    browser,
  }) => {
    const context = await browser.newContext({
      viewport: { width: 320, height: 800 },
    });
    const page = await context.newPage();
    // axe: an image without alt text and unreadable grey-on-white text.
    await page.setContent(
      '<!doctype html><html lang="en"><head><title>x</title></head><body><main><h1>x</h1><img src="data:image/gif;base64,R0lGODlhAQABAAAAACw=" width="10" height="10"><p style="color:#ddd;background:#fff">faint</p></main></body></html>',
    );
    const axe = await new AxeBuilder({ page }).withTags(TAGS).analyze();
    const ids = axe.violations.map((violation) => violation.id);
    expect(ids).toContain("image-alt");
    expect(ids).toContain("color-contrast");
    // 1.4.10 / 1.4.12: a fixed 400px block and a clipped one-line box.
    await page.setContent(
      '<!doctype html><html lang="en"><body><div style="width:400px">wide</div><p style="height:1em;overflow:hidden">a long sentence that wraps once spacing grows</p></body></html>',
    );
    const reflow = await reflowProblems(page, "fixture");
    expect(reflow.some((problem) => problem.includes("reflow"))).toBe(true);
    expect(reflow.some((problem) => problem.includes("clips"))).toBe(true);
    // 2.4.11: a sticky header covering the focused link.
    await page.setViewportSize({ width: 800, height: 600 });
    await page.setContent(
      '<!doctype html><html lang="en"><body style="margin:0"><header style="position:sticky;top:0;height:200px;background:#000;z-index:1"></header><a href="#x" style="display:block;margin-top:-150px;position:relative">hidden link</a></body></html>',
    );
    await page.keyboard.press("Tab");
    expect(await obscuredFocus(page)).not.toBeNull();
    await context.close();
  });
});
