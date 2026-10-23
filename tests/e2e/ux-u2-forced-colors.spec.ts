import { expect, test, type Page } from "@playwright/test";

/**
 * UX-U2 (C-06): in forced-colors mode the brand lockup (header, Home ink
 * header, footer) must stay visible against the forced Canvas. We measure
 * rendered pixels, not CSS strings.
 */

const ROUTES = ["/vi/", "/en/", "/vi/products/sotro/"];
const SCHEMES = ["light", "dark"] as const;
const MIN_INK = 0.02;

// Playwright emulates `forced-colors` only in Chromium; elsewhere the media
// query silently stays inactive, so the measurement would be meaningless.
test.skip(
  ({ browserName }) => browserName !== "chromium",
  "forced-colors emulation is Chromium-only in Playwright",
);

async function enterForcedColors(
  page: Page,
  colorScheme: "light" | "dark",
  route: string,
) {
  await page.emulateMedia({ forcedColors: "active", colorScheme });
  await page.goto(route);
  expect(
    await page.evaluate(() => matchMedia("(forced-colors: active)").matches),
    "forced-colors emulation must be active",
  ).toBe(true);
}

/** Share of pixels of the element's screenshot that contrast with Canvas. */
async function inkRatio(page: Page, selector: string): Promise<number> {
  const el = page.locator(selector).first();
  await el.scrollIntoViewIfNeeded();
  const box = await el.boundingBox();
  expect(box && box.width > 0 && box.height > 0, `${selector} has size`).toBe(
    true,
  );
  const canvas = await page.evaluate(() => {
    const probe = document.createElement("div");
    probe.style.cssText = "background-color:Canvas;position:fixed";
    document.body.append(probe);
    const c = getComputedStyle(probe).backgroundColor;
    probe.remove();
    return c.match(/\d+/g)!.slice(0, 3).map(Number);
  });
  // Capture the element itself, not a page clip from an earlier bounding box:
  // a reflow between measuring and capturing (seen in CI on the long Sổ Trọ
  // page) moved the logo out of the clip and the ratio fell to one stray row.
  const png = await el.screenshot({ animations: "disabled" });
  return page.evaluate(
    async ({ b64, canvas }) => {
      const blob = await (await fetch(`data:image/png;base64,${b64}`)).blob();
      const bmp = await createImageBitmap(blob);
      const cv = new OffscreenCanvas(bmp.width, bmp.height);
      const ctx = cv.getContext("2d")!;
      ctx.drawImage(bmp, 0, 0);
      const d = ctx.getImageData(0, 0, bmp.width, bmp.height).data;
      let n = 0;
      for (let i = 0; i < d.length; i += 4) {
        const diff =
          Math.abs(d[i] - canvas[0]) +
          Math.abs(d[i + 1] - canvas[1]) +
          Math.abs(d[i + 2] - canvas[2]);
        if (diff > 300) n++;
      }
      return n / (d.length / 4);
    },
    { b64: png.toString("base64"), canvas },
  );
}

for (const scheme of SCHEMES) {
  for (const route of ROUTES) {
    test(`logo visible in forced-colors ${scheme} ${route}`, async ({
      page,
    }) => {
      await enterForcedColors(page, scheme, route);
      for (const sel of [
        "header .brand-lockup img:visible",
        "footer .brand-lockup img:visible",
      ]) {
        await expect(page.locator(sel).first()).toBeVisible();
        expect(
          await inkRatio(page, sel),
          `${route} ${scheme} ${sel}`,
        ).toBeGreaterThan(MIN_INK);
      }
    });
  }
}

test("negative proof: without the filter the reverse mark vanishes on light Canvas", async ({
  page,
}) => {
  await enterForcedColors(page, "light", "/vi/");
  await page.addStyleTag({
    content: ".brand-lockup__img{filter:none !important}",
  });
  expect(await inkRatio(page, "footer .brand-lockup img:visible")).toBeLessThan(
    MIN_INK,
  );
});
