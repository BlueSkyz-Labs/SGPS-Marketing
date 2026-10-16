import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * UX S06: Chinese headings broke inside words at 320–390px ("智能化产 | 品").
 * Browsers break between any two Han characters, and `word-break: auto-phrase`
 * does not segment Chinese (Chromium 141 still split "产/品" with it applied;
 * Firefox and WebKit do not support it). At build time this pass wraps every
 * Chinese word of two or more characters in zh-Hans / zh-Hant h1–h3 in
 * `<span class="cjk-word">` and tags the heading `data-cjk-wrap`. The span
 * is inline-block: a word that does not fit moves to the next line whole, and
 * only a word wider than the whole line breaks inside, so it never overflows;
 * the heading itself keeps `word-break: normal`. Latin text such as "Sổ Trọ" is
 * left alone: breaking it at a space is normal. Copy is unchanged: the spans
 * add no characters.
 */

const HAN = /\p{Script=Han}/u;
const HEADING = /<(h[1-3])(\s[^>]*)?>([\s\S]*?)<\/\1>/g;

const word = (text) => `<span class="cjk-word">${text}</span>`;

function segmenter(lang) {
  return new Intl.Segmenter(lang, { granularity: "word" });
}

/** Wrap each Han word of two or more characters so it breaks only as a last resort. */
export function wrapWords(text, seg) {
  let out = "";
  for (const { segment } of seg.segment(text)) {
    out +=
      [...segment].length > 1 && HAN.test(segment) ? word(segment) : segment;
  }
  return out;
}

/** Rewrite the h1–h3 elements of one zh-Hans / zh-Hant HTML document. */
export function rewriteHeadings(html, lang) {
  const seg = segmenter(lang);
  return html.replace(HEADING, (whole, tag, attrs = "", inner) => {
    if (!HAN.test(inner) || /data-cjk-wrap/.test(attrs)) return whole;
    const parts = inner.split(/(<[^>]*>)/);
    const next = parts
      .map((part) => (part.startsWith("<") ? part : wrapWords(part, seg)))
      .join("");
    return `<${tag}${attrs} data-cjk-wrap>${next}</${tag}>`;
  });
}

export function documentLang(html) {
  const match = /<html[^>]*\blang="(zh-Hans|zh-Hant)"/i.exec(html);
  return match ? match[1] : null;
}

function htmlFiles(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) out.push(...htmlFiles(path));
    else if (name.endsWith(".html")) out.push(path);
  }
  return out;
}

export function rewriteBuild(root) {
  let changed = 0;
  for (const file of htmlFiles(root)) {
    const html = readFileSync(file, "utf8");
    const lang = documentLang(html);
    if (!lang) continue;
    const next = rewriteHeadings(html, lang);
    if (next !== html) {
      writeFileSync(file, next);
      changed += 1;
    }
  }
  if (changed === 0) {
    throw new Error("cjk-heading-breaks: no zh-Hans / zh-Hant heading found");
  }
  return changed;
}

export default function cjkHeadingBreaks() {
  return {
    name: "cjk-heading-breaks",
    hooks: {
      "astro:build:done": ({ dir }) => {
        rewriteBuild(fileURLToPath(dir));
      },
    },
  };
}
