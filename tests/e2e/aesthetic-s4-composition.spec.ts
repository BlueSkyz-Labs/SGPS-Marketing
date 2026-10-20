import { expect, test } from "@playwright/test";

/**
 * Aesthetic S4 (composition). Rendered guards:
 *  - product profiles render no endorsed lockup (BB-03) and never overflow;
 *  - a Verify source separator never begins a line;
 *  - the About founder art is square (bounded height) from 48rem up;
 *  - Verify sources sit directly under their claim (no side column).
 */
const LOCALES = ["en", "vi", "zh", "zh-hant"] as const;

test.describe("S4 composition guards", () => {
  for (const lang of LOCALES) {
    test(`${lang}: profile pages render no endorsed lockup and do not overflow`, async ({
      page,
    }) => {
      for (const slug of ["sotro", "sotam"]) {
        await page.goto(`/${lang}/products/${slug}/`);
        for (const width of [390, 480, 640, 1440]) {
          await page.setViewportSize({ width, height: 900 });
          await expect(
            page.locator(".profile-lockup, .profile-lockup-light"),
            `${slug} @${width}`,
          ).toHaveCount(0);
          const overflow = await page.evaluate(
            () =>
              document.documentElement.scrollWidth >
              document.documentElement.clientWidth,
          );
          expect(overflow, `${slug} overflow at ${width}`).toBe(false);
        }
      }
    });
  }

  test("negative proof: the lockup selector counts a lockup when present", async ({
    page,
  }) => {
    await page.setContent(`<div class="profile-lockup"></div>`);
    await expect(page.locator(".profile-lockup")).toHaveCount(1);
  });

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

  test("verify: rail sits beside its claim at 1440, gap at most --space-8", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/en/verify/");
    const space8 = await page.evaluate(() => {
      const probe = document.createElement("div");
      probe.style.width = "var(--space-8)";
      document.body.append(probe);
      const w = probe.getBoundingClientRect().width;
      probe.remove();
      return w;
    });
    expect(space8).toBe(32);
    const claims = page.locator(".verify-claim");
    const n = await claims.count();
    expect(n).toBeGreaterThan(0);
    for (let i = 0; i < n; i++) {
      const main = await claims
        .nth(i)
        .locator(".verify-claim__main")
        .boundingBox();
      const rail = await claims
        .nth(i)
        .locator("[data-sources-line]")
        .boundingBox();
      expect(rail!.x, `claim ${i} beside`).toBeGreaterThan(
        main!.x + main!.width - 1,
      );
      expect(rail!.y, `claim ${i} aligned`).toBeLessThan(main!.y + 40);
      expect(
        rail!.x - (main!.x + main!.width),
        `claim ${i} gap`,
      ).toBeLessThanOrEqual(space8 + 1);
    }
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
