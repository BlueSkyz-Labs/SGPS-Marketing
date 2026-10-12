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
    test(`${lang}: endorsed lockup is at least 160px wide from 480px up`, async ({
      page,
    }) => {
      await page.goto(`/${lang}/products/sotro/`);
      // The lockup shows from 480px; it must meet the minimum at every width.
      for (const width of [480, 560, 640, 1440]) {
        await page.setViewportSize({ width, height: 900 });
        const box = await page
          .locator(".profile-lockup-light")
          .evaluate((el) => el.getBoundingClientRect().width);
        expect(box, `width ${width}`).toBeGreaterThanOrEqual(160);
        // Reserved box (1500:420) so the lazy lockup cannot shift layout.
        const attrs = await page
          .locator(".profile-lockup img")
          .evaluateAll((els) =>
            els.map((e) => [
              e.getAttribute("width"),
              e.getAttribute("height"),
              e.getAttribute("loading"),
            ]),
          );
        expect(attrs, `lockup attrs at ${width}`).toEqual([
          ["1500", "420", "lazy"],
          ["1500", "420", "lazy"],
        ]);
        const overflow = await page.evaluate(
          () =>
            document.documentElement.scrollWidth >
            document.documentElement.clientWidth,
        );
        expect(overflow, `overflow at ${width}`).toBe(false);
      }
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

  test("verify/security/privacy: every source link owns its whole tap area", async ({
    page,
  }) => {
    for (const lang of ["en", "vi"]) {
      for (const route of ["verify", "security", "privacy"]) {
        for (const width of [320, 390]) {
          await page.setViewportSize({ width, height: 900 });
          await page.goto(`/${lang}/${route}/`);
          const bad = await page.evaluate(() => {
            const out: string[] = [];
            const links = [
              ...document.querySelectorAll<HTMLElement>(".sources-line__link"),
            ];
            links.forEach((a, i) => {
              a.scrollIntoView({ block: "center" });
              // Each link may span several lines; sample every client rect.
              for (const rect of a.getClientRects()) {
                const pts: [number, number][] = [];
                for (const fx of [0.06, 0.25, 0.5, 0.75, 0.94])
                  for (const fy of [0.06, 0.25, 0.5, 0.75, 0.94])
                    pts.push([
                      rect.left + rect.width * fx,
                      rect.top + rect.height * fy,
                    ]);
                for (const [x, y] of pts) {
                  const hit = document.elementFromPoint(x, y);
                  if (hit?.closest(".sources-line__link") !== a)
                    out.push(`link ${i} at ${Math.round(x)},${Math.round(y)}`);
                }
              }
            });
            return out;
          });
          expect(bad, `${lang}/${route} @${width}`).toEqual([]);
        }
      }
    }
  });
});
