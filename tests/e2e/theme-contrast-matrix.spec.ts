import { expect, test, type Page } from "@playwright/test";

/**
 * W1.3 — generalised theme-contrast matrix.
 *
 * Why this file exists: `os-dark-contrast.spec.ts` watched a fixed selector
 * list under one OS-dark context, so five recent defects (F-21…F-25) passed
 * it silently.  This probe walks **every visible text-bearing element** on the
 * page instead of a curated selector list, in both theme mechanisms and both
 * OS colour schemes:
 *
 *   - `prefers-color-scheme: light` with no stored preference;
 *   - `prefers-color-scheme: dark` with no stored preference (media-query dark);
 *   - explicit `data-theme="dark"` (stored `blueskyz-theme=dark`, applied by
 *     `public/theme-init.js` before first paint) over both OS schemes;
 *   - explicit `data-theme="light"` over OS dark (the override direction).
 *
 * Floor: WCAG 2.2 SC 1.4.3 — 4.5:1 for normal text, 3:1 for large text
 * (>= 24 px, or >= 18.66 px and bold).  The effective background is
 * alpha-composited up the ancestor chain.  Elements whose paint depends on a
 * CSS gradient or on generated `::before`/`::after` text are skipped and
 * counted in the report instead of being guessed; form-control placeholders
 * and button/submit values are included as visible text.
 */

const ROUTES = [
  "/",
  "/vi/",
  "/en/products/",
  "/vi/products/sotro/",
  "/zh/products/sotam/",
] as const;

interface Scenario {
  id: string;
  label: string;
  colorScheme: "light" | "dark";
  storedTheme: "dark" | "light" | null;
}

const SCENARIOS: Scenario[] = [
  {
    id: "os-light-system",
    label: "OS light, system theme",
    colorScheme: "light",
    storedTheme: null,
  },
  {
    id: "os-dark-system",
    label: "OS dark, system theme (prefers-color-scheme)",
    colorScheme: "dark",
    storedTheme: null,
  },
  {
    id: "explicit-dark-os-light",
    label: 'explicit data-theme="dark" over OS light',
    colorScheme: "light",
    storedTheme: "dark",
  },
  {
    id: "explicit-dark-os-dark",
    label: 'explicit data-theme="dark" over OS dark',
    colorScheme: "dark",
    storedTheme: "dark",
  },
  {
    id: "explicit-light-os-dark",
    label: 'explicit data-theme="light" over OS dark',
    colorScheme: "dark",
    storedTheme: "light",
  },
];

interface ContrastViolation {
  selector: string;
  ratio: number;
  floor: number;
  fontSizePx: number;
  fontWeight: number;
  text: string;
}

interface ContrastReport {
  checked: number;
  skippedGradient: number;
  skippedTiny: number;
  skippedTransparent: number;
  violations: ContrastViolation[];
  worst: { selector: string; ratio: number; text: string } | null;
}

/** Wait briefly for finite CSS animations/transitions so mid-entrance opacity cannot skew the scan. */
async function settleAnimations(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const running = document.getAnimations({ subtree: true }).filter((item) => {
      try {
        return item.effect?.getTiming().iterations !== Infinity;
      } catch {
        return false;
      }
    });
    await Promise.race([
      Promise.allSettled(
        running.map((item) => item.finished.catch(() => undefined)),
      ),
      new Promise((resolve) => setTimeout(resolve, 2000)),
    ]);
  });
}

