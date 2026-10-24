import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

/**
 * Wave G1 guard: a Journey index title is a quiet `--text-primary` link. No
 * title rule (any selector naming `journal-item__title`, lead overrides and
 * pseudo-classes included) may set the cobalt action colour or underline the
 * title at rest; only `:hover` / `:focus-visible` rules may underline. The
 * anchor and heading must not carry the action colour in any class token, and
 * some title rule must set `color: var(--text-primary)`.
 */
export function indexTitleProblems(source) {
  const problems = [];
  const anchors = [
    ...source.matchAll(
      /<h3\b([^>]*)>\s*<a\b([\s\S]*?)>[\s\S]*?<\/a>\s*<\/h3>/g,
    ),
  ];
  if (anchors.length === 0) problems.push("no item title anchor found");
  for (const [, h3Attrs, aAttrs] of anchors) {
    for (const attrs of [h3Attrs, aAttrs]) {
      const classes = [...attrs.matchAll(/class="([^"]*)"/g)]
        .flatMap((m) => m[1].split(/\s+/))
        .filter(Boolean);
      if (classes.some((token) => token.includes("action-primary")))
        problems.push("title carries the cobalt action colour in a class");
      if (classes.some((token) => token === "underline"))
        problems.push("title carries a resting underline class");
    }
  }
  const style =
    (source.match(/<style[^>]*>([\s\S]*?)<\/style>/) ?? [])[1] ?? source;
  const rules = [
    ...style.matchAll(/([^{}]*journal-item__title[^{]*)\{([^}]*)\}/g),
  ];
  let setsPrimary = false;
  for (const [, rawSelector, body] of rules) {
    const selector = rawSelector.trim();
    const interactive = /:hover|:focus-visible/.test(selector);
    if (/var\(--action-primary\)/.test(body) && !interactive)
      problems.push(`rule "${selector}" uses the cobalt action colour`);
    if (/text-decoration(-line)?:\s*underline/.test(body) && !interactive)
      problems.push(`rule "${selector}" underlines at rest`);
    if (/(^|[;\s])color:\s*var\(--text-primary\)/.test(body))
      setsPrimary = true;
  }
  if (!setsPrimary)
    problems.push("no title rule sets color: var(--text-primary)");
  return problems;
}

const SOURCE = readFileSync(
  "src/components/journal/JournalIndex.astro",
  "utf8",
);

test("JournalIndex titles are quiet text-primary links with no resting underline", () => {
  assert.deepEqual(indexTitleProblems(SOURCE), []);
});

test("JournalIndex keeps exactly one lead hook", () => {
  assert.equal((SOURCE.match(/data-journal-lead=\{/g) ?? []).length, 1);
});

const GOOD_CSS =
  ".journal-item__title a { color: var(--text-primary); text-decoration: none; }";
const wrap = (anchor, css) =>
  `<h3 class="journal-item__title">${anchor}</h3><style>${css}</style>`;

test("the guard passes a quiet fixture (control)", () => {
  assert.deepEqual(
    indexTitleProblems(wrap(`<a href="/x">T</a>`, GOOD_CSS)),
    [],
  );
});

const NEGATIVE = {
  "utility-class cobalt resting underline": wrap(
    `<a href="/x" class="text-[var(--action-primary)] underline underline-offset-4 hover:no-underline">T</a>`,
    GOOD_CSS,
  ),
  ":link pseudo-class cobalt underline": wrap(
    `<a href="/x">T</a>`,
    `${GOOD_CSS} .journal-item__title a:link { color: var(--action-primary); text-decoration: underline }`,
  ),
  "lead-only override": wrap(
    `<a href="/x">T</a>`,
    `${GOOD_CSS} .journal-item--lead .journal-item__title a { color: var(--action-primary); text-decoration: underline; }`,
  ),
  "cobalt on the h3 with anchor color inherit": wrap(
    `<a href="/x">T</a>`,
    ".journal-item__title { color: var(--action-primary); } .journal-item__title a { color: inherit; text-decoration: none; }",
  ),
  "no title rule sets text-primary": wrap(
    `<a href="/x">T</a>`,
    ".journal-item__title a { color: inherit; }",
  ),
};

for (const [name, fixture] of Object.entries(NEGATIVE)) {
  test(`negative proof: ${name} FAILS the guard`, () => {
    const problems = indexTitleProblems(fixture);
    console.log(`negative-proof [${name}] ->`, JSON.stringify(problems));
    assert.ok(problems.length > 0);
  });
}
