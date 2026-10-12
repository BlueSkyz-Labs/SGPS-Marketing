import { expect, test } from "@playwright/test";

/**
 * Aesthetic S4 (composition). Rendered guards:
 *  - endorsed product lockup is >= 160 px wide (Brand Kit v4 full-lockup
 *    digital minimum) from the sm breakpoint up, in every locale;
 *  - a Verify source separator never begins a line;
 *  - the About founder art is square (bounded height) from 48rem up;
 *  - Verify sources sit directly under their claim (no side column).
 */
const LOCALES = ["en", "vi", "zh", "zh-hant"] as const;

test.describe("S4 composition guards", () => {
  for (const lang of LOCALES) {
    test(`${lang}: endorsed lockup is at least 160px wide at sm+`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(`/${lang}/products/sotro/`);
      const box = await page
        .locator(".profile-lockup-light")
        .evaluate((el) => el.getBoundingClientRect().width);
      expect(box).toBeGreaterThanOrEqual(160);
      await page.setViewportSize({ width: 640, height: 900 });
      const sm = await page
        .locator(".profile-lockup-light")
        .evaluate((el) => el.getBoundingClientRect().width);
      expect(sm).toBeGreaterThanOrEqual(160);
    });
  }

  test("verify: separator never begins a line, touch target kept", async ({
    page,
  }) => {
    for (const width of [320, 360, 390, 480]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/en/verify/");
      const bad = await page.evaluate(() => {
        const out: string[] = [];
        for (const sep of document.querySelectorAll(".sources-line__sep")) {
          const link = sep.parentElement?.querySelector("a");
          if (!link) continue;
          const s = sep.getBoundingClientRect();
          const l = link.getBoundingClientRect();
          // The separator trails its link on the same line, never leads one.
          // Same line as its link and strictly after it: it trails, never leads.
          if (s.left < l.right - 1) out.push("leads-link");
          const line = sep.closest("[data-sources-line]")!;
          const first = line.getBoundingClientRect().left;
          if (s.left - first < 4) out.push("line-start");
          if (
            Math.abs(s.top + s.height / 2 - (l.top + l.height / 2)) > l.height
          )
            out.push("different-line");
        }
        for (const a of document.querySelectorAll(".sources-line__link")) {
          if (a.getBoundingClientRect().height < 43.5) out.push("touch");
        }
        if (document.querySelectorAll(".sources-line__sep").length === 0)
          out.push("no-separators-rendered");
        return out;
      });
      expect(bad, `width ${width}`).toEqual([]);
    }
  });

  test("verify: sources sit under the claim at desktop width", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/en/verify/");
    const claim = page.locator(".verify-claim").first();
    const main = await claim.locator(".verify-claim__main").boundingBox();
    const src = await claim.locator("[data-sources-line]").boundingBox();
    expect(main && src).toBeTruthy();
    expect(src!.y).toBeGreaterThanOrEqual(main!.y + main!.height - 1);
    expect(Math.abs(src!.x - main!.x)).toBeLessThan(2);
  });

  test("about: founder art is square and bounded at 48rem+", async ({
    page,
  }) => {
    for (const width of [768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/en/about/");
      const b = await page
        .locator(".about-founder__art")
        .evaluate((el) => el.getBoundingClientRect());
      expect(Math.abs(b.width - b.height), `width ${width}`).toBeLessThan(2);
      expect(b.height).toBeLessThanOrEqual(640);
    }
  });
});
