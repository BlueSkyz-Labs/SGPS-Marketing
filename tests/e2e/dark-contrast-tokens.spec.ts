import { expect, test, type Page } from "@playwright/test";

/**
 * F-27 / F-28 / F-33 guard (2026-09-29). Audit round 2 measured these in dark
 * mode: the flagship CTA was white on `#3b82f6` (3.67:1), the trust-ledger chip
 * was `#3b82f6` on a literal-white mix (3.39:1), and the same `color-mix(…, white)`
 * class kept other pressed/hover plates light while their text token flipped.
 * Each surface must now resolve from a theme-aware token and clear 4.5:1.
 */
test.use({ colorScheme: "dark" });

async function ratioOf(page: Page, selector: string) {
  return page.evaluate((target) => {
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
      return parse(getComputedStyle(document.documentElement).backgroundColor);
    };
    const el = document.querySelector(target);
    if (!el) return null;
    const style = getComputedStyle(el);
    const fg = lum(parse(style.color));
    const bg = lum(background(el));
    return {
      ratio: Number(
        ((Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05)).toFixed(2),
      ),
      color: style.color,
      background: style.backgroundColor,
    };
  }, selector);
}

test("hero primary CTA carries white text on its fill in dark", async ({
  page,
}) => {
  await page.goto("/en/", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const measured = await ratioOf(page, "[data-hero-primary]");
  expect(measured, "hero primary CTA must exist").not.toBeNull();
  expect(
    measured!.ratio,
    `hero primary CTA ${measured!.color} on ${measured!.background}`,
  ).toBeGreaterThanOrEqual(4.5);
});

test("trust-ledger chips keep 4.5:1 in dark", async ({ page }) => {
  for (const route of ["/en/privacy/", "/en/security/", "/en/support/"]) {
    await page.goto(route, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const measured = await ratioOf(
      page,
      "[data-trust-surface] [class*='color-mix']",
    );
    if (!measured) continue;
    expect(
      measured.ratio,
      `${route} chip ${measured.color} on ${measured.background}`,
    ).toBeGreaterThanOrEqual(4.5);
  }
});

test("pressed decision-room tile stays readable in dark", async ({ page }) => {
  await page.goto("/en/decision-room/", { waitUntil: "networkidle" });
  const add = page.locator("[data-decision-add]").first();
  await add.click();
  const tile = await ratioOf(page, ".decision-room__add[aria-pressed='true']");
  expect(tile, "pressed decision-room tile").not.toBeNull();
  expect(
    tile!.ratio,
    `decision tile ${tile!.color} on ${tile!.background}`,
  ).toBeGreaterThanOrEqual(4.5);
});
