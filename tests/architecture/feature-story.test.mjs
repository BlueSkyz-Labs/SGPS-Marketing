/**
 * v12 S1 Feature Story guard.
 *
 * 1. Registry only: the story's screens resolve only from the showcase record
 *    (phone chapters, a desktop coda) and its facts only from the product
 *    record's jobs and capabilities. An unknown screen id fails.
 * 2. Motion gate: every story and teaser animation sits inside both
 *    `prefers-reduced-motion: no-preference` and
 *    `@supports (animation-timeline: view())`, so the CSS default is the final
 *    readable state. Keyframes live only in the shared grammar.
 * 3. Every chapter (and the coda) is a <section> with its own heading.
 * 4. No client script: the story is CSS only (the client budget cannot grow).
 * Each rule has a negative proof below.
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";
import {
  resolveFeatureStory,
  storyProblems,
} from "../../src/lib/feature-story.ts";

const read = (path) => readFileSync(path, "utf8");
const STORY = "src/components/product/FeatureStory.astro";
const TEASER = "src/components/product/StoryTeaser.astro";
const SHOWCASE = "src/content/showcases/sotro.yaml";
const PRODUCT = "src/content/products/sotro.yaml";
const LOCALES = ["en", "vi", "zh", "zh-hant"];

/** Screens (id + surface) and the story block of a showcase record. */
export function parseShowcase(text) {
  const screensBlock = text.split(/^screens:\s*$/m)[1].split(/^\S/m)[0];
  const screens = [
    ...screensBlock.matchAll(/^ {2}- id:\s*(\S+)\s*\n\s+surface:\s*(\S+)/gm),
  ].map(([, id, surface]) => ({ id, surface }));
  const storyBlock = (text.split(/^story:\s*$/m)[1] ?? "").split(/^\S/m)[0];
  const chapters = [
    ...storyBlock.matchAll(
      /^ {4}- screen:\s*(\S+)(?:\s*\n {6}fact:\s*(\S+))?/gm,
    ),
  ].map(([, screen, fact]) => (fact ? { screen, fact } : { screen }));
  const coda = /^ {2}coda:\s*(\S+)/m.exec(storyBlock)?.[1];
  return { screens, story: coda ? { chapters, coda } : { chapters } };
}

/** Top-level English jobs and capabilities of a product record. */
export function parseFacts(text) {
  const list = (key) =>
    [
      ...(
        new RegExp(`^${key}:\\s*\\n((?:\\s+- .*\\n)+)`, "m").exec(text)?.[1] ??
        ""
      ).matchAll(/- (.*)/g),
    ].map((m) => m[1]);
  return { jobs: list("jobs"), capabilities: list("capabilities") };
}

test("the Sổ Trọ story resolves only from its own registry records", () => {
  const { screens, story } = parseShowcase(read(SHOWCASE));
  const facts = parseFacts(read(PRODUCT));
  assert.ok(screens.length >= 10, "screens parsed");
  assert.equal(facts.jobs.length, 2);
  assert.equal(facts.capabilities.length, 3);
  assert.ok(story.chapters.length >= 3, "story chapters parsed");
  assert.deepEqual(storyProblems(story, screens, facts), []);
  const resolved = resolveFeatureStory(story, screens, facts);
  assert.deepEqual(
    resolved.chapters.map((chapter) => chapter.screen.id),
    ["today", "utilities", "collect", "rooms", "candlelight"],
  );
  // Facts relate a chapter's task to a registered job or capability; only
  // the three chapters whose task is a registered entry carry one.
  assert.deepEqual(
    resolved.chapters.map((chapter) => chapter.fact),
    [facts.jobs[0], facts.capabilities[0], facts.capabilities[1], null, null],
  );
  assert.equal(resolved.coda?.id, "owner-collect");
});

test("negative proof: an unknown screen, a wrong surface or a missing fact fails", () => {
  const { screens, story } = parseShowcase(read(SHOWCASE));
  const facts = parseFacts(read(PRODUCT));
  const unknown = {
    ...story,
    chapters: [{ screen: "invoices" }, ...story.chapters.slice(1)],
  };
  assert.ok(storyProblems(unknown, screens, facts).length > 0);
  assert.throws(
    () => resolveFeatureStory(unknown, screens, facts),
    /unknown screen invoices/,
  );
  const desktopChapter = {
    ...story,
    chapters: [{ screen: "property" }, ...story.chapters.slice(1)],
  };
  assert.ok(storyProblems(desktopChapter, screens, facts).length > 0);
  const phoneCoda = { ...story, coda: "today" };
  assert.ok(storyProblems(phoneCoda, screens, facts).length > 0);
  const noFact = {
    ...story,
    chapters: [
      { screen: "today", fact: "capability-9" },
      ...story.chapters.slice(1),
    ],
  };
  assert.ok(storyProblems(noFact, screens, facts).length > 0);
  const repeated = {
    ...story,
    chapters: [...story.chapters.slice(0, 2), story.chapters[0]],
  };
  assert.ok(storyProblems(repeated, screens, facts).length > 0);
});

