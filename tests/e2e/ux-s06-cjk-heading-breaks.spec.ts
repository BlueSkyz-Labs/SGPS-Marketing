import { expect, test, type Page } from "@playwright/test";
import {
  MAX_WORD,
  documentLang,
  rewriteHeadings,
  wrapWords,
} from "../../src/integrations/cjk-heading-breaks.mjs";

/**
 * UX S06 (audit 2026-10-15): Chinese headings broke inside words at
 * 320–390px ("智能化产 | 品", "私 | 有"). The build now wraps each Chinese word
 * (two to four characters) in zh-Hans / zh-Hant h1–h3 in an inline nowrap
 * span; headings keep word-break: normal and their accessible names.
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
  const n = (t: string) => `<span class="cjk-word">${t}</span>`;
  expect(wrapWords("智能化产品", seg)).toBe(`${n("智能")}化${n("产品")}`);
  // Punctuation and one-character words stay outside the spans.
  expect(wrapWords("产品，提升", seg)).toBe(`${n("产品")}，${n("提升")}`);
  // Latin text may break at its spaces.
  expect(wrapWords("在 Sổ Trọ 里", seg)).toBe("在 Sổ Trọ 里");
  expect(wrapWords("BlueSkyz", seg)).toBe("BlueSkyz");
  // A word longer than MAX_WORD is left free to break, so no nowrap run can
  // be wider than a heading line.
  const long = "一二三四五".slice(0, MAX_WORD + 1);
  const fake = {
    segment: () => [{ segment: long }],
  } as unknown as Intl.Segmenter;
  expect(wrapWords(long, fake)).toBe(long);
  const fits = long.slice(0, MAX_WORD);
  const fakeFit = {
    segment: () => [{ segment: fits }],
  } as unknown as Intl.Segmenter;
  expect(wrapWords(fits, fakeFit)).toBe(n(fits));
  expect(documentLang('<html lang="en">')).toBeNull();
  expect(documentLang('<html dir="ltr" lang="zh-Hant">')).toBe("zh-Hant");
  const html = '<h2 class="x">关于 <a href="/zh/">BlueSkyz Labs</a>产品</h2>';
  const out = rewriteHeadings(html, "zh-Hans");
  expect(out).toContain('<h2 class="x" data-cjk-wrap>');
  // Tags and attributes are never rewritten.
  expect(out).toContain('<a href="/zh/">');
  expect(out).toContain(">BlueSkyz Labs</a>");
  expect(out).toContain(n("关于"));
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

/**
 * A heading 4.5 characters wide holding "智能化产品" must wrap after four
 * characters. The same test runs in every engine with a fixed font size, so it
 * does not depend on how each engine lays out the real home H1.
 */
async function injectHeading(page: Page, html: string, width: string) {
  await page.evaluate(
    ({ html, width }) => {
      const box = document.createElement("div");
      box.id = "s06-probe";
      box.lang = "zh-Hans";
      box.style.cssText = `width:${width};font-size:20px`;
      box.innerHTML = html;
      // The site's heading rules (size, tracking, text-wrap) must not move
      // the break: one glyph is 1em, so 4.5em holds four characters.
      box.querySelector("h2")!.style.cssText =
        "font-size:20px;line-height:1.5;letter-spacing:0;margin:0;text-wrap:wrap";
      document.querySelector("main")!.prepend(box);
    },
    { html, width },
  );
}

const probeBreaks = (page: Page) =>
  page.evaluate(() => {
    const h = document.querySelector("#s06-probe h2")!;
    const range = document.createRange();
    const walker = document.createTreeWalker(h, NodeFilter.SHOW_TEXT);
    let text = "";
    let last: number | null = null;
    const breaks: string[] = [];
    while (walker.nextNode()) {
      const node = walker.currentNode as Text;
      for (let i = 0; i < node.length; i++) {
        range.setStart(node, i);
        range.setEnd(node, i + 1);
        const top = Math.round(range.getClientRects()[0]!.top);
        if (last !== null && top > last + 4) breaks.push(text);
        last = top;
        text += node.data[i];
      }
    }
    const box = document.querySelector<HTMLElement>("#s06-probe")!;
    return { breaks, overflow: box.scrollWidth - box.clientWidth };
  });

