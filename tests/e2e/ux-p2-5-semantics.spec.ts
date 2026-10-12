import { expect, test, type Page } from "@playwright/test";

/**
 * UX-P2-5: (a) privacy and security expose their section titles as real
 * headings with no skipped level; (b) no link in main has an accessible name
 * that says the same phrase twice (for example "Xem Sổ Trọ: Sổ Trọ").
 */

const LOCALES = ["en", "vi", "zh", "zh-hant"] as const;

/** First level that jumps down by more than one, or null. */
export function firstSkippedLevel(levels: number[]): number | null {
  for (let i = 1; i < levels.length; i += 1) {
    if (levels[i] - levels[i - 1] > 1) return levels[i];
  }
  return null;
}

/**
 * True when a name says one phrase twice: a ": " / " · " segment that is
 * contained in another segment ("Xem Sổ Trọ: Sổ Trọ"), or a multi-word
 * phrase immediately followed by itself.
 */
export function repeatsPhrase(name: string): boolean {
  const n = name.replace(/\s+/g, " ").trim();
  const parts = n.split(/\s*[:·|]\s*/u).filter(Boolean);
  for (let i = 0; i < parts.length; i += 1) {
    for (let j = 0; j < parts.length; j += 1) {
      if (i !== j && parts[i].length > 1 && parts[j].includes(parts[i])) {
        return true;
      }
    }
  }
  return /(^|\s)(\S+(?:\s+\S+)+?)\s+\2(\s|$)/u.test(n);
}

async function outline(page: Page) {
  return page.evaluate(() =>
    [
      ...document.querySelectorAll(
        "main h1, main h2, main h3, main h4, main [role='heading']",
      ),
    ]
      .map((el) => ({
        level: Number(el.getAttribute("aria-level") ?? el.tagName.slice(1)),
        text: (el.textContent ?? "").replace(/\s+/g, " ").trim(),
      }))
      .filter((h) => h.text),
  );
}

test.describe("UX-P2-5 heading outline", () => {
  for (const lang of LOCALES) {
    for (const [route, sections] of [
      ["privacy", 2],
      ["security", 3],
    ] as const) {
      test(`${lang} /${route}/ has H1 then ${sections} H2 and no skipped level`, async ({
        page,
      }) => {
        await page.goto(`/${lang}/${route}/`);
        const heads = await outline(page);
        expect(heads[0].level).toBe(1);
        expect(heads.filter((h) => h.level === 1)).toHaveLength(1);
        expect(heads.filter((h) => h.level === 2)).toHaveLength(sections);
        expect(firstSkippedLevel(heads.map((h) => h.level))).toBeNull();
      });
    }
  }

  test("negative proof: a skipped level and a flat outline are detected", () => {
    expect(firstSkippedLevel([1, 3])).toBe(3);
    expect(firstSkippedLevel([1, 2, 2, 3])).toBeNull();
  });
});

test.describe("UX-P2-5 link names", () => {
  const ROUTES = ["", "products/", "products/sotro/", "products/sotam/"];
  for (const lang of LOCALES) {
    for (const route of ROUTES) {
      test(`${lang}/${route || "home"}: no main link name repeats a phrase`, async ({
        page,
      }) => {
        await page.goto(`/${lang}/${route}`);
        const names = await page.evaluate(() =>
          [...document.querySelectorAll("main a[href]")].map((a) =>
            (a.getAttribute("aria-label") ?? a.textContent ?? "").trim(),
          ),
        );
        expect(names.length).toBeGreaterThan(0);
        expect(names.filter(repeatsPhrase)).toEqual([]);
      });
    }
  }

  test("negative proof: repeated phrases are detected, distinct ones are not", () => {
    expect(repeatsPhrase("Xem Sổ Trọ: Sổ Trọ")).toBe(true);
    expect(repeatsPhrase("Sổ Trọ: Sổ Trọ")).toBe(true);
    expect(repeatsPhrase("View Sổ Trọ View Sổ Trọ")).toBe(true);
    expect(repeatsPhrase("Xem Sổ Trọ")).toBe(false);
    expect(repeatsPhrase("Learn more: Sổ Tâm")).toBe(false);
  });
});