async function scanContrast(page: Page): Promise<ContrastReport> {
  return page.evaluate(() => {
    interface RGBA {
      r: number;
      g: number;
      b: number;
      a: number;
    }
    interface Violation {
      selector: string;
      ratio: number;
      floor: number;
      fontSizePx: number;
      fontWeight: number;
      text: string;
    }

    const parseCache = new Map<string, RGBA>();
    const canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const parse = (value: string): RGBA => {
      const cached = parseCache.get(value);
      if (cached) return cached;
      const result: RGBA = { r: 0, g: 0, b: 0, a: 0 };
      if (context) {
        context.clearRect(0, 0, 1, 1);
        context.fillStyle = "rgba(0, 0, 0, 0)";
        context.fillStyle = value;
        context.fillRect(0, 0, 1, 1);
        const [r, g, b, a] = context.getImageData(0, 0, 1, 1).data;
        result.r = r ?? 0;
        result.g = g ?? 0;
        result.b = b ?? 0;
        result.a = (a ?? 0) / 255;
      }
      parseCache.set(value, result);
      return result;
    };

    const composite = (fg: RGBA, bg: RGBA): RGBA => ({
      r: fg.r * fg.a + bg.r * (1 - fg.a),
      g: fg.g * fg.a + bg.g * (1 - fg.a),
      b: fg.b * fg.a + bg.b * (1 - fg.a),
      a: 1,
    });

    const channel = (value: number): number => {
      const c = value / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    const luminance = (color: RGBA): number =>
      0.2126 * channel(color.r) +
      0.7152 * channel(color.g) +
      0.0722 * channel(color.b);
    const contrastRatio = (a: RGBA, b: RGBA): number => {
      const la = luminance(a);
      const lb = luminance(b);
      return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
    };

    /** Alpha-composite the ancestor background stack; flag gradient paint we cannot sample. */
    const effectiveBackground = (
      start: Element,
    ): { color: RGBA; gradient: boolean } => {
      const layers: RGBA[] = [];
      let gradient = false;
      let node: Element | null = start;
      while (node) {
        const style = getComputedStyle(node);
        if (style.backgroundImage !== "none") gradient = true;
        const background = parse(style.backgroundColor);
        if (background.a > 0) layers.push(background);
        if (background.a >= 0.999) break;
        node = node.parentElement;
      }
      let color: RGBA = { r: 255, g: 255, b: 255, a: 1 };
      for (let index = layers.length - 1; index >= 0; index -= 1) {
        color = composite(layers[index]!, color);
      }
      return { color, gradient };
    };

    const opacityProduct = (start: Element): number => {
      let value = 1;
      for (let node: Element | null = start; node; node = node.parentElement) {
        const opacity = Number.parseFloat(getComputedStyle(node).opacity);
        if (Number.isFinite(opacity) && opacity < 1) value *= opacity;
      }
      return value;
    };

    const directText = (el: Element): string => {
      let text = "";
      for (const node of Array.from(el.childNodes)) {
        if (node.nodeType === Node.TEXT_NODE) text += node.textContent ?? "";
      }
      return text.trim();
    };

    const controlText = (el: Element): string => {
      if (
        el instanceof HTMLInputElement &&
        ["button", "submit", "reset"].includes(el.type)
      ) {
        return (el.value ?? "").trim();
      }
      return "";
    };

    const placeholderText = (el: Element): string => {
      if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
        return (el.getAttribute("placeholder") ?? "").trim();
      }
      return "";
    };

    const isVisible = (el: Element, style: CSSStyleDeclaration): boolean => {
      const candidate = el as Element & {
        checkVisibility?: (options?: {
          checkOpacity?: boolean;
          checkVisibilityCSS?: boolean;
          contentVisibilityAuto?: boolean;
        }) => boolean;
      };
      if (typeof candidate.checkVisibility === "function") {
        return candidate.checkVisibility({
          checkOpacity: true,
          checkVisibilityCSS: true,
          contentVisibilityAuto: true,
        });
      }
      const rect = el.getBoundingClientRect();
      return (
        rect.width > 0 &&
        rect.height > 0 &&
        style.visibility !== "hidden" &&
        style.display !== "none" &&
        style.opacity !== "0"
      );
    };

    const selectorOf = (el: Element): string => {
      if (el.id) return `#${el.id}`;
      const parts: string[] = [];
      let node: Element | null = el;
      while (node && node !== document.body && parts.length < 4) {
        let part = node.tagName.toLowerCase();
        if (node.classList.length > 0) {
          part += `.${Array.from(node.classList).slice(0, 3).join(".")}`;
        }
        parts.unshift(part);
        node = node.parentElement;
      }
      return parts.join(" > ");
    };

    const violations: Violation[] = [];
    let checked = 0;
    let skippedGradient = 0;
    let skippedTiny = 0;
    let skippedTransparent = 0;

    for (const el of document.querySelectorAll<HTMLElement>("*")) {
      if (
        [
          "SCRIPT",
          "STYLE",
          "NOSCRIPT",
          "TEMPLATE",
          "HEAD",
          "META",
          "LINK",
          "TITLE",
          "HTML",
          "svg",
        ].includes(el.tagName.toLowerCase())
      ) {
        continue;
      }

      const text = directText(el);
      const valueText = controlText(el);
      const placeholder = placeholderText(el);
      const visibleText = text || valueText || placeholder;
      if (!visibleText) continue;

      const style = getComputedStyle(el);
      if (!isVisible(el, style)) continue;

      const rect = el.getBoundingClientRect();
      if (rect.width <= 1 || rect.height <= 1) {
        skippedTiny += 1;
        continue;
      }
      // Focus-only affordances (e.g. `.skip-link { transform: translateY(-200%) }`)
      // sit entirely above/left of the viewport origin at scroll 0: not visible text.
      if (rect.bottom <= 0 || rect.right <= 0) {
        skippedTiny += 1;
        continue;
      }

      let fontSizePx = Number.parseFloat(style.fontSize);
      let fontWeight = Number.parseInt(style.fontWeight, 10);
      let colorValue = style.color;
      if (!text && !valueText && placeholder) {
        const pseudo = getComputedStyle(el, "::placeholder");
        fontSizePx = Number.parseFloat(pseudo.fontSize) || fontSizePx;
        fontWeight = Number.parseInt(pseudo.fontWeight, 10) || fontWeight;
        colorValue = pseudo.color || colorValue;
      }
      if (!Number.isFinite(fontSizePx) || fontSizePx <= 0) continue;
      if (!Number.isFinite(fontWeight)) fontWeight = 400;

      const fill = parse(
        (style as CSSStyleDeclaration & { webkitTextFillColor?: string })
          .webkitTextFillColor || colorValue,
      );
      if (fill.a === 0) {
        skippedTransparent += 1;
        continue;
      }

      const { color: background, gradient } = effectiveBackground(el);
      if (gradient) {
        skippedGradient += 1;
        continue;
      }

      const alpha = fill.a * opacityProduct(el);
      if (alpha <= 0.01) {
        skippedTransparent += 1;
        continue;
      }
      const foreground = composite({ ...fill, a: alpha }, background);
      const ratio = contrastRatio(foreground, background);
      const floor =
        fontSizePx >= 24 || (fontSizePx >= 18.66 && fontWeight >= 700)
          ? 3
          : 4.5;
      checked += 1;

      if (ratio < floor) {
        violations.push({
          selector: selectorOf(el),
          ratio: Number(ratio.toFixed(3)),
          floor,
          fontSizePx: Number(fontSizePx.toFixed(2)),
          fontWeight,
          text: visibleText.replace(/\s+/g, " ").slice(0, 60),
        });
      }
    }

    violations.sort((a, b) => a.ratio - b.ratio);
    const worst = violations[0]
      ? {
          selector: violations[0].selector,
          ratio: violations[0].ratio,
          text: violations[0].text,
        }
      : null;

    return {
      checked,
      skippedGradient,
      skippedTiny,
      skippedTransparent,
      violations,
      worst,
    };
  });
}

