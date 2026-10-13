import { test, expect } from "@playwright/test";

/**
 * UX U3 (red-team A4, A7): zh-Hant display headings order Traditional (TC)
 * families before Simplified ones; zh keeps SC first; zh/zh-hant main text has
 * no ASCII comma between CJK characters.
 */
const CJK = "㐀-鿿";
const ASCII_COMMA_BETWEEN_CJK = new RegExp(`[${CJK}],\\s?[${CJK}]`);

const familyIndex = (list: string[], re: RegExp) =>
  list.findIndex((f) => re.test(f));

async function h1Families(page: import("@playwright/test").Page) {
  const raw = await page
    .locator("h1")
    .first()
    .evaluate((el) => getComputedStyle(el).fontFamily);
  return raw.split(",").map((f) => f.trim().replace(/["']/g, ""));
}

const TC =
  /PingFang TC|Noto Sans TC|Noto Sans CJK TC|Source Han Sans TC|JhengHei|CNS/;
const SC = /PingFang SC|Noto Sans SC|Noto Sans CJK SC|YaHei|Hiragino Sans GB/;

test.describe("U3 zh type and punctuation", () => {
  test("zh-Hant h1 lists a TC family before any SC family", async ({
    page,
  }) => {
    await page.goto("/zh-hant/");
    const fams = await h1Families(page);
    const tc = familyIndex(fams, TC);
    const sc = familyIndex(fams, SC);
    expect(tc).toBeGreaterThanOrEqual(0);
    if (sc >= 0) expect(tc).toBeLessThan(sc);
  });

  test("zh h1 keeps a SC family first", async ({ page }) => {
    await page.goto("/zh/");
    const fams = await h1Families(page);
    const tc = familyIndex(fams, TC);
    const sc = familyIndex(fams, SC);
    expect(sc).toBeGreaterThanOrEqual(0);
    if (tc >= 0) expect(sc).toBeLessThan(tc);
  });

  for (const route of [
    "/zh/",
    "/zh-hant/",
    "/zh/products/sotro/",
    "/zh-hant/products/sotro/",
    "/zh/products/sotam/",
    "/zh-hant/products/sotam/",
  ]) {
    test(`no ASCII comma between CJK on ${route}`, async ({ page }) => {
      await page.goto(route);
      const text = await page.locator("main").innerText();
      expect(text).not.toMatch(ASCII_COMMA_BETWEEN_CJK);
    });
  }

  test("negative proof: guards detect the broken forms", async () => {
    expect("開發中, 尚未上架").toMatch(ASCII_COMMA_BETWEEN_CJK);
    expect("開發中，尚未上架").not.toMatch(ASCII_COMMA_BETWEEN_CJK);
    const bad = ["Inter Variable", "PingFang SC", "PingFang TC"];
    expect(familyIndex(bad, TC)).toBeGreaterThan(familyIndex(bad, SC));
  });

  test("negative proof: SC-first order is detected on a live zh-Hant h1", async ({
    page,
  }) => {
    await page.goto("/zh-hant/");
    await page
      .locator("h1")
      .first()
      .evaluate((el) => {
        el.style.fontFamily = '"PingFang SC", "PingFang TC"';
      });
    const fams = await h1Families(page);
    expect(familyIndex(fams, TC)).toBeGreaterThan(familyIndex(fams, SC));
  });
});
