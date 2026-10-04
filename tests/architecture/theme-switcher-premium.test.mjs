/**
 * Theme switcher premium guard (shared header-control family).
 *
 * The appearance control matches the Sổ Trọ control and the language switcher:
 *   - trigger = icon of the CURRENT mode + visible label + chevron, label
 *     visible from lg (64rem), accessible name contains the visible label;
 *   - panel = caption row, then Light, Dark, System rows;
 *   - the check mark is shown only for the current row (aria-pressed) and the
 *     current row carries a 2px accent border;
 *   - motion is disabled under prefers-reduced-motion.
 * The choice semantics (toggle buttons with aria-pressed in a role=group) and
 * the runtime contracts (applyTheme/initTheme, popover close + focus return)
 * must survive the redesign.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const SOURCE = readFileSync("src/components/layout/ThemeToggle.astro", "utf8");
// Trigger, panel and row styling live in the shared header-control family.
const SHARED = readFileSync("src/components/layout/header-control.css", "utf8");

function rule(source, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return (
    source.match(new RegExp(`(?:^|\\n)\\s*${escaped}\\s*\\{([^}]*)\\}`))?.[1] ??
    null
  );
}

export function auditThemeSwitcher(source, shared = SHARED) {
  const problems = [];

  // Trigger: icon + label + chevron, name contains the visible label.
  if (!/class="theme-trigger__icons hc-glyph"/.test(source)) {
    problems.push("the trigger must render the current-mode icon");
  }
  if (!/data-theme-current-label/.test(source)) {
    problems.push("the trigger must render the visible current-mode label");
  }
  if (!/<BlueSkyzIcon name="chevron-down"/.test(source)) {
    problems.push("the trigger must render a chevron");
  }
  const label = rule(source, ".theme-trigger__label");
  if (!label || !/display:\s*none/.test(label)) {
    problems.push("the trigger label must be hidden below lg");
  }
  if (
    !/@media \(min-width: 64rem\)\s*\{\s*\.theme-trigger__label\s*\{\s*display:\s*inline/.test(
      source,
    )
  ) {
    problems.push("the trigger label must be visible from lg (64rem)");
  }
  if (
    !/const triggerName = `\$\{L\.label\}: \$\{L\[DEFAULT_MODE\]\}`/.test(
      source,
    ) ||
    !/aria-label=\{triggerName\}/.test(source)
  ) {
    problems.push(
      "the trigger accessible name must contain the visible mode label",
    );
  }
  const trigger = rule(shared, ".hc-trigger");
  if (
    !/class="theme-trigger hc-trigger"/.test(source) ||
    !trigger ||
    !/min-width:\s*44px/.test(trigger) ||
    !/min-height:\s*44px/.test(trigger) ||
    !/padding:\s*0 0\.75rem/.test(trigger) ||
    !/gap:\s*0\.5rem/.test(trigger) ||
    !/border-radius:\s*var\(--radius-md\)/.test(trigger)
  ) {
    problems.push("the trigger must keep the shared 44px family geometry");
  }

  // Panel caption + row order.
  if (
    !/class="theme-group__caption hc-caption"/.test(source) ||
    !/<span>\{L\.label\}<\/span>/.test(source)
  ) {
    problems.push("the panel must carry a caption row with the group label");
  }
  if (!/const MODES = \["light", "dark", "system"\] as const;/.test(source)) {
    problems.push("rows must be ordered Light, Dark, System");
  }
  const panel = rule(shared, ".hc-panel");
  if (
    !/"theme-group--panel theme-panel hc-panel"/.test(source) ||
    !panel ||
    !/width:\s*min\(18rem, calc\(100vw - 1\.5rem\)\)/.test(panel) ||
    !/border-radius:\s*var\(--radius-panel\)/.test(panel) ||
    /backdrop-filter/.test(source) ||
    /backdrop-filter/.test(shared.replace(/\/\*[\s\S]*?\*\//g, ""))
  ) {
    problems.push(
      "the panel must be a solid 18rem card with the --radius-panel radius",
    );
  }

  // Rows: state only through aria-pressed; check only for the current row.
  if (
    !/aria-pressed=\{mode === DEFAULT_MODE \? "true" : "false"\}/.test(source)
  ) {
    problems.push("only the current row may be rendered pressed");
  }
  if (!/data-theme-mode=\{mode\}/.test(source)) {
    problems.push("every row must keep data-theme-mode");
  }
  if (!/class="theme-row__check hc-check"\s+aria-hidden="true"/.test(source)) {
    problems.push("the check mark is a decoration and must be aria-hidden");
  }
  if (
    !/\.theme-row:not\(\[aria-pressed="true"\]\) \.theme-row__check :global\(svg\)\s*\{\s*display:\s*none/.test(
      source,
    )
  ) {
    problems.push("the check mark must be shown only for the current row");
  }
  const check = rule(shared, ".hc-check");
  if (
    !check ||
    /display:\s*none/.test(check) ||
    !/width:\s*1\.5rem/.test(check) ||
    !/color:\s*var\(--hc-accent\)/.test(check)
  ) {
    problems.push("the check mark must be sized and use the owned accent");
  }
  const row = rule(shared, ".hc-row");
  if (
    !/class="theme-row hc-row"/.test(source) ||
    !row ||
    !/min-height:\s*3\.5rem/.test(row) ||
    !/border:\s*2px solid transparent/.test(row) ||
    !/grid-template-columns:\s*2\.25rem minmax\(0, 1fr\) 1\.5rem/.test(row)
  ) {
    problems.push("rows must keep the 3.5rem / 2px transparent border grid");
  }
  const current = shared.match(
    /\.hc-row:is\(\[aria-current="page"\], \[aria-pressed="true"\]\),[^{]*\{([^}]*)\}/,
  )?.[1];
  if (
    !current ||
    !/border-color:\s*var\(--hc-accent\)/.test(current) ||
    !/background:\s*var\(--hc-current-bg\)/.test(current)
  ) {
    problems.push("the current row must carry the accent border and tint");
  }

  // Reduced motion.
  if (
    !/@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.theme-trigger__icon\s*\{\s*transition:\s*none/.test(
      source,
    ) ||
    !/class="theme-trigger__chevron hc-chevron"/.test(source) ||
    !/@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.hc-trigger,\s*\.hc-chevron,\s*\.hc-panel,\s*\.hc-panel::backdrop,\s*\.hc-row\s*\{\s*transition:\s*none/.test(
      shared,
    )
  ) {
    problems.push("motion must be disabled under prefers-reduced-motion");
  }

  // Runtime contract.
  if (!/applyTheme\(mode\)/.test(source) || !/initTheme\(\)/.test(source)) {
    problems.push("the runtime must keep applyTheme/initTheme");
  }
  if (!/panel\.hidePopover\(\)/.test(source)) {
    problems.push("choosing a mode must close the popover");
  }
  if (!/data-theme-trigger/.test(source) || !/data-theme-toggle/.test(source)) {
    problems.push("data-theme-trigger and data-theme-toggle must stay");
  }
  return problems;
}

test("the theme switcher keeps the premium trigger, panel and row contract", () => {
  assert.deepEqual(auditThemeSwitcher(SOURCE), []);
});

test("the choice semantics stay toggle buttons in a role=group", () => {
  assert.match(SOURCE, /role="group"/);
  assert.match(SOURCE, /<button\s+type="button"\s+data-theme-mode=\{mode\}/);
  assert.doesNotMatch(SOURCE, /role="(listbox|option|menuitemradio)"/);
});

test("CSP and Trusted Types: no inline handlers, no innerHTML", () => {
  assert.doesNotMatch(SOURCE, /<script[^>]*\bis:inline\b/);
  assert.doesNotMatch(SOURCE, /\bon(click|toggle)\s*=/i);
  assert.doesNotMatch(SOURCE, /innerHTML|insertAdjacentHTML|set:html/);
});

test("palette is owned for light, explicit dark and OS dark", () => {
  assert.match(
    SHARED,
    /\.hc-trigger,\s*\.hc-panel,\s*\.hc-group\s*\{[^}]*--hc-accent:\s*#1d4ed8/,
  );
  assert.match(
    SHARED,
    /:root\[data-theme="dark"\] :is\(\.hc-trigger, \.hc-panel, \.hc-group\),[^{]*\{[^}]*--hc-accent:\s*#3b82f6/,
  );
  assert.match(
    SHARED,
    /prefers-color-scheme: dark\)\s*\{\s*:root:not\(\[data-theme="light"\]\) :is\(\.hc-trigger, \.hc-panel, \.hc-group\)/,
  );
  assert.match(SOURCE, /"theme-group--inline hc-group"/);
});

test("negative proof: rendering the check on every row is caught", () => {
  const mutated = SOURCE.replace(
    /(\.theme-row:not\(\[aria-pressed="true"\]\) \.theme-row__check :global\(svg\)\s*\{\s*)display:\s*none/,
    "$1display: inline",
  );
  assert.notEqual(mutated, SOURCE);
  assert.ok(
    auditThemeSwitcher(mutated).some((p) =>
      p.includes("only for the current row"),
    ),
  );
  const alwaysPressed = SOURCE.replace(
    /aria-pressed=\{mode === DEFAULT_MODE \? "true" : "false"\}/,
    'aria-pressed="true"',
  );
  assert.notEqual(alwaysPressed, SOURCE);
  assert.ok(
    auditThemeSwitcher(alwaysPressed).some((p) =>
      p.includes("only the current row"),
    ),
  );
});

test("negative proof: reordering rows or dropping the caption is caught", () => {
  const reordered = SOURCE.replace(
    '["light", "dark", "system"] as const',
    '["system", "light", "dark"] as const',
  );
  assert.notEqual(reordered, SOURCE);
  assert.ok(
    auditThemeSwitcher(reordered).some((p) =>
      p.includes("Light, Dark, System"),
    ),
  );
  const noCaption = SOURCE.replace(
    'class="theme-group__caption hc-caption"',
    'class="x"',
  );
  assert.notEqual(noCaption, SOURCE);
  assert.ok(auditThemeSwitcher(noCaption).some((p) => p.includes("caption")));
});

test("negative proof: losing the accent border, label breakpoint or chevron is caught", () => {
  const border = SHARED.replace(
    /(\.hc-row:is\(\[aria-current="page"\], \[aria-pressed="true"\]\),[^{]*\{\s*)border-color:\s*var\(--hc-accent\);/,
    "$1border-color: transparent;",
  );
  assert.notEqual(border, SHARED);
  assert.ok(
    auditThemeSwitcher(SOURCE, border).some((p) => p.includes("accent border")),
  );
  const label = SOURCE.replace(
    "@media (min-width: 64rem)",
    "@media (min-width: 90rem)",
  );
  assert.notEqual(label, SOURCE);
  assert.ok(auditThemeSwitcher(label).some((p) => p.includes("from lg")));
  const chevron = SOURCE.replace(
    '<BlueSkyzIcon name="chevron-down"',
    '<BlueSkyzIcon name="check"',
  );
  assert.notEqual(chevron, SOURCE);
  assert.ok(auditThemeSwitcher(chevron).some((p) => p.includes("chevron")));
});

test("negative proof: dropping reduced motion or the visible label name is caught", () => {
  const motion = SOURCE.replace(
    /(@media \(prefers-reduced-motion: reduce\)[\s\S]*?)transition:\s*none !important;/,
    "$1transition: all 1s;",
  );
  assert.notEqual(motion, SOURCE);
  assert.ok(
    auditThemeSwitcher(motion).some((p) => p.includes("reduced-motion")),
  );
  const name = SOURCE.replace(
    "const triggerName = `${L.label}: ${L[DEFAULT_MODE]}`",
    "const triggerName = `${L.label}`",
  );
  assert.notEqual(name, SOURCE);
  assert.ok(
    auditThemeSwitcher(name).some((p) => p.includes("accessible name")),
  );
});
