/**
 * Language switcher state cue guard (audit F-34).
 *
 * In the dark palette the active pill sits 1.22:1 from the shell, so the pill
 * fill alone does not identify the selected language. What does is the flag
 * badge, which renders only on the active item (measured: 20 px wide on the
 * active item and 0 px on idle ones in OS dark, explicit dark and explicit
 * light), with `aria-current="page"` as the programmatic state. That cue must
 * not disappear or move to an idle item.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const SOURCE = readFileSync(
  "src/components/layout/LanguageSwitcher.astro",
  "utf8",
);

// Every way the active-state cue stops identifying the selected language.
function auditStateCue(source) {
  const problems = [];
  if (!/aria-current=\{isActive \? "page" : undefined\}/.test(source)) {
    problems.push("the active item must carry aria-current=page");
  }
  if (
    !/isActive \? "lang-toggle-flag--visible" : "lang-toggle-flag--hidden"/.test(
      source,
    )
  ) {
    problems.push("the flag badge must be visible only on the active item");
  }
  const hidden = source.match(/\.lang-toggle-flag--hidden\s*\{([^}]*)\}/)?.[1];
  if (
    !hidden ||
    !/width:\s*0\b/.test(hidden) ||
    !/opacity:\s*0\b/.test(hidden)
  ) {
    problems.push(
      "an idle item must collapse its flag badge (width 0, opacity 0)",
    );
  }
  const visible = source.match(
    /\.lang-toggle-flag--visible\s*\{([^}]*)\}/,
  )?.[1];
  if (
    !visible ||
    !/width:\s*20px/.test(visible) ||
    !/opacity:\s*1\b/.test(visible)
  ) {
    problems.push("the active flag badge must be 20px wide and opaque");
  }
  if (!/lang-toggle-flag[\s\S]{0,200}aria-hidden="true"/.test(source)) {
    problems.push("the flag badge is a decoration and must be aria-hidden");
  }
  return problems;
}

test("the active language keeps a visible flag badge and aria-current", () => {
  assert.deepEqual(auditStateCue(SOURCE), []);
});

test("negative proof: showing the flag on idle items is caught", () => {
  const mutated = SOURCE.replace(
    'isActive ? "lang-toggle-flag--visible" : "lang-toggle-flag--hidden"',
    '"lang-toggle-flag--visible"',
  );
  assert.notEqual(mutated, SOURCE);
  assert.ok(
    auditStateCue(mutated).some((problem) =>
      problem.includes("visible only on the active item"),
    ),
  );
});

test("negative proof: losing aria-current or the collapse is caught", () => {
  const noCurrent = SOURCE.replace(
    'aria-current={isActive ? "page" : undefined}',
    "",
  );
  assert.notEqual(noCurrent, SOURCE);
  assert.ok(
    auditStateCue(noCurrent).some((problem) =>
      problem.includes("aria-current"),
    ),
  );

  const noCollapse = SOURCE.replace(
    /(\.lang-toggle-flag--hidden\s*\{\s*)width:\s*0;/,
    "$1width: 20px;",
  );
  assert.notEqual(noCollapse, SOURCE);
  assert.ok(
    auditStateCue(noCollapse).some((problem) => problem.includes("collapse")),
  );
});
