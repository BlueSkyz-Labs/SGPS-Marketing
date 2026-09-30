import { expect, test, type Page } from "@playwright/test";

/**
 * Experience v6 S4 — display typeface and fluid scale.
 * - EN/VI display headings resolve to the display face, which really loads
 *   (Vietnamese subset on /vi/ with the stacked diacritics in the copy).
 * - zh / zh-hant headings stay on the CJK stack and do not leave a one-glyph or
 *   punctuation-only orphan line at 390 px.
 * - Display headings are never below 28 px and body/H3 keep Inter.
 */
const settle = (page: Page) =>
  page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise((r) =>
      requestAnimationFrame(() => requestAnimationFrame(r)),
    );
  });

test.describe("display typeface", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  for (const lang of ["en", "vi"] as const) {
    test(`/${lang}/ h1 uses the loaded display face`, async ({ page }) => {
      await page.goto(`/${lang}/`);
      await settle(page);
      const info = await page.evaluate(() => {
        const h1 = document.querySelector("h1") as HTMLElement;
        const cs = getComputedStyle(h1);
        const loaded = [...document.fonts]
          .filter(
            (f) => f.family.includes("Display Face") && f.status === "loaded",
          )
          .map((f) => f.unicodeRange);
        return {
          family: cs.fontFamily,
          size: parseFloat(cs.fontSize),
          weight: cs.fontWeight,
          loaded,
          clips: cs.overflow !== "visible",
          bodyFamily: getComputedStyle(document.body).fontFamily,
        };
      });
      expect(info.family).toMatch(/^"?Display Face"?/);
      expect(info.size).toBeGreaterThanOrEqual(28);
      expect(info.weight).toBe("700");
      expect(info.loaded.length).toBeGreaterThan(0);
      // Nothing may clip the tone-mark stacks above/below the line box.
      expect(info.clips).toBe(false);
      expect(info.bodyFamily).toMatch(/Inter/);
      if (lang === "vi") {
        expect(info.loaded.join(" ")).toContain("1EA0");
      }
    });
  }

  test("display face is never applied below h1/h2 or to body copy", async ({
    page,
  }) => {
    await page.goto("/en/");
    await settle(page);
    const offenders = await page.evaluate(() =>
      [...document.querySelectorAll("body *")]
        .filter((el) => /Display Face/.test(getComputedStyle(el).fontFamily))
        .filter((el) => !el.closest("h1, h2"))
        .map((el) => el.tagName),
    );
    expect(offenders).toEqual([]);
  });

  for (const lang of ["zh", "zh-hant"] as const) {
    test(`/${lang}/ headings use the CJK stack without orphan lines`, async ({
      page,
    }) => {
      await page.goto(`/${lang}/`);
      await settle(page);
      const result = await page.evaluate(() => {
        const out: {
          text: string;
          lines: string[];
          family: string;
          lb: string;
        }[] = [];
        for (const h of document.querySelectorAll<HTMLElement>("h1, h2")) {
          const text = h.textContent?.trim() ?? "";
          if (!/[㐀-鿿]/.test(text) || text.length < 6) continue;
          const node =
            h.firstChild?.nodeType === 3
              ? h.firstChild
              : h.querySelector("*")?.firstChild;
          if (!node || node.nodeType !== 3) continue;
          const range = document.createRange();
          const lines: string[] = [];
          let top = -1;
          const t = node.textContent ?? "";
          for (let i = 0; i < t.length; i += 1) {
            range.setStart(node, i);
            range.setEnd(node, i + 1);
            const r = range.getClientRects()[0];
            if (!r) continue;
            if (Math.abs(r.top - top) > 4) {
              lines.push("");
              top = r.top;
            }
            lines[lines.length - 1] += t[i];
          }
          const cs = getComputedStyle(h);
          out.push({ text, lines, family: cs.fontFamily, lb: cs.lineBreak });
        }
        return out;
      });
      expect(result.length).toBeGreaterThan(0);
      for (const h of result) {
        expect(h.family).not.toMatch(/Display Face/);
        expect(h.lb).toBe("strict");
        for (const line of h.lines.slice(1)) {
          const trimmed = line.trim();
          expect(
            trimmed.length,
            `orphan line "${trimmed}" in ${h.text}`,
          ).toBeGreaterThanOrEqual(2);
          expect(
            trimmed,
            `line starts with closing punctuation in ${h.text}`,
          ).not.toMatch(/^[，。、；：！？）」』]/);
        }
      }
    });
  }
});
