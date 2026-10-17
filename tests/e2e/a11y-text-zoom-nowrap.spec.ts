import { expect, test, type Page } from "@playwright/test";

/**
 * WP-06 (Lead Plan v1.1, A5): Site-wide text-zoom/nowrap guard.
 *
 * At 320px with 200% text and WCAG 1.4.12 text spacing, no element whose
 * computed white-space is nowrap/pre may be wider than its nearest
 * block-level ancestor, and the document must not scroll horizontally.
 *
 * This escalates LSN-marketing-001 from a zh/zh-hant heading fix (G2)
 * to a site-wide guard (G3).
 *
 * Negative proof: the "detector catches injected nowrap" test injects a
 * 40-char nowrap span into a 200px div; the detector must report it.
 */

const LOCALES = ["en", "vi", "zh", "zh-hant"] as const;
const ROUTES = [
  "/",
  "/products/",
  "/products/sotro/",
  "/products/sotam/",
  "/verify/",
  "/about/",
  "/contact/",
  "/support/",
];
const NOT_FOUND = "/this-page-does-not-exist-xyz/";

const ZOOM_CSS = `html{font-size:200%!important} *{letter-spacing:.12em!important;word-spacing:.16em!important;line-height:1.5!important}`;

interface DetectorResult {
  nowrapOffenders: string[];
  docOverflow: number;
}

/** Shared detector: returns nowrap offenders and document overflow. */
async function detect(page: Page): Promise<DetectorResult> {
  return page.evaluate(() => {
    const nowrapOffenders: string[] = [];
    const viewport = document.documentElement.clientWidth;
    const BLOCK_DISPLAY = /^(block|list-item|table|flex|grid)$/;

    // Find nearest block-level ancestor with meaningful width.
    const nearestBlock = (el: Element): Element | null => {
      let node = el.parentElement;
      while (node && node !== document.documentElement) {
        const cs = getComputedStyle(node);
        const display = cs.display.split(" ")[0];
        if (BLOCK_DISPLAY.test(display) && node.clientWidth > 1) {
          return node;
        }
        node = node.parentElement;
      }
      return document.documentElement;
    };

    const describe = (el: Element): string => {
      const tag = el.tagName.toLowerCase();
      const cls = [...el.classList].slice(0, 3).join(".");
      return `${tag}${cls ? "." + cls : ""}`;
    };

    for (const el of document.querySelectorAll("body *")) {
      const cs = getComputedStyle(el);
      if (cs.whiteSpace !== "nowrap" && cs.whiteSpace !== "pre") continue;
      // white-space shapes text runs only. SVG shapes inherit it from their
      // button but are drawn to the viewBox, and Firefox measures a sun ray
      // 1px past its 22px icon; that is artwork, not a run that can wrap.
      if (el instanceof SVGElement) continue;
      // Skip sr-only / invisible elements.
      const rect = el.getBoundingClientRect();
      if (rect.width <= 1 || rect.height <= 1) continue;
      const ancestor = nearestBlock(el);
      if (!ancestor) continue;
      const limit = ancestor.clientWidth + 1;
      if (rect.width > limit) {
        nowrapOffenders.push(
          `${describe(el)} (${Math.round(rect.width)}px > ${Math.round(limit)}px in ${describe(ancestor)})`,
        );
      } else if (rect.right > viewport + 1) {
        // The ancestor can itself be wider than the viewport; then the run
        // fits it but still pushes the page sideways.
        nowrapOffenders.push(
          `${describe(el)} (right edge ${Math.round(rect.right)}px > viewport ${viewport}px in ${describe(ancestor)})`,
        );
      }
    }

    const doc = document.documentElement;
    const docOverflow = doc.scrollWidth - doc.clientWidth;
    return { nowrapOffenders, docOverflow };
  });
}

async function applyZoom(page: Page): Promise<void> {
  await page.addStyleTag({ content: ZOOM_CSS });
  // Let layout settle after the style injection.
  await page.evaluate(
    () => new Promise((r) => requestAnimationFrame(() => r(null))),
  );
}

test.describe("WP-06 text zoom + nowrap guard", () => {
  test.use({ viewport: { width: 320, height: 800 } });

  test("negative proof: detector catches an injected nowrap offender", async ({
    page,
  }) => {
    await page.goto("/en/");
    await applyZoom(page);
    // Inject a 40-char nowrap run inside a 200px container.
    await page.evaluate(() => {
      const div = document.createElement("div");
      div.style.width = "200px";
      div.style.overflow = "visible";
      const span = document.createElement("span");
      span.style.whiteSpace = "nowrap";
      span.textContent = "A".repeat(40);
      div.appendChild(span);
      document.body.appendChild(div);
    });
    const result = await detect(page);
    expect(
      result.nowrapOffenders.length,
      "detector must report the injected nowrap span",
    ).toBeGreaterThan(0);
  });

  test("negative proof: detector catches nowrap inside an overflowing ancestor", async ({
    page,
  }) => {
    await page.goto("/en/");
    await applyZoom(page);
    // The run fits its 600px ancestor, but the ancestor is wider than the
    // 320px viewport, so the run still pushes the page sideways.
    await page.evaluate(() => {
      const div = document.createElement("div");
      div.style.width = "600px";
      const span = document.createElement("span");
      // A fixed 500px box: inside the ancestor, past the viewport edge,
      // whatever width the zoomed font would give the text.
      span.style.cssText =
        "white-space:nowrap;display:inline-block;width:500px;overflow:hidden";
      span.textContent = "B".repeat(12);
      div.appendChild(span);
      document.body.appendChild(div);
    });
    const result = await detect(page);
    expect(
      result.nowrapOffenders.some((o) => o.includes("viewport")),
      "detector must report a nowrap run past the viewport edge",
    ).toBe(true);
  });

  for (const locale of LOCALES) {
    for (const route of [...ROUTES, NOT_FOUND]) {
      const path = `/${locale}${route}`;
      test(`${path}: no nowrap overflow, no horizontal scroll`, async ({
        page,
      }) => {
        const response = await page.goto(path);
        // The 404 path must actually 404; other routes must 200.
        if (route === NOT_FOUND) {
          expect(response?.status()).toBe(404);
        } else {
          expect(response?.status()).toBe(200);
        }
        await applyZoom(page);
        const result = await detect(page);
        expect(
          result.nowrapOffenders,
          `nowrap offenders on ${path}: ${result.nowrapOffenders.join("; ")}`,
        ).toEqual([]);
        expect(
          result.docOverflow,
          `horizontal overflow on ${path}: ${result.docOverflow}px`,
        ).toBeLessThanOrEqual(1);
      });
    }
  }
});
