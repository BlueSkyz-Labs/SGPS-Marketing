import { expect, test, type Page } from "@playwright/test";

/**
 * C3-A Task 6 — Author Mobile Cinematic Composition (design S9).
 *
 * The product/trust scenes must be composed for the phone, not compressed from
 * desktop: copy readable at its own size, decoration never burying it, actions
 * still reachable by a thumb, and no horizontal scrolling. These are the
 * properties the desktop sweep cannot see, so the guard measures the real
 * surfaces at the two mobile widths the plan names.
 */
const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "small", width: 320, height: 720 },
] as const;

const ROUTES = ["/en/", "/vi/", "/en/products/", "/en/security/"] as const;

/** Regions whose composition this task owns (the global hero is Task 7's). */
const SCENE_SELECTOR = [
  "[data-product-house]",
  "[data-flagship-theatre]",
  "[data-product-visual]",
  "[data-trust-ledger]",
  ".source-trace",
  ".boundary-card",
].join(", ");

/** Actions a visitor must be able to hit with a thumb. */
const SCENE_ACTION = [
  "[data-decision-hook]",
  ".source-trace__step a",
  "[data-flagship-theatre] a",
  "[data-product-house] a",
].join(", ");

type Report = {
  overflow: number;
  metrics: string;
  belowMinimum: string[];
  belowTouchFloor: string[];
  buried: string[];
};

async function composition(page: Page): Promise<Report> {
  return page.evaluate(
    ({ sceneSelector, sceneAction }) => {
      const doc = document.documentElement;
      const describe = (el: Element): string => {
        const rect = el.getBoundingClientRect();
        return (
          `${el.tagName.toLowerCase()}.${[...el.classList].slice(0, 2).join(".")}` +
          ` ${Math.round(rect.width)}x${Math.round(rect.height)}` +
          ` "${(el.textContent ?? "").trim().slice(0, 24)}"`
        );
      };
      const visible = (el: Element): boolean => {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return false;
        if (typeof (el as HTMLElement).checkVisibility === "function") {
          return (el as HTMLElement).checkVisibility();
        }
        const style = getComputedStyle(el);
        return style.visibility !== "hidden" && style.display !== "none";
      };

      // WCAG 2.5.8 (AA): an interactive target is at least 24x24 CSS px.
      const belowMinimum: string[] = [];
      // The repo's own touch convention for scene actions: 44px tall.
      const belowTouchFloor: string[] = [];
      for (const el of document.querySelectorAll<HTMLElement>(
        "a[href], button, summary",
      )) {
        if (!visible(el)) continue;
        const rect = el.getBoundingClientRect();
        if (rect.width < 24 || rect.height < 24)
          belowMinimum.push(describe(el));
        if (el.matches(sceneAction) && rect.height < 44) {
          belowTouchFloor.push(describe(el));
        }
      }

      // Decoration must never be the topmost element over scene copy.
      const buried: string[] = [];
      for (const scene of document.querySelectorAll<HTMLElement>(
        sceneSelector,
      )) {
        for (const el of scene.querySelectorAll<HTMLElement>("*")) {
          const text = [...el.childNodes]
            .filter((node) => node.nodeType === Node.TEXT_NODE)
            .map((node) => node.textContent ?? "")
            .join("")
            .trim();
          if (!text || !visible(el)) continue;
          const rect = el.getBoundingClientRect();
          if (rect.width < 8 || rect.height < 8) continue;
          const x = rect.x + rect.width / 2;
          const y = rect.y + rect.height / 2;
          if (
            x < 0 ||
            y < 0 ||
            x > window.innerWidth ||
            y > window.innerHeight
          ) {
            continue;
          }
          const top = document.elementFromPoint(x, y);
          if (!top || top === el || el.contains(top) || top.contains(el)) {
            continue;
          }
          if (getComputedStyle(top).pointerEvents === "none") continue;
          buried.push(`${describe(el)} covered by ${describe(top)}`);
        }
      }

      return {
        overflow: doc.scrollWidth - doc.clientWidth,
        metrics: `inner=${window.innerWidth} client=${doc.clientWidth} scroll=${doc.scrollWidth}`,
        belowMinimum: belowMinimum.slice(0, 4),
        belowTouchFloor: belowTouchFloor.slice(0, 4),
        buried: buried.slice(0, 4),
      };
    },
    { sceneSelector: SCENE_SELECTOR, sceneAction: SCENE_ACTION },
  );
}

test.describe("C3-A Mobile Cinematic Composition", () => {
  for (const viewport of VIEWPORTS) {
    for (const route of ROUTES) {
      test(`${route} @${viewport.name} (${viewport.width}px) composes for a phone`, async ({
        page,
      }) => {
        await page.setViewportSize({
          width: viewport.width,
          height: viewport.height,
        });
        await page.goto(route);
        const report = await composition(page);

        expect(
          report.overflow,
          `${route} must not need horizontal scrolling [${report.metrics}]`,
        ).toBeLessThanOrEqual(1);
        expect(
          report.belowMinimum,
          `${route} has a target below the 24x24 CSS px floor`,
        ).toEqual([]);
        expect(
          report.belowTouchFloor,
          `${route} has a scene action below the 44px touch height`,
        ).toEqual([]);
        expect(
          report.buried,
          `${route} buries scene copy under decoration`,
        ).toEqual([]);
      });
    }
  }
});
