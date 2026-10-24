import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

/**
 * Wave G1 guard: a Journey index title is a quiet `--text-primary` link. It
 * must not carry the cobalt action colour or a resting underline (hover and
 * focus-visible underline live in the stylesheet, not in a utility class).
 */
export function indexTitleProblems(source) {
  const problems = [];
  const anchors = [
    ...source.matchAll(/<h3[^>]*>\s*<a\b([\s\S]*?)>[\s\S]*?<\/a>\s*<\/h3>/g),
  ];
  if (anchors.length === 0) problems.push("no item title anchor found");
  for (const [, attrs] of anchors) {
    if (attrs.includes("text-[var(--action-primary)]"))
      problems.push("title anchor carries the cobalt action colour");
    if (/(^|[\s"'])underline(?=[\s"'])/.test(attrs))
      problems.push("title anchor carries a resting underline class");
  }
  const rule = source.match(/\.journal-item__title a\s*\{([^}]*)\}/);
  if (rule && /var\(--action-primary\)/.test(rule[1]))
    problems.push("title anchor rule uses the cobalt action colour");
  if (rule && /text-decoration:\s*underline/.test(rule[1]))
    problems.push("title anchor rule underlines at rest");
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

test("negative proof: reintroducing the cobalt resting underline FAILS the guard", () => {
  const fixture = `<h3><a href="/x" class="text-[var(--action-primary)] underline underline-offset-4 hover:no-underline">T</a></h3>`;
  const problems = indexTitleProblems(fixture);
  console.log("negative-proof guard output:", problems);
  assert.ok(problems.length >= 2);
  assert.ok(problems.some((m) => /cobalt/.test(m)));
  assert.ok(problems.some((m) => /resting underline/.test(m)));
  // A stylesheet-level regression is caught as well.
  const css = `<h3><a href="/x">T</a></h3><style>.journal-item__title a { color: var(--action-primary); text-decoration: underline; }</style>`;
  assert.ok(indexTitleProblems(css).length >= 2);
});