test("the schema enforces the same registry rule at build time", () => {
  const schema = read("src/lib/showcase-schema.ts");
  assert.match(schema, /story: z/);
  assert.match(schema, /storyProblems\(value\.story, value\.screens\)/);
  // The components take chapters only through the resolver.
  for (const path of ["src/components/product/ProductShowcase.astro", TEASER]) {
    assert.match(read(path), /resolveFeatureStory\(/, path);
  }
  const story = read(STORY);
  assert.doesNotMatch(story, /showcase\.screens|getCollection/);
});

/** The <style> bodies of an Astro component. */
const styles = (source) =>
  [...source.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)]
    .map((m) => m[1])
    .join("\n");

/** Every animation declaration with the block preludes that enclose it. */
export function animationContexts(source) {
  const css = source.replace(/\/\*[\s\S]*?\*\//g, "");
  const out = [];
  const stack = [];
  let start = 0;
  for (let i = 0; i < css.length; i += 1) {
    const ch = css[i];
    if (ch === "{") {
      stack.push(
        css
          .slice(start, i)
          .replace(/\/\*[\s\S]*?\*\//g, "")
          .trim(),
      );
      start = i + 1;
    } else if (ch === "}" || ch === ";") {
      const decl = css
        .slice(start, i)
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .trim();
      const m = /^animation(?:-name|-timeline)?\s*:\s*([\s\S]+)$/.exec(decl);
      if (m && !/^none\b/.test(m[1].trim())) {
        out.push({ decl, context: [...stack] });
      }
      if (ch === "}") stack.pop();
      start = i + 1;
    }
  }
  return out;
}

/** Animation declarations outside the motion + scroll-timeline gate. */
export function ungatedAnimations(css) {
  return animationContexts(css)
    .filter(
      ({ context }) =>
        !context.some(
          (p) =>
            p.startsWith("@media") &&
            /prefers-reduced-motion:\s*no-preference/.test(p),
        ) ||
        !context.some(
          (p) =>
            p.startsWith("@supports") &&
            /animation-timeline:\s*view\(\)/.test(p),
        ),
    )
    .map(({ decl }) => decl);
}

test("every story and teaser animation is inside the motion + @supports gate", () => {
  for (const path of [STORY, TEASER]) {
    const source = read(path);
    const css = styles(source);
    assert.ok(animationContexts(css).length >= 3, `${path} animates`);
    assert.deepEqual(ungatedAnimations(css), [], path);
    assert.doesNotMatch(source, /@keyframes\b/, `${path}: shared grammar only`);
    assert.doesNotMatch(css, /will-change|infinite/, path);
    assert.doesNotMatch(css, /scroll-snap-type/, `${path}: no page snapping`);
  }
  const grammar = read("src/styles/reveal.css");
  assert.match(grammar, /@keyframes story-screen\b/);
  assert.match(grammar, /@keyframes stage-fan\b/);
  assert.match(grammar, /@keyframes stage-caption\b/);
  // The sticky stage itself only exists inside the gate.
  const story = styles(read(STORY));
  const sticky = animationContexts(
    story.replace(/position:\s*sticky/g, "animation: sticky-probe"),
  ).filter(({ decl }) => decl.includes("sticky-probe"));
  assert.ok(sticky.length > 0);
  assert.deepEqual(
    ungatedAnimations(
      story.replace(/position:\s*sticky/g, "animation: sticky-probe"),
    ).filter((decl) => decl.includes("sticky-probe")),
    [],
    "the sticky stage must sit inside the gate",
  );
});

test("negative proof: an ungated story animation is caught", () => {
  const css = styles(read(STORY));
  const ungated = css.replace(
    "  .story__frame {\n    display: none;\n  }",
    "  .story__frame {\n    display: none;\n  }\n  .story__screen { animation: story-screen linear both; }",
  );
  assert.notEqual(ungated, css);
  assert.deepEqual(ungatedAnimations(ungated), [
    "animation: story-screen linear both",
  ]);
  // Motion gate without @supports is not enough either.
  const halfGated =
    css +
    "\n@media (prefers-reduced-motion: no-preference) { .x { animation: view-rise linear both; } }";
  assert.equal(ungatedAnimations(halfGated).length, 1);
});

/** Chapter <section> blocks of the story template and whether each has a heading. */
export function chapterHeadingProblems(source) {
  const problems = [];
  const sections = [
    ...source.matchAll(
      /<section\s+class="story__(chapter|coda)"([\s\S]*?)<\/section>/g,
    ),
  ];
  if (sections.length < 2) problems.push("chapter and coda sections expected");
  for (const [, kind, body] of sections) {
    const label = /aria-labelledby=\{`([^`]+)`\}/.exec(body)?.[1];
    const heading = /<h3\s+id=\{`([^`]+)`\}/.exec(body)?.[1];
    if (!heading) problems.push(`${kind}: no heading`);
    else if (label !== heading) problems.push(`${kind}: label != heading id`);
  }
  return problems;
}

test("every chapter is a section named by its own heading", () => {
  assert.deepEqual(chapterHeadingProblems(read(STORY)), []);
});

/** The fact line must read as plain secondary text, not a "shows" claim. */
export function factStyleProblems(source) {
  const problems = [];
  const css = styles(source);
  const rule = /\.story__fact\s*\{([^}]*)\}/.exec(css)?.[1] ?? "";
  if (!rule) problems.push("no .story__fact rule");
  if (!/color:\s*var\(--text-secondary\)/.test(rule)) {
    problems.push("fact must use the secondary text colour");
  }
  if (/\.story__fact[^{]*::?(before|after)/.test(css)) {
    problems.push("no check mark or decoration on the fact line");
  }
  if (/data-story-fact[\s\S]{0,120}<svg/.test(source)) {
    problems.push("no icon in the fact line");
  }
  return problems;
}

test("the fact line is plain secondary text", () => {
  assert.deepEqual(factStyleProblems(read(STORY)), []);
});

test("negative proof: a check-marked fact line is caught", () => {
  const checked = read(STORY).replace(
    "  .story__fact {",
    '  .story__fact::before { content: "✓"; }\n  .story__fact {',
  );
  assert.ok(factStyleProblems(checked).length > 0);
});

test("negative proof: a chapter without a heading is caught", () => {
  const broken = read(STORY).replace(
    /<h3 id=\{`story-chapter-\$\{screen\.id\}`\} class="story__title">/,
    '<p class="story__title">',
  );
  assert.ok(chapterHeadingProblems(broken).length > 0);
});

test("the story ships no client script and its screens stay lazy", () => {
  for (const path of [STORY, TEASER]) {
    const source = read(path);
    assert.doesNotMatch(source, /<script\b/, path);
    const imgs = [...source.matchAll(/<img\b[\s\S]*?\/>/g)].map((m) => m[0]);
    assert.ok(imgs.length > 0, path);
    for (const img of imgs) {
      assert.match(img, /loading="lazy"/, path);
      assert.match(img, /width=\{/, path);
      assert.match(img, /height=\{/, path);
    }
  }
});

test("the home teaser follows the flagship act on every locale", () => {
  for (const lang of LOCALES) {
    const source = read(`src/pages/${lang}/index.astro`);
    const order = [
      ...source.matchAll(/<(FlagshipTheatre|StoryTeaser|ProductHouse)\b/g),
    ].map((m) => m[1]);
    assert.deepEqual(
      order,
      ["FlagshipTheatre", "StoryTeaser", "ProductHouse"],
      lang,
    );
    assert.match(
      source,
      new RegExp(`<StoryTeaser product=\\{flagship\\} lang="${lang}" />`),
    );
  }
  assert.match(read(TEASER), /chapters\.slice\(0, 3\)/);
  assert.match(read(TEASER), /#profile-showcase/);
});

// Home image budget (lighthouserc resourceBytes.image): the three teaser
// phones ship a 240w derivative first in srcset; three 480w captures pushed
// /en/ and /vi/ to 116 KB against the 80 KB budget.
function teaserDerivativeProblems(teaser, screens, fileExists = existsSync) {
  const problems = [];
  if (!/src=\{phoneTinySrc\(screen\.src\)\}/.test(teaser)) {
    problems.push("the teaser img src must be the 240w derivative");
  }
  if (!/srcset=\{`\$\{phoneTinySrc\(screen\.src\)\} 240w,/.test(teaser)) {
    problems.push("the teaser srcset must offer the 240w derivative first");
  }
  for (const src of screens) {
    const tiny = `public${src.replace(/\.webp$/, "-240.webp")}`;
    if (!fileExists(tiny)) problems.push(`${tiny} is missing`);
  }
  return problems;
}

const TEASER_SCREENS = [
  "/products/sotro/showcase/op-01-home.webp",
  "/products/sotro/showcase/op-03-utilities.webp",
  "/products/sotro/showcase/op-02-payments.webp",
];

test("the home teaser serves 240w derivatives within the image budget", () => {
  const teaser = read("src/components/product/StoryTeaser.astro");
  assert.deepEqual(teaserDerivativeProblems(teaser, TEASER_SCREENS), []);
});

test("negative proof: a 480w-first teaser or a missing 240w file is caught", () => {
  const teaser = read("src/components/product/StoryTeaser.astro");
  const heavy = teaser.replace(
    "src={phoneTinySrc(screen.src)}",
    "src={phoneSmallSrc(screen.src)}",
  );
  assert.notEqual(heavy, teaser);
  assert.ok(teaserDerivativeProblems(heavy, TEASER_SCREENS).length > 0);
  assert.ok(
    teaserDerivativeProblems(teaser, TEASER_SCREENS, () => false).length > 0,
  );
});
