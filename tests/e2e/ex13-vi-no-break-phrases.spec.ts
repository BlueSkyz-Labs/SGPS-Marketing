import { expect, test } from "@playwright/test";

/**
 * EX-13: in the Vietnamese promise sentence the two-syllable phrases "thông
 * minh", "nhẹ nhàng" and "hiệu quả" never split across lines (a no-break space
 * between the syllables). The wording is unchanged; only the space is.
 */
const NBSP = "\u00a0";
const PHRASES = ["thông minh", "nhẹ nhàng", "hiệu quả"] as const;

const joined = (phrase: string) => phrase.replace(" ", NBSP);

for (const [path, selector] of [
  ["/vi/", "h1"],
  ["/vi/about/", "main"],
] as const) {
  test(`${path}: the promise phrases hold together`, async ({ page }) => {
    await page.goto(path);
    const text = await page.locator(selector).first().innerText();
    test.skip(
      !text.includes("Chúng") || !/sản\s+phẩm/.test(text),
      "the promise sentence is not on this page",
    );
    for (const phrase of PHRASES) {
      expect(text, `${path} ${phrase}`).toContain(joined(phrase));
    }
  });
}

test("negative proof (EX-13): a plain space between the syllables is detected", async ({
  page,
}) => {
  await page.goto("/vi/");
  await page.evaluate(() => {
    const h1 = document.querySelector("h1")!;
    h1.textContent = h1.textContent!.replace(/\u00a0/g, " ");
  });
  const text = await page.locator("h1").innerText();
  for (const phrase of PHRASES) {
    expect(text.includes(joined(phrase)), phrase).toBe(false);
  }
});
