import { expect, test, type Page } from "@playwright/test";
import {
  documentLang,
  rewriteHeadings,
  wrapWords,
} from "../../src/integrations/cjk-heading-breaks.mjs";

/**
 * UX S06 (audit 2026-10-15): Chinese headings broke inside words at
 * 320–390px ("智能化产 | 品", "私 | 有"). The build now wraps each Chinese word
 * and short Latin run such as "Sổ Trọ" in zh-Hans / zh-Hant h1–h3 in a
 * nowrap span; headings keep word-break: normal.
 */
const LANGS = ["zh", "zh-hant"] as const;
const ROUTES = [
  "/",
  "/products/",
  "/products/sotro/",
  "/products/sotam/",
  "/about/",
  "/contact/",
  "/security/",
  "/verify/",
  "/privacy/",
  "/support/",
];
const WIDTHS = [320, 390];

test("negative proof: the build pass wraps words and leaves other text alone", () => {
  const seg = new Intl.Segmenter("zh-Hans", { granularity: "word" });
  const n = (t: string) => `<span class="cjk-nowrap">${t}</span>`;
  expect(wrapWords("智能化产品", seg)).toBe(`${n("智能")}化${n("产品")}`);
  // Punctuation and one-character words stay outside the spans.
  expect(wrapWords("产品，提升", seg)).toBe(`${n("产品")}，${n("提升")}`);
  expect(wrapWords("在 Sổ Trọ 里", seg)).toBe(`在 ${n("Sổ Trọ")} 里`);
  expect(wrapWords("BlueSkyz", seg)).toBe("BlueSkyz");
  expect(documentLang('<html lang="en">')).toBeNull();
  expect(documentLang('<html dir="ltr" lang="zh-Hant">')).toBe("zh-Hant");
  const html = '<h2 class="x">关于 <a href="/zh/">BlueSkyz Labs</a>产品</h2>';
  const out = rewriteHeadings(html, "zh-Hans");
  expect(out).toContain('<h2 class="x" data-cjk-wrap>');
  // Tags and attributes are never rewritten.
  expect(out).toContain('<a href="/zh/">');
  expect(out).toContain(n("BlueSkyz Labs"));
  // A heading without Han text is left alone.
  expect(rewriteHeadings("<h1>About</h1>", "zh-Hans")).toBe("<h1>About</h1>");
});

/**
 * Line breaks inside a heading that do not fall on a word boundary. The page
 * reports where each rendered line starts; the words come from the same
 * Intl.Segmenter (Node) the build pass uses, so every engine is judged the same.
 */
async function midWordBreaks(page: Page) {
  const headings = await page.evaluate(() => {
    const out: { tag: string; text: string; breaks: number[] }[] = [];
    for (const h of document.querySelectorAll("h1, h2, h3")) {
      if (h.getBoundingClientRect().width < 4) continue;
      const range = document.createRange();
      const walker = document.createTreeWalker(h, NodeFilter.SHOW_TEXT);
      let text = "";
      let last: number | null = null;
      const breaks: number[] = [];
      while (walker.nextNode()) {
        const node = walker.currentNode as Text;
        for (let i = 0; i < node.length; i++) {
          range.setStart(node, i);
          range.setEnd(node, i + 1);
          const rect = range.getClientRects()[0];
          if (rect) {
            const top = Math.round(rect.top);
            if (last !== null && top > last + 4) breaks.push(text.length);
            last = top;
          }
          text += node.data[i];
        }
      }
      out.push({ tag: h.tagName, text, breaks });
    }
    return { lang: document.documentElement.lang, out };
  });
  const seg = new Intl.Segmenter(headings.lang, { granularity: "word" });
  const found: string[] = [];
  for (const { tag, text, breaks } of headings.out) {
    const bounds = new Set([0]);
    let pos = 0;
    for (const s of seg.segment(text)) bounds.add((pos += s.segment.length));
    for (const at of breaks) {
      let k = at;
      while (k > 0 && /\s/.test(text[k - 1])) k--;
      let j = at;
      while (j < text.length && /\s/.test(text[j])) j++;
      const inWord = !bounds.has(k) && !bounds.has(j);
      if (inWord && /\p{Script=Han}/u.test(text[k - 1] + text[j]))
        found.push(`${tag}: ${text.slice(0, k)} | ${text.slice(j)}`);
    }
  }
  return found;
}

const overflow = (page: Page) =>
  page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );

for (const lang of LANGS) {
  for (const width of WIDTHS) {
    test(`${lang} at ${width}px: headings break only between words`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 });
      for (const route of ROUTES) {
        await page.goto(`/${lang}${route}`);
        expect(await midWordBreaks(page), `${lang}${route}`).toEqual([]);
        expect(await overflow(page), `${lang}${route}`).toBeLessThanOrEqual(0);
      }
    });
  }
}

test("negative proof: without the word spans the home H1 splits a word at 320px", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/zh/");
  await page.evaluate(() => {
    const h1 = document.querySelector("h1")!;
    h1.querySelectorAll(".cjk-nowrap").forEach((s) =>
      s.replaceWith(...s.childNodes),
    );
  });
  expect((await midWordBreaks(page)).length).toBeGreaterThan(0);
});
