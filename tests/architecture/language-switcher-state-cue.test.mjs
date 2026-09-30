/**
 * Language switcher state cue guard (audit F-34, premium switcher redesign).
 *
 * The switcher is a compact trigger plus a native popover listing one real
 * link per language. A fill or tint alone does not identify the selected
 * language (in dark themes the current row sits within a few percent of its
 * neighbours), so the current language carries two cues that must never move:
 *
 *   1. `aria-current="page"` — the programmatic state, only on the current row;
 *   2. a VISIBLE check mark — rendered only for the current row, sized, coloured
 *      with the owned accent and hidden from assistive tech (it decorates the
 *      state that aria-current already announces).
 *
 * The trigger's accessible name must also contain its visible short code
 * (WCAG 2.5.3), and its target must stay at the 44px floor.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const SOURCE = readFileSync(
  "src/components/layout/LanguageSwitcher.astro",
  "utf8",
);

function rule(source, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return (
    source.match(new RegExp(`(?:^|\\n)\\s*${escaped}\\s*\\{([^}]*)\\}`))?.[1] ??
    null
  );
}

// Every way the current-language cue stops identifying the selected language.
export function auditStateCue(source) {
  const problems = [];
  if (!/aria-current=\{isActive \? "page" : undefined\}/.test(source)) {
    problems.push("the current item must carry aria-current=page");
  }
  if (
    !/isActive \? "lang-option--current" : "lang-option--idle"/.test(source)
  ) {
    problems.push("only the current item may take the current-row class");
  }
  if (!/\{isActive \? \(\s*<BlueSkyzIcon name="check"/.test(source)) {
    problems.push("the check mark must render only on the current item");
  }
  if (!/lang-option__check"\s+aria-hidden="true"/.test(source)) {
    problems.push("the check mark is a decoration and must be aria-hidden");
  }
  const check = rule(source, ".lang-option__check");
  if (
    !check ||
    /display:\s*none/.test(check) ||
    /visibility:\s*hidden/.test(check) ||
    /opacity:\s*0\b/.test(check) ||
    !/width:\s*1\.5rem/.test(check) ||
    !/color:\s*var\(--lang-accent\)/.test(check)
  ) {
    problems.push(
      "the check mark must stay visible: sized, owned accent colour, not hidden",
    );
  }
  const current = rule(source, ".lang-option--current");
  if (!current || !/background:/.test(current)) {
    problems.push("the current row must keep its tint as a secondary cue");
  }
  if (
    !/const triggerName = `\$\{current\.shortLabel\}/.test(source) ||
    !/aria-label=\{triggerName\}/.test(source)
  ) {
    problems.push(
      "the trigger accessible name must contain its visible short code",
    );
  }
  const trigger = rule(source, ".lang-switch__trigger");
  if (
    !trigger ||
    !/min-width:\s*44px/.test(trigger) ||
    !/min-height:\s*44px/.test(trigger)
  ) {
    problems.push("the trigger must keep a 44x44 minimum target");
  }
  const option = rule(source, ".lang-option");
  if (!option || !/min-height:\s*3\.25rem/.test(option)) {
    problems.push("every language row must keep a comfortable touch target");
  }
  return problems;
}

test("the current language keeps aria-current and a visible check mark", () => {
  assert.deepEqual(auditStateCue(SOURCE), []);
});

test("every language is a real link with its own hreflang and lang", () => {
  assert.match(SOURCE, /<a\s+href=\{getAlternatePath\(currentPath, lang\)\}/);
  assert.match(SOURCE, /hreflang=\{config\.hreflang\}/);
  assert.match(SOURCE, /lang=\{config\.hreflang\}/);
  assert.match(SOURCE, /data-language-choice=\{lang\}/);
  assert.match(SOURCE, /SUPPORTED_LANGUAGES\.map\(/);
});

test("the disclosure is the native popover: no inline script, no JS gate", () => {
  assert.match(SOURCE, /popovertarget=\{panelId\}/);
  assert.match(SOURCE, /popover="auto"/);
  assert.doesNotMatch(SOURCE, /<script[^>]*\bis:inline\b/);
  assert.doesNotMatch(SOURCE, /\bonclick\s*=/i);
  assert.doesNotMatch(SOURCE, /@keyframes\b/);
});

test("the language-storage click path survives the redesign", () => {
  assert.match(SOURCE, /LANGUAGE_STORAGE_KEY/);
  assert.match(
    SOURCE,
    /closest<HTMLAnchorElement>\("\[data-language-choice\]"\)/,
  );
  assert.match(SOURCE, /window\.localStorage\.setItem\(LANGUAGE_STORAGE_KEY/);
});

test("entrance motion is transition-only and guarded by reduced motion", () => {
  assert.match(SOURCE, /@starting-style/);
  assert.match(SOURCE, /display 170ms allow-discrete/);
  assert.match(
    SOURCE,
    /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.lang-panel[\s\S]*?transition:\s*none/,
  );
});

test("negative proof: showing the check mark on idle items is caught", () => {
  const mutated = SOURCE.replace(
    /\{isActive \? \(\s*<BlueSkyzIcon name="check"/,
    '{true ? (<BlueSkyzIcon name="check"',
  );
  assert.notEqual(mutated, SOURCE);
  assert.ok(
    auditStateCue(mutated).some((problem) =>
      problem.includes("only on the current item"),
    ),
  );
});

test("negative proof: losing aria-current is caught", () => {
  const mutated = SOURCE.replace(
    'aria-current={isActive ? "page" : undefined}',
    "",
  );
  assert.notEqual(mutated, SOURCE);
  assert.ok(
    auditStateCue(mutated).some((problem) => problem.includes("aria-current")),
  );
});

test("negative proof: hiding the check mark or its accent is caught", () => {
  const hidden = SOURCE.replace(
    /(\.lang-option__check\s*\{\s*)display:\s*inline-flex;/,
    "$1display: none;",
  );
  assert.notEqual(hidden, SOURCE);
  assert.ok(
    auditStateCue(hidden).some((problem) => problem.includes("stay visible")),
  );

  const uncoloured = SOURCE.replace(
    /(\.lang-option__check\s*\{[^}]*?)color:\s*var\(--lang-accent\);/,
    "$1color: transparent;",
  );
  assert.notEqual(uncoloured, SOURCE);
  assert.ok(
    auditStateCue(uncoloured).some((problem) =>
      problem.includes("stay visible"),
    ),
  );
});

test("negative proof: exposing the decorative check to assistive tech is caught", () => {
  const mutated = SOURCE.replace(
    /(lang-option__check")\s+aria-hidden="true"/,
    "$1",
  );
  assert.notEqual(mutated, SOURCE);
  assert.ok(
    auditStateCue(mutated).some((problem) => problem.includes("aria-hidden")),
  );
});

test("negative proof: shrinking the trigger below 44px or renaming it is caught", () => {
  const small = SOURCE.replace(/min-height:\s*44px/, "min-height: 32px");
  assert.notEqual(small, SOURCE);
  assert.ok(auditStateCue(small).some((problem) => problem.includes("44x44")));

  const renamed = SOURCE.replace(
    "const triggerName = `${current.shortLabel}",
    "const triggerName = `${current.label}",
  );
  assert.notEqual(renamed, SOURCE);
  assert.ok(
    auditStateCue(renamed).some((problem) => problem.includes("short code")),
  );
});
