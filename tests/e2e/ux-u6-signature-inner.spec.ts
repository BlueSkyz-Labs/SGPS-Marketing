import { expect, test, type Page } from "@playwright/test";

const ROUTES = [
  "/en/products/",
  "/en/products/sotam/",
  "/en/about/",
  "/en/verify/",
  "/en/contact/",
  "/en/support/",
  "/en/privacy/",
  "/en/security/",
  "/en/404/",
];
const VIEWPORTS = [
  { width: 390, height: 844 },
  { width: 1440, height: 900 },
];

/** Returns the guard's findings; empty means the signature is correct. */
async function horizonProblems(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const out: string[] = [];
    const marks = document.querySelectorAll("main [data-horizon-rule]");
    if (marks.length !== 1) out.push(`count=${marks.length}`);
    const mark = marks[0] as HTMLElement | undefined;
    const h1 = document.querySelector("main h1");
    if (!mark || !h1) return [...out, "missing mark or h1"];
    if (mark.getAttribute("aria-hidden") !== "true")
      out.push("not aria-hidden");
    const box = mark.getBoundingClientRect();
    if (box.width <= 0 || box.height <= 0) out.push("zero box");
    if (
      box.top + window.scrollY <
      h1.getBoundingClientRect().bottom + window.scrollY - 1
    )
      out.push("not under h1");
    return out;
  });
}

for (const vp of VIEWPORTS) {
  for (const route of ROUTES) {
    test(`horizon signature under H1 on ${route} at ${vp.width}`, async ({
      page,
    }) => {
      await page.setViewportSize(vp);
      await page.goto(route);
      expect(await horizonProblems(page)).toEqual([]);
    });
  }
}

test("negative proof: the guard fails when the horizon is removed or exposed", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en/about/");
  await page.evaluate(() =>
    document
      .querySelector("[data-horizon-rule]")
      ?.removeAttribute("aria-hidden"),
  );
  expect(await horizonProblems(page)).toContain("not aria-hidden");
  await page.evaluate(() =>
    document.querySelector("[data-horizon-rule]")?.remove(),
  );
  expect(await horizonProblems(page)).toContain("count=0");
});

test("no horizontal overflow at 320 with the signature", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/en/404/");
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth,
    ),
  ).toBe(false);
});
