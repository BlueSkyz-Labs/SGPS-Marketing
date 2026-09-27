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
