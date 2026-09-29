import { expect, test } from "@playwright/test";

/**
 * OS dark mode (no stored preference) must keep text readable on raised
 * cards, secondary actions and the footer. Regression: literal white
 * surfaces under dark text tokens rendered white-on-white.
 */
test.use({ colorScheme: "dark" });

const ROUTES = ["/en/", "/vi/", "/en/products/", "/en/privacy/"];

for (const route of ROUTES) {
  test(`${route} keeps card, action and footer text readable in OS dark`, async ({
    page,
  }) => {
    await page.goto(route);
    const worst = await page.evaluate(() => {
      const channel = (v: number) => {
        const c = v / 255;
        return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
      };
      const parse = (value: string) => {
        const probe = document.createElement("canvas").getContext("2d")!;
        probe.fillStyle = value;
        probe.fillRect(0, 0, 1, 1);
        const [r, g, b, a] = probe.getImageData(0, 0, 1, 1).data;
        return { r: r!, g: g!, b: b!, a: a! / 255 };
      };
      const lum = ({ r, g, b }: { r: number; g: number; b: number }) =>
        0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
      const background = (el: Element | null) => {
        for (let node = el; node; node = node.parentElement) {
          const c = parse(getComputedStyle(node).backgroundColor);
          if (c.a > 0.9) return c;
        }
        return parse(
          getComputedStyle(document.documentElement).backgroundColor,
        );
      };
      const selectors = [
        "[data-product-card] h3",
        "[data-product-card] p",
        "footer a",
        "footer p",
        "a.inline-flex",
      ];
      let min = { ratio: 21, text: "" };
      for (const el of document.querySelectorAll(selectors.join(","))) {
        const box = el.getBoundingClientRect();
        if (!box.width || !box.height || !(el as HTMLElement).innerText.trim())
          continue;
        const fg = lum(parse(getComputedStyle(el).color));
        const bg = lum(background(el));
        const ratio = (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
        if (ratio < min.ratio)
          min = { ratio, text: (el as HTMLElement).innerText.slice(0, 40) };
      }
      return min;
    });
    expect(
      worst.ratio,
      `lowest contrast: "${worst.text}"`,
    ).toBeGreaterThanOrEqual(3);
  });
}

/**
 * F-21 guard (2026-09-29). The header mounts the language switcher with the
 * "light" shell, whose active pill used `--surface-raised` (theme aware) with a
 * fixed ink text token: in dark mode that rendered rgb(11,16,32) on
 * rgb(15,23,42) = 1.06:1 and the original guard never looked at
 * `[data-language-choice]`, so it stayed green. This guard reads the rendered
 * colours per language choice in the three theme configurations and keeps the
 * 4.5:1 small-text floor. It is deliberately stricter than the surface scan
 * above (which allows 3:1 for large text).
 */
const CHOICE_ROUTES = ["/en/products/", "/vi/products/sotro/"];

interface ChoiceContrast {
  lang: string;
  state: string;
  text: string;
  color: string;
  background: string;
  ratio: number;
}

async function languageChoiceContrast(page: import("@playwright/test").Page) {
  return page.evaluate((): ChoiceContrast[] => {
    const channel = (v: number) => {
      const c = v / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    };
    const parse = (value: string) => {
      const probe = document.createElement("canvas").getContext("2d")!;
      probe.fillStyle = value;
      probe.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = probe.getImageData(0, 0, 1, 1).data;
      return { r: r!, g: g!, b: b!, a: a! / 255 };
    };
    const lum = ({ r, g, b }: { r: number; g: number; b: number }) =>
      0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
    const background = (el: Element | null) => {
      for (let node = el; node; node = node.parentElement) {
        const c = parse(getComputedStyle(node).backgroundColor);
        if (c.a > 0.9)
          return { c, value: getComputedStyle(node).backgroundColor };
      }
      const root = getComputedStyle(document.documentElement).backgroundColor;
      return { c: parse(root), value: root };
    };

    const results: ChoiceContrast[] = [];
    for (const el of document.querySelectorAll("[data-language-choice]")) {
      const box = el.getBoundingClientRect();
      if (!box.width || !box.height) continue;
      const style = getComputedStyle(el);
      const label =
        el.querySelector(".lang-toggle-code")?.textContent?.trim() ?? "";
      const fg = lum(parse(style.color));
      const { c: bg, value: bgValue } = background(el);
      const ratio =
        (Math.max(fg, lum(bg)) + 0.05) / (Math.min(fg, lum(bg)) + 0.05);
      results.push({
        lang: el.getAttribute("data-language-choice") ?? "?",
        state: el.getAttribute("aria-current") === "page" ? "active" : "idle",
        text: label,
        color: style.color,
        background: bgValue,
        ratio: Number(ratio.toFixed(2)),
      });
    }
    return results;
  });
}

for (const config of [
  { name: "OS dark", colorScheme: "dark", theme: null },
  { name: "data-theme dark", colorScheme: "light", theme: "dark" },
  { name: "light", colorScheme: "light", theme: "light" },
] as const) {
  test(`language switcher labels stay readable in ${config.name}`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: config.colorScheme });
    if (config.theme) {
      await page.addInitScript((value: string) => {
        try {
          window.localStorage.setItem("blueskyz-theme", value);
        } catch {
          // storage is optional; the OS preference decides instead
        }
      }, config.theme);
    }
    for (const route of CHOICE_ROUTES) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      const results = await languageChoiceContrast(page);
      expect(
        results.length,
        `${route} must render language choices`,
      ).toBeGreaterThan(0);
      for (const result of results) {
        expect(
          result.ratio,
          `${route} ${config.name}: "${result.text}" (${result.lang}, ${result.state}) ${result.color} on ${result.background}`,
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
}
