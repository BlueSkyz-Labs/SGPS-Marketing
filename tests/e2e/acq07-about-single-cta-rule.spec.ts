import { expect, test, type Page } from "@playwright/test";

// ACQ-07: About has no in-page CTA pair (the next-steps band is the one close),
// and exactly one rule under the H1.

const LOCALES = ["en", "vi", "zh", "zh-hant"] as const;

/** Problems with the About page structure; empty means correct. */
async function aboutProblems(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const out: string[] = [];
    const band = document.querySelector("[data-journey-bar]");
    if (!band) out.push("next-steps band missing");
    const ctas = [
      ...document.querySelectorAll("main [data-button-variant]"),
    ].filter((el) => !band?.contains(el));
    if (ctas.length > 0) out.push(`in-page CTA buttons=${ctas.length}`);
    const marks = document.querySelectorAll("main [data-horizon-rule]");
    if (marks.length !== 1) out.push(`horizon rules=${marks.length}`);
    const header = document.querySelector("main [data-page-header]");
    const h1 = document.querySelector("main h1");
    if (!header || !h1 || !header.contains(h1)) out.push("header missing");
    else {
      const cs = getComputedStyle(header);
      if (
        parseFloat(cs.borderBottomWidth) > 0 &&
        cs.borderBottomStyle !== "none"
      )
        out.push("extra border rule under header");
    }
    return out;
  });
}

for (const lang of LOCALES) {
  for (const width of [390, 1440]) {
    test(`/${lang}/about/ has no CTA pair and one rule under H1 at ${width}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`/${lang}/about/`);
      expect(await aboutProblems(page)).toEqual([]);
    });
  }
}

test("negative proof: the guard fails on a CTA pair and a second rule", async ({
  page,
}) => {
  await page.goto("/en/about/");
  await page.evaluate(() => {
    const main = document.querySelector("main")!;
    const a = document.createElement("a");
    a.href = "/en/contact/";
    a.setAttribute("data-button-variant", "primary");
    main.append(a);
    (
      document.querySelector("[data-page-header]") as HTMLElement
    ).style.borderBottom = "1px solid red";
  });
  const problems = await aboutProblems(page);
  expect(problems).toContain("in-page CTA buttons=1");
  expect(problems).toContain("extra border rule under header");
  await page.evaluate(() =>
    document.querySelector("[data-journey-bar]")?.remove(),
  );
  expect(await aboutProblems(page)).toContain("next-steps band missing");
});
