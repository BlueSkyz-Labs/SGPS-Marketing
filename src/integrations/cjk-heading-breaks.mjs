import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

/**
 * UX S06: Chinese headings broke inside words at 320–390px ("智能化产 | 品").
 * Browsers break between any two Han characters, and `word-break: auto-phrase`
 * does not segment Chinese (Chromium 141 still split "产/品" with it applied;
 * Firefox and WebKit do not support it). At build time this pass wraps every
 * Chinese word of two or more characters, and short Latin runs such as
 * "Sổ Trọ", in zh-Hans / zh-Hant h1–h3 in `<span class="cjk-nowrap">`, and
 * tags the heading `data-cjk-wrap`. Lines then break only between words while
 * the heading keeps `word-break: normal` (keep-all overflowed 320px before).
 * Copy is unchanged: the spans add no characters.
 */

const HAN = /\p{Script=Han}/u;
const LATIN_RUN = /([\p{Script=Latin}\p{N}]+(?: [\p{Script=Latin}\p{N}]+)+)/u;
const MAX_NOWRAP = 24;
const HEADING = /<(h[1-3])(\s[^>]*)?>([\s\S]*?)<\/\1>/g;

const nowrap = (text) => `<span class="cjk-nowrap">${text}</span>`;

function segmenter(lang) {
  return new Intl.Segmenter(lang, { granularity: "word" });
}

/** Wrap each Han word of two or more characters so it never splits. */
export function wrapHanWords(text, seg) {
  let out = "";
  for (const { segment } of seg.segment(text)) {
    out +=
      [...segment].length > 1 && HAN.test(segment) ? nowrap(segment) : segment;
  }
  return out;
}

/** Wrap Han words, and keep a short multi-word Latin run on one line. */
export function wrapWords(text, seg) {
  return text
    .split(LATIN_RUN)
    .map((part, i) =>
      i % 2 === 1
        ? part.length <= MAX_NOWRAP
          ? nowrap(part)
          : part
        : wrapHanWords(part, seg),
    )
    .join("");
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
