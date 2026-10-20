import { expect, test, type Page } from "@playwright/test";

// G10: the home H1 steps from 32px to 44px at 768px (the inner-page H1
// breakpoint) instead of 1024px, so it never reads smaller than a 32px H2.

const LOCALES = ["en", "vi", "zh", "zh-hant"] as const;
const CASES = [
  { width: 767, h1: 32 },
  { width: 768, h1: 44 },
  { width: 1023, h1: 44 },
] as const;

/** Problems with the home H1 at the current viewport; empty means correct. */
async function h1Problems(page: Page, expected: number): Promise<string[]> {
  return page.evaluate((want) => {
    const out: string[] = [];
    const h1 = document.querySelector("main h1");
    if (!h1) return ["missing h1"];
    const size = parseFloat(getComputedStyle(h1).fontSize);
    if (size !== want) out.push(`h1=${size} expected ${want}`);
    for (const h2 of document.querySelectorAll("main h2")) {
      const cs = getComputedStyle(h2);
      if (cs.display === "none" || cs.visibility === "hidden") continue;
      const s = parseFloat(cs.fontSize);
      if (size < s) out.push(`h1 ${size} < h2 ${s}`);
    }
    return out;
  }, expected);
}

for (const lang of LOCALES) {
  for (const { width, h1 } of CASES) {
    test(`/${lang}/ home H1 is ${h1}px at ${width}px and >= every H2`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/${lang}/`);
      expect(await h1Problems(page, h1)).toEqual([]);
      expect(
        await page.evaluate(
          () =>
            document.documentElement.scrollWidth <=
            document.documentElement.clientWidth,
        ),
      ).toBe(true);
    });
  }
}

test("negative proof: the predicate rejects a 32px H1 at 768px", async ({
  page,
}) => {
  await page.setViewportSize({ width: 768, height: 900 });
  await page.goto("/en/");
  await page.addStyleTag({
    content: "main h1 { font-size: 32px !important; }",
  });
  const problems = await h1Problems(page, 44);
  expect(problems).toContain("h1=32 expected 44");
});
