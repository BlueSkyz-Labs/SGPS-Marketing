import { expect, test } from "@playwright/test";

/*
 * v10 card E2: WCAG 2.2 delta guards.
 * 2.4.11 Focus Not Obscured (Minimum, AA): when an element receives keyboard
 * focus it must not be entirely hidden by author-created content (the sticky
 * header, fixed language/theme panels). Measured in-page with
 * getBoundingClientRect (v9 §6: no boundingBox() rounding).
 * 2.5.8 Target Size (Minimum, AA): button-like controls are at least 24x24 CSS px
 * (the site's own 44 px rule elsewhere stays the stricter guard).
 */

const ROUTES = [
  "/en/",
  "/vi/",
  "/en/products/",
  "/vi/products/sotro/",
  "/en/verify/",
];
const MAX_TABS = 40;

type Probe = {
  label: string;
  visibleArea: number;
  area: number;
  obscuredBy: string[];
};

async function probeFocused(
  page: import("@playwright/test").Page,
): Promise<Probe | null> {
  // Stacking-aware: sample points inside the focused box and ask the browser
  // which element is painted on top (elementFromPoint respects z-index and
  // fixed/sticky layers). The element is obscured only if no sample point
  // inside the viewport hits it or one of its descendants.
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null;
    if (!el || el === document.body) return null;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return null;
    const xs = [0.1, 0.5, 0.9].map((f) => r.left + r.width * f);
    const ys = [0.1, 0.5, 0.9].map((f) => r.top + r.height * f);
    let samples = 0;
    let hits = 0;
    const covers = new Set<string>();
    for (const x of xs) {
      for (const y of ys) {
        if (x < 0 || y < 0 || x >= innerWidth || y >= innerHeight) continue;
        samples += 1;
        const top = document.elementFromPoint(x, y);
        if (top && (top === el || el.contains(top))) hits += 1;
        else if (top) {
          const layer =
            top.closest("header, [style*='fixed'], nav, aside") ?? top;
          covers.add(
            layer.tagName.toLowerCase() +
              (layer.className
                ? "." + String(layer.className).split(" ")[0]
                : ""),
          );
        }
      }
    }
    return {
      label: `${el.tagName.toLowerCase()} "${(el.innerText || el.getAttribute("aria-label") || "").trim().slice(0, 40)}"`,
      visibleArea: samples === 0 ? 0 : hits,
      area: samples,
      obscuredBy: [...covers],
    };
  });
}

for (const width of [390, 1440]) {
  for (const route of ROUTES) {
    test(`2.4.11 focus is never entirely obscured on ${route} at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto(route);
      const hidden: string[] = [];
      for (let i = 0; i < MAX_TABS; i += 1) {
        await page.keyboard.press("Tab");
        const probe = await probeFocused(page);
        if (probe && probe.visibleArea <= 0) {
          hidden.push(
            `${probe.label} (by ${probe.obscuredBy.join(", ") || "viewport"})`,
          );
        }
      }
      expect(hidden, hidden.join("\n")).toEqual([]);
    });
  }
}

for (const route of ROUTES) {
  test(`2.5.8 button-like targets are at least 24x24 px on ${route}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(route);
    const small = await page.evaluate(() =>
      [
        ...document.querySelectorAll<HTMLElement>(
          "button, summary, [role='button'], input:not([type='hidden']), select",
        ),
      ]
        .filter((el) => el.offsetParent !== null)
        .map((el) => ({ el, r: el.getBoundingClientRect() }))
        .filter(({ r }) => r.width < 24 || r.height < 24)
        .map(
          ({ el, r }) =>
            `${el.tagName.toLowerCase()} "${(el.innerText || el.getAttribute("aria-label") || "").trim().slice(0, 30)}" ${r.width.toFixed(1)}x${r.height.toFixed(1)}`,
        ),
    );
    expect(small, small.join("\n")).toEqual([]);
  });
}