test("word spans move a whole word to the next line; negative proof without them", async ({
  page,
}) => {
  await page.goto("/zh/");
  const raw = "<h2>智能化产品</h2>";
  await injectHeading(page, rewriteHeadings(raw, "zh-Hans"), "4.5em");
  // Fixed: "产品" moves down whole, after "智能化".
  expect((await probeBreaks(page)).breaks).toEqual(["智能化"]);
  await page.evaluate(() => document.querySelector("#s06-probe")!.remove());
  // Negative proof: the same heading without the spans splits "产 | 品".
  await injectHeading(page, raw, "4.5em");
  expect((await probeBreaks(page)).breaks).toEqual(["智能化产"]);
});

for (const lang of LANGS) {
  test(`${lang}: word spans leave heading accessible names unchanged`, async ({
    page,
  }) => {
    await page.goto(`/${lang}/products/`);
    const names = await page
      .locator("main")
      .ariaSnapshot()
      .then((snap) =>
        snap
          .split("\n")
          .filter((line) => line.includes("- heading "))
          .map((line) => /heading "([^"]*)"/.exec(line)?.[1] ?? ""),
      );
    const texts = await page.$$eval(
      "main :is(h1, h2, h3)[data-cjk-wrap]",
      (hs) => hs.map((h) => h.textContent!.replace(/\s+/g, " ").trim()),
    );
    expect(texts.length).toBeGreaterThan(0);
    for (const text of texts) expect(names).toContain(text);
  });
}

test("negative proof: inline-block word spans split the accessible name", async ({
  page,
}) => {
  await page.goto("/zh/products/");
  await page.addStyleTag({
    content: ".cjk-word { display: inline-block !important; }",
  });
  const snap = await page.locator("main").ariaSnapshot();
  expect(snap).toContain('heading "开发 中"');
});

test("the build pass only adds word spans: markup, entities and attributes survive", () => {
  const html =
    '<h2 id="s" title="产品, 说明: “开发”">关于&amp;<em>智能</em>' +
    '<a href="/zh/?q=x&amp;y=1">产品说明</a>，提升</h2>';
  const out = rewriteHeadings(html, "zh-Hans");
  const strip = (s: string) =>
    s.replace(/<span class="cjk-word">|<\/span>/g, "");
  const expected = html.replace(/^<h2([^>]*)>/, "<h2$1 data-cjk-wrap>");
  expect(out).not.toBe(expected);
  expect(strip(out)).toBe(expected);
  // Negative proof: a pass that changed one character would fail the check.
  expect(strip(out.replace("说明", "说 明"))).not.toBe(expected);
});

/**
 * 200% text with WCAG 1.4.12 text spacing at 320px: a nowrap word must still
 * fit its heading line, or MAX_WORD is too large for the site's heading sizes.
 */
const WORD_TOO_WIDE = () =>
  [...document.querySelectorAll<HTMLElement>("[data-cjk-wrap] .cjk-word")]
    .filter((w) => {
      const h = w.closest<HTMLElement>("[data-cjk-wrap]")!;
      // Visually hidden (sr-only, 1px) headings have no line to overflow.
      if (h.clientWidth <= 1) return false;
      return w.getBoundingClientRect().width > h.clientWidth + 1;
    })
    .map((w) => w.textContent);

const ZOOM_CSS =
  "html{font-size:200%!important}" +
  "*{letter-spacing:.12em!important;word-spacing:.16em!important;line-height:1.5!important}";

for (const lang of LANGS) {
  test(`${lang} at 320px, 200% text and text spacing: every word span fits its heading`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    for (const route of ["/", "/products/", "/products/sotro/", "/about/"]) {
      await page.goto(`/${lang}${route}`);
      await page.addStyleTag({ content: ZOOM_CSS });
      expect(await page.evaluate(WORD_TOO_WIDE), `${lang}${route}`).toEqual([]);
    }
  });
}

test("negative proof: a word span wider than its heading is reported", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/zh/");
  await page.addStyleTag({
    content: "[data-cjk-wrap]{max-width:1em!important}",
  });
  expect((await page.evaluate(WORD_TOO_WIDE)).length).toBeGreaterThan(0);
});