for (const scenario of SCENARIOS) {
  test.describe(`theme contrast: ${scenario.label}`, () => {
    test.use({ colorScheme: scenario.colorScheme });

    for (const route of ROUTES) {
      test(`${route} — every visible text element meets WCAG AA`, async ({
        page,
      }) => {
        if (scenario.storedTheme) {
          await page.addInitScript((theme: string) => {
            try {
              window.localStorage.setItem("blueskyz-theme", theme);
            } catch {
              // Storage unavailable: the scenario guard below will fail loudly.
            }
          }, scenario.storedTheme);
        }

        await page.goto(route);
        const settleStart = Date.now();
        await settleAnimations(page);
        const settleMs = Date.now() - settleStart;

        // Self-check the matrix: the requested theme mechanism must be active.
        const htmlTheme = await page.locator("html").getAttribute("data-theme");
        if (scenario.storedTheme) {
          expect(htmlTheme, "stored theme attribute").toBe(
            scenario.storedTheme,
          );
        } else {
          expect(htmlTheme, "system theme leaves no attribute").toBeNull();
        }
        const osDark = await page.evaluate(
          () => matchMedia("(prefers-color-scheme: dark)").matches,
        );
        expect(osDark, "OS color-scheme").toBe(scenario.colorScheme === "dark");

        const scanStart = Date.now();
        const report = await scanContrast(page);
        const scanMs = Date.now() - scanStart;
        await test.info().attach(`contrast-${scenario.id}-${route}.json`, {
          body: JSON.stringify(report, null, 2),
          contentType: "application/json",
        });

        const lines = report.violations
          .map(
            (item) =>
              `${item.selector}  ${item.ratio.toFixed(2)}:1 < ${item.floor}:1 ` +
              `(${item.fontSizePx}px/${item.fontWeight}) "${item.text}"`,
          )
          .slice(0, 40);
        // Visible in the list reporter so measurements can be recorded without a report UI.
        console.log(
          `[theme-contrast] ${route} [${scenario.id}] checked=${report.checked} ` +
            `violations=${report.violations.length} ` +
            `worst=${report.worst ? `${report.worst.ratio.toFixed(2)}:1 ${report.worst.selector}` : "none"} ` +
            `skipped(gradient=${report.skippedGradient}, tiny=${report.skippedTiny}, transparent=${report.skippedTransparent}) ` +
            `timing(settle=${settleMs}ms, scan=${scanMs}ms)`,
        );

        expect(
          report.violations,
          `${report.violations.length} contrast violation(s) on ${route} [${scenario.id}]:\n${lines.join("\n")}`,
        ).toEqual([]);
      });
    }
  });
}
