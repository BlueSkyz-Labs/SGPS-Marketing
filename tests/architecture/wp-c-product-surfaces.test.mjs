/**
 * WP-C product surfaces guard (UI upgrade 2026-10-04).
 *
 * - ADR 0012: the header is the only translucent material. The CSS guard in
 *   shell-material.test.mjs reads `backdrop-filter`; this one also catches the
 *   Tailwind `backdrop-blur*` utility that slipped past it (F6).
 * - W2 card -> profile morph: every localized profile H1 is the destination of
 *   the card's `product-card-<slug>` continuity name, taken from the single
 *   naming source, and carries the profile-title marker.
 * - W2 device stage: the scroll-driven stage only runs where it is supported
 *   and motion is allowed, reuses the shared keyframe grammar, and the CSS
 *   default stays the final layout.
 * Each check is a pure function; the negative proofs feed it a broken input.
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const LOCALES = ["en", "vi", "zh", "zh-hant"];
const read = (path) => readFileSync(path, "utf8");

function walk(dir, acc = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, acc);
    else if (/\.(astro|ts|tsx|css|html)$/.test(entry)) acc.push(full);
  }
  return acc;
}

export function blurUtilities(text) {
  return [...text.matchAll(/(?<![\w-])backdrop-blur(?:-[\w[\]./]+)?/g)].map(
    (match) => match[0],
  );
}

test("no Tailwind backdrop-blur utility anywhere in src (ADR 0012)", () => {
  const offenders = walk("src").flatMap((file) =>
    blurUtilities(read(file)).map((hit) => `${file}: ${hit}`),
  );
  assert.deepEqual(offenders, []);
});

test("negative proof: a card blur utility is caught", () => {
  assert.deepEqual(
    blurUtilities('<div class="size-12 bg-white/5 backdrop-blur-sm">'),
    ["backdrop-blur-sm"],
  );
  assert.deepEqual(blurUtilities('<div class="backdrop-blur">'), [
    "backdrop-blur",
  ]);
});

export function profileTitleProblems(page) {
  const h1 = page.match(/<h1\b[^>]*>/s)?.[0] ?? "";
  const problems = [];
  if (!/style=\{productTransitionStyle\("card", data\.slug\)\}/.test(h1)) {
    problems.push("profile H1 must carry the card continuity name");
  }
  if (!/data-product-profile-title/.test(h1)) {
    problems.push("profile H1 must carry data-product-profile-title");
  }
  if (
    !/import \{ productTransitionStyle \} from "@\/lib\/product-transition"/.test(
      page,
    )
  ) {
    problems.push("name must come from src/lib/product-transition.ts");
  }
  if (/view-transition-name:\s*product-/.test(page)) {
    problems.push("no hardcoded product view-transition-name");
  }
  return problems;
}

test("every localized profile H1 is the card -> profile morph destination", () => {
  for (const lang of LOCALES) {
    const page = read(`src/pages/${lang}/products/[slug].astro`);
    assert.deepEqual(profileTitleProblems(page), [], lang);
  }
});

test("negative proof: a profile H1 without the continuity name is caught", () => {
  const page = read("src/pages/vi/products/[slug].astro")
    .replace('style={productTransitionStyle("card", data.slug)}', "")
    .replace("data-product-profile-title", "");
  assert.ok(profileTitleProblems(page).length >= 2);
});

/** Every stage animation must sit inside both progressive-enhancement gates. */
/** Body of the first block opened by `head`, by brace matching. */
function blockBody(css, head) {
  const start = css.indexOf(head);
  if (start < 0) return "";
  const open = css.indexOf("{", start);
  let depth = 0;
  for (let i = open; i < css.length; i += 1) {
    if (css[i] === "{") depth += 1;
    else if (css[i] === "}" && --depth === 0) return css.slice(open + 1, i);
  }
  return "";
}

export function stageProblems(css) {
  const problems = [];
  const media = blockBody(
    css,
    "@media (min-width: 64rem) and (prefers-reduced-motion: no-preference)",
  );
  const gated = blockBody(media, "@supports (animation-timeline: view())");
  if (
    !/\.showcase__rail--stage[^{]*\{[^}]*animation:\s*view-rise/.test(gated)
  ) {
    problems.push(
      "the phone stage must run only inside the motion + @supports gate",
    );
  }
  if (
    !/\.showcase__desktops--stage[^{]*\{[^}]*animation:\s*view-rise/.test(gated)
  ) {
    problems.push("the desktop rise must run only inside the motion gate");
  }
  if (/@keyframes\b/.test(css)) {
    problems.push("stage keyframes belong to the shared grammar in src/styles");
  }
  const outside = css.replace(gated, "");
  if (/--stage[^{]*\{[^}]*animation:\s*(?![\s]|none)/.test(outside)) {
    problems.push("a stage animation runs outside the gate");
  }
  if (/will-change|infinite/.test(gated)) {
    problems.push("no will-change or infinite loops in the stage");
  }
  return problems;
}

test("the device stage is progressive enhancement only", () => {
  const css = read("src/components/product/ProductShowcase.astro");
  assert.deepEqual(stageProblems(css), []);
});

test("negative proof: an ungated stage animation is caught", () => {
  const css = read("src/components/product/ProductShowcase.astro");
  const ungated = css.replace(
    "  .showcase__caption {",
    "  .showcase__rail--stage > li { animation: view-rise linear both; }\n  .showcase__caption {",
  );
  assert.notEqual(ungated, css);
  assert.ok(stageProblems(ungated).length > 0);
});
