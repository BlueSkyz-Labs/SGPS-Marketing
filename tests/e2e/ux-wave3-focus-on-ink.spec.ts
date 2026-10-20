import { expect, test, type Page } from "@playwright/test";

/**
 * Audit C-01 (WCAG 1.4.11): on always-ink surfaces (footer, home hero, phone
 * back-to-top strip) the light-theme focus ring must keep >= 3:1 against the
 * ink. The header's ink scene already re-points the ring; these did not and
 * measured 2.8:1.
 */
const INK = [11, 16, 32]; // --brand-ink #0b1020

const channel = (c: number) =>
  c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
const luminance = ([r, g, b]: number[]) =>
  0.2126 * channel(r / 255) +
  0.7152 * channel(g / 255) +
  0.0722 * channel(b / 255);
export const contrast = (a: number[], b: number[]) => {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/** Computed colour (rgb(), color(srgb ...) or oklab()) as 0-255 sRGB channels. */
export const parseColour = (value: string): number[] => {
  const srgb = /color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)/.exec(value);
  const oklab = /oklab\(([-\d.]+) ([-\d.]+) ([-\d.]+)/.exec(value);
  if (oklab) {
    const [L, a, b] = oklab.slice(1, 4).map(Number);
    const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
    const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
    const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
    const lin = [
      4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
      -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
      -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
    ];
    return lin.map((c) => {
      const v = Math.min(1, Math.max(0, c));
      return (
        255 * (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055)
      );
    });
  }
  if (srgb) return srgb.slice(1, 4).map((v) => Number(v) * 255);
  const rgb = /rgba?\(([\d.]+),\s*([\d.]+),\s*([\d.]+)/.exec(value);
  if (rgb) return rgb.slice(1, 4).map(Number);
  throw new Error(`unparsed colour ${value}`);
};

async function ringOf(page: Page, selector: string) {
  const target = page.locator(selector).first();
  await page.keyboard.press("Tab"); // keyboard modality for :focus-visible
  await target.focus();
  return target.evaluate((el) => {
    // transition-colors also animates outline-color: settle it so the ring
    // is read at its resting colour, not mid-fade from the text colour.
    for (const animation of el.getAnimations()) animation.finish();
    const cs = getComputedStyle(el);
    return { style: cs.outlineStyle, colour: cs.outlineColor };
  });
}

const TARGETS = [
  ["/en/", ".site-footer a.footer-nav-link", 1440],
  ["/vi/", ".site-footer a.footer-nav-link", 390],
  ["/en/", "a.hero-entry-chip", 390],
  ["/en/products/", "a.back-to-top", 390],
] as const;

for (const [path, selector, width] of TARGETS) {
  test(`light ${path} ${width}: ${selector} focus ring >= 3:1 on ink`, async ({
    page,
  }) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.setViewportSize({ width, height: 900 });
    await page.goto(path);
    test.skip(
      (await page.locator(selector).count()) === 0,
      `${selector} not rendered on ${path}`,
    );
    const ring = await ringOf(page, selector);
    expect(ring.style).not.toBe("none");
    expect(contrast(parseColour(ring.colour), INK)).toBeGreaterThanOrEqual(3);
  });
}

test("negative proof: the light page ring on ink is under 3:1", () => {
  expect(contrast(parseColour("rgb(29, 78, 216)"), INK)).toBeLessThan(3);
  expect(
    contrast(parseColour("color(srgb 0.47 0.62 1)"), INK),
  ).toBeGreaterThanOrEqual(3);
});

test("negative proof: with the page ring the footer link fails", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/en/");
  await page.addStyleTag({
    content: ".site-footer :focus-visible{outline-color:#1d4ed8!important}",
  });
  const ring = await ringOf(page, ".site-footer a.footer-nav-link");
  expect(contrast(parseColour(ring.colour), INK)).toBeLessThan(3);
});
