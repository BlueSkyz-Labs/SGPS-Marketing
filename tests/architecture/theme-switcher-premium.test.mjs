/**
 * Theme switcher premium guard (shared header-control family).
 *
 * Owner decision 2026-10-04: the appearance trigger is ICON-ONLY.
 *   - trigger = the search button's 44px square (hc-trigger hc-trigger--icon):
 *     no visible text label at any breakpoint, no chevron, no native title;
 *     its accessible name is "<label>: <mode>";
 *   - glyph = one sun <-> moon morph (ThemeMorphIcon) showing the RESOLVED
 *     theme from CSS, a status dot only in System mode, spring-like 450-550ms
 *     motion, instant under reduced motion, system colours under forced
 *     colours; mask ids unique per rendered instance;
 *   - tooltip = CSS-only, aria-hidden, after 300ms on hover and
 *     :focus-visible, hidden while the panel is open;
 *   - panel = caption row, then Light, Dark, System rows (sun, moon, monitor);
 *   - the check mark is shown only for the current row (aria-pressed) and the
 *     current row carries a 2px accent border.
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
// The sun <-> moon glyph.
const MORPH = readFileSync(
  "src/components/layout/ThemeMorphIcon.astro",
  "utf8",
);

function rule(source, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return (
    source.match(new RegExp(`(?:^|\\n)\\s*${escaped}\\s*\\{([^}]*)\\}`))?.[1] ??
    null
  );
}

/** The header trigger's markup: `<button ... data-theme-trigger ...>...</button>`. */
function triggerMarkup(source) {
  return (
    source.match(
      /<button\b(?:(?!<button\b)[\s\S])*?data-theme-trigger[\s\S]*?<\/button>/,
    )?.[0] ?? null
  );
}

/** Text a sighted user sees in the trigger once the hidden tooltip is removed. */
function visibleTriggerText(markup) {
  return markup
    .replace(/<span class="theme-tip"[\s\S]*?\)\)\}\s*<\/span>/, "")
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "")
    .replace(/<[^>]*>/g, "")
    .trim();
}

/** The sun <-> moon glyph: geometry, motion, dot, ids, a11y modes. */
export function auditMorph(morph) {
  const problems = [];
  // Unique mask id per rendered instance: a per-page counter, never a literal.
  if (
    !/const instance = \(Number\(locals\.themeMorphCount\) \|\| 0\) \+ 1;/.test(
      morph,
    ) ||
    !/locals\.themeMorphCount = instance;/.test(morph) ||
    !/const maskId = `theme-morph-\$\{instance\}`;/.test(morph) ||
    !/<mask\s+id=\{maskId\}/.test(morph) ||
    !/mask=\{`url\(#\$\{maskId\}\)`\}/.test(morph) ||
    /\bid="[^"]*"/.test(morph)
  ) {
    problems.push("mask ids must be unique per rendered instance");
  }
  // Sun = disc + 8 rays at the family stroke; moon = same disc + bite.
  const rays = morph.match(/class="tt-rays"[\s\S]*?d="([^"]+)"/)?.[1] ?? "";
  if (
    (rays.match(/M/g) ?? []).length !== 8 ||
    !/class="tt-rays"[\s\S]*?stroke-width="1\.75"/.test(morph) ||
    !/class="tt-core"[\s\S]*?fill="currentColor"/.test(morph) ||
    !/class="tt-bite"[^>]*fill="#000"/.test(morph)
  ) {
    problems.push("the glyph must be one disc with 8 rays and a mask bite");
  }
  const moon = morph.match(
    /\.tt-morph\[data-morph="moon"\],\s*:root\[data-theme="dark"\] \.tt-morph\[data-morph="live"\]\s*\{([^}]*)\}/,
  )?.[1];
  const osMoon = morph.match(
    /@media \(prefers-color-scheme: dark\)\s*\{\s*:root:not\(\[data-theme="light"\]\) \.tt-morph\[data-morph="live"\]\s*\{([^}]*)\}/,
  )?.[1];
  for (const block of [moon, osMoon]) {
    if (
      !block ||
      !/--tt-rays:\s*rotate\(90deg\) scale\(0\)/.test(block) ||
      !/--tt-body:[^;]*rotate\(-25deg\) scale\(1\.\d+\)/.test(block) ||
      !/--tt-bite:\s*none/.test(block)
    ) {
      problems.push(
        "the moon (fixed, pinned dark, OS dark) must turn the rays away, grow and turn the disc, slide the bite in",
      );
      break;
    }
  }
  const duration = Number(morph.match(/--tt-duration:\s*(\d+)ms/)?.[1] ?? 0);
  const spring = morph.match(
    /--tt-spring:\s*cubic-bezier\(([\d.]+), ([\d.]+), ([\d.]+), ([\d.]+)\)/,
  );
  if (
    duration < 450 ||
    duration > 550 ||
    !spring ||
    Number(spring[2]) <= 1 ||
    Number(spring[2]) > 1.6 ||
    !/\.tt-body\s*\{[^}]*transition:\s*transform var\(--tt-duration\) var\(--tt-spring\)/.test(
      morph,
    )
  ) {
    problems.push(
      "the morph must run 450-550ms on a restrained overshoot spring",
    );
  }
  // System dot: hidden by default, shown only while no theme is pinned.
  const dot = rule(morph, ".tt-morph .tt-dot");
  if (
    !/\{dot \? <circle class="tt-dot"/.test(morph) ||
    !dot ||
    !/opacity:\s*0/.test(dot) ||
    !/fill:\s*var\(--hc-accent/.test(dot) ||
    !/stroke:\s*var\(--tt-ring, var\(--hc-surface/.test(dot) ||
    !/:root:not\(\[data-theme\]\) \.tt-morph\[data-morph="live"\] \.tt-dot\s*\{\s*opacity:\s*1/.test(
      morph,
    )
  ) {
    problems.push("the status dot must show only in System mode");
  }
  if (
    !/@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.tt-morph,\s*\.tt-morph \*\s*\{\s*transition:\s*none !important/.test(
      morph,
    )
  ) {
    problems.push("the morph must be instant under prefers-reduced-motion");
  }
  const forced =
    morph.match(
      /@media \(forced-colors: active\)\s*\{([\s\S]*?)\n {2}\}/,
    )?.[1] ?? "";
  if (
    !/\.tt-morph\s*\{\s*color:\s*CanvasText/.test(forced) ||
    !/\.hc-trigger \.tt-morph\s*\{\s*color:\s*ButtonText/.test(forced) ||
    !/\.tt-dot\s*\{\s*fill:\s*Highlight/.test(forced)
  ) {
    problems.push(
      "forced colours must use CanvasText/ButtonText and Highlight",
    );
  }
  if (!/aria-hidden="true"/.test(morph) || !/focusable="false"/.test(morph)) {
    problems.push("the glyph is decoration and must be aria-hidden");
  }
  return problems;
}

export function auditThemeSwitcher(source, shared = SHARED) {
  const problems = [];

  // Trigger: icon only, no label, no chevron, no native title.
  const markup = triggerMarkup(source);
  if (!markup) {
    problems.push("the header trigger must be rendered");
  } else {
    if (!/<ThemeMorphIcon state="live" dot \/>/.test(markup)) {
      problems.push(
        "the trigger must render the live morph glyph with its dot",
      );
    }
    if (visibleTriggerText(markup) !== "") {
      problems.push("the trigger must not render a visible text label");
    }
    if (/chevron/.test(markup)) {
      problems.push("the trigger must not render a chevron");
    }
    if (/\stitle=/.test(markup)) {
      problems.push("the trigger must not carry a native title tooltip");
    }
    if (
      !/<span class="theme-tip" aria-hidden="true" data-theme-tip>/.test(markup)
    ) {
      problems.push("the tooltip must be inside the trigger and aria-hidden");
    }
  }
  if (/data-theme-current-label|theme-trigger__label/.test(source)) {
    problems.push("the trigger must not render a visible text label");
  }
  if (
    !/const triggerName = `\$\{L\.label\}: \$\{L\[DEFAULT_MODE\]\}`/.test(
      source,
    ) ||
    !/aria-label=\{triggerName\}/.test(source) ||
    !/trigger\.setAttribute\("aria-label", `\$\{caption\}: \$\{current\}`\)/.test(
      source,
    )
  ) {
    problems.push("the trigger accessible name must state label and mode");
  }

  // Tooltip: hidden by default, below the trigger, 300ms delay on hover
  // (pointer devices) and focus-visible, never while the panel is open.
  const tip = rule(source, ".theme-tip");
  if (
    !tip ||
    !/opacity:\s*0/.test(tip) ||
    !/visibility:\s*hidden/.test(tip) ||
    !/pointer-events:\s*none/.test(tip) ||
    !/top:\s*calc\(100% \+ 0\.5rem\)/.test(tip)
  ) {
    problems.push(
      "the tooltip must be hidden by default and sit below the trigger",
    );
  }
  const shown = [
    /@media \(hover: hover\)\s*\{\s*\.theme-trigger:hover:not\(\[aria-expanded="true"\]\) \.theme-tip\s*\{([^}]*)\}/,
    /\n\s*\.theme-trigger:focus-visible:not\(\[aria-expanded="true"\]\) \.theme-tip\s*\{([^}]*)\}/,
  ].map((re) => source.match(re)?.[1] ?? null);
  if (
    shown.some(
      (block) =>
        !block ||
        !/opacity:\s*1/.test(block) ||
        !/visibility:\s*visible/.test(block) ||
        !/opacity \d+ms [a-z-]+ 300ms/.test(block),
    )
  ) {
    problems.push(
      "the tooltip must show after 300ms on hover and focus-visible, not while open",
    );
  }
  for (const mode of ["light", "dark", "system"]) {
    if (!new RegExp(`\\[data-theme-tip-mode="${mode}"\\]`).test(source)) {
      problems.push("the tooltip must name every mode");
      break;
    }
  }

  // Shell: the search trigger's 44px square in the shared family.
  const square = rule(shared, ".hc-trigger--icon");
  const trigger = rule(shared, ".hc-trigger");
  if (
    !/class="theme-trigger hc-trigger hc-trigger--icon"/.test(source) ||
    !square ||
    !/width:\s*44px/.test(square) ||
    !/padding:\s*0/.test(square) ||
    !trigger ||
    !/min-width:\s*44px/.test(trigger) ||
    !/min-height:\s*44px/.test(trigger) ||
    !/border-radius:\s*var\(--radius-md\)/.test(trigger)
  ) {
    problems.push("the trigger must be the family's 44px icon square");
  }

  // Panel caption + row order + row glyphs.
  if (
    !/class="theme-group__caption hc-caption"/.test(source) ||
    !/<span>\{L\.label\}<\/span>/.test(source)
  ) {
    problems.push("the panel must carry a caption row with the group label");
  }
  if (!/const MODES = \["light", "dark", "system"\] as const;/.test(source)) {
    problems.push("rows must be ordered Light, Dark, System");
  }
  if (
    !/const ROW_GLYPH = \{ light: "sun", dark: "moon" \} as const;/.test(
      source,
    ) ||
    !/<ThemeMorphIcon state=\{ROW_GLYPH\[mode\]\} \/>/.test(source)
  ) {
    problems.push("the Light and Dark rows must reuse the fixed morph glyph");
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

  // Reduced motion (press feedback + tooltip here, family in the shared file).
  if (
    !/@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.theme-trigger__glyph :global\(\.tt-morph\),\s*\.theme-tip\s*\{\s*transition:\s*none/.test(
      source,
    ) ||
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
  if (
    !/trigger\.setAttribute\("aria-expanded", String\(open\)\)/.test(source)
  ) {
    problems.push("aria-expanded must follow the popover state");
  }
  if (!/data-theme-trigger/.test(source) || !/data-theme-toggle/.test(source)) {
    problems.push("data-theme-trigger and data-theme-toggle must stay");
  }
  return problems;
}

test("the theme switcher keeps the icon-only trigger, panel and row contract", () => {
  assert.deepEqual(auditThemeSwitcher(SOURCE), []);
});

test("the sun <-> moon glyph keeps its geometry, motion, dot and a11y modes", () => {
  assert.deepEqual(auditMorph(MORPH), []);
});

test("the choice semantics stay toggle buttons in a role=group", () => {
  assert.match(SOURCE, /role="group"/);
  assert.match(SOURCE, /<button\s+type="button"\s+data-theme-mode=\{mode\}/);
  assert.doesNotMatch(SOURCE, /role="(listbox|option|menuitemradio)"/);
});

test("CSP and Trusted Types: no inline handlers, no innerHTML", () => {
  for (const source of [SOURCE, MORPH]) {
    assert.doesNotMatch(source, /<script[^>]*\bis:inline\b/);
    assert.doesNotMatch(source, /\bon(click|toggle)\s*=/i);
    assert.doesNotMatch(source, /innerHTML|insertAdjacentHTML|set:html/);
  }
  assert.doesNotMatch(MORPH, /<script/);
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

test("negative proof: a visible text label, a chevron or a native title in the trigger is caught", () => {
  const label = SOURCE.replace(
    /(<ThemeMorphIcon state="live" dot \/>\s*<\/span>)/,
    "$1\n    <span>{L[DEFAULT_MODE]}</span>",
  );
  assert.notEqual(label, SOURCE);
  assert.ok(
    auditThemeSwitcher(label).some((p) => p.includes("visible text label")),
  );
  const literal = SOURCE.replace(
    /(<ThemeMorphIcon state="live" dot \/>\s*<\/span>)/,
    "$1\n    Theme",
  );
  assert.notEqual(literal, SOURCE);
  assert.ok(
    auditThemeSwitcher(literal).some((p) => p.includes("visible text label")),
  );
  const chevron = SOURCE.replace(
    /(<ThemeMorphIcon state="live" dot \/>\s*<\/span>)/,
    '$1\n    <span class="hc-chevron" aria-hidden="true"></span>',
  );
  assert.notEqual(chevron, SOURCE);
  assert.ok(auditThemeSwitcher(chevron).some((p) => p.includes("chevron")));
  const title = SOURCE.replace(
    "aria-label={triggerName}",
    "aria-label={triggerName}\n    title={L.label}",
  );
  assert.notEqual(title, SOURCE);
  assert.ok(auditThemeSwitcher(title).some((p) => p.includes("native title")));
});

test("negative proof: a non-unique (literal) mask id is caught", () => {
  const fixed = MORPH.replace(
    "const maskId = `theme-morph-${instance}`;",
    'const maskId = "theme-morph";',
  );
  assert.notEqual(fixed, MORPH);
  assert.ok(auditMorph(fixed).some((p) => p.includes("unique")));
  const inline = MORPH.replace("id={maskId}", 'id="theme-bite"');
  assert.notEqual(inline, MORPH);
  assert.ok(auditMorph(inline).some((p) => p.includes("unique")));
});

test("negative proof: an announced, instant or always-on tooltip is caught", () => {
  const announced = SOURCE.replace(
    '<span class="theme-tip" aria-hidden="true" data-theme-tip>',
    '<span class="theme-tip" data-theme-tip>',
  );
  assert.notEqual(announced, SOURCE);
  assert.ok(
    auditThemeSwitcher(announced).some((p) => p.includes("aria-hidden")),
  );
  const instant = SOURCE.replaceAll(
    "opacity 160ms ease-out 300ms",
    "opacity 160ms ease-out 0ms",
  );
  assert.notEqual(instant, SOURCE);
  assert.ok(auditThemeSwitcher(instant).some((p) => p.includes("300ms")));
  const whileOpen = SOURCE.replace(
    '.theme-trigger:focus-visible:not([aria-expanded="true"]) .theme-tip',
    ".theme-trigger:focus-visible .theme-tip",
  );
  assert.notEqual(whileOpen, SOURCE);
  assert.ok(auditThemeSwitcher(whileOpen).some((p) => p.includes("300ms")));
});

test("negative proof: a dot outside System, a lazy morph or no reduced motion is caught", () => {
  const dot = MORPH.replace(
    ':root:not([data-theme]) .tt-morph[data-morph="live"] .tt-dot',
    '.tt-morph[data-morph="live"] .tt-dot',
  );
  assert.notEqual(dot, MORPH);
  assert.ok(auditMorph(dot).some((p) => p.includes("System mode")));
  const slow = MORPH.replace("--tt-duration: 500ms", "--tt-duration: 900ms");
  assert.notEqual(slow, MORPH);
  assert.ok(auditMorph(slow).some((p) => p.includes("450-550ms")));
  const bouncy = MORPH.replace(
    "cubic-bezier(0.34, 1.32, 0.52, 1)",
    "cubic-bezier(0.34, 2.4, 0.52, 1)",
  );
  assert.notEqual(bouncy, MORPH);
  assert.ok(auditMorph(bouncy).some((p) => p.includes("spring")));
  const motion = MORPH.replace(
    /(@media \(prefers-reduced-motion: reduce\)[\s\S]*?)transition:\s*none !important;/,
    "$1transition: all 1s;",
  );
  assert.notEqual(motion, MORPH);
  assert.ok(auditMorph(motion).some((p) => p.includes("reduced-motion")));
  const osMoon = MORPH.replace(
    /(@media \(prefers-color-scheme: dark\)\s*\{\s*:root:not\(\[data-theme="light"\]\) \.tt-morph\[data-morph="live"\]\s*\{[^}]*)--tt-bite:\s*none;/,
    "$1",
  );
  assert.notEqual(osMoon, MORPH);
  assert.ok(auditMorph(osMoon).some((p) => p.includes("moon")));
  const forced = MORPH.replace("fill: Highlight;", "fill: red;");
  assert.notEqual(forced, MORPH);
  assert.ok(auditMorph(forced).some((p) => p.includes("forced colours")));
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

test("negative proof: losing the accent border, the icon square or the mode name is caught", () => {
  const border = SHARED.replace(
    /(\.hc-row:is\(\[aria-current="page"\], \[aria-pressed="true"\]\),[^{]*\{\s*)border-color:\s*var\(--hc-accent\);/,
    "$1border-color: transparent;",
  );
  assert.notEqual(border, SHARED);
  assert.ok(
    auditThemeSwitcher(SOURCE, border).some((p) => p.includes("accent border")),
  );
  const wide = SOURCE.replace(
    'class="theme-trigger hc-trigger hc-trigger--icon"',
    'class="theme-trigger hc-trigger"',
  );
  assert.notEqual(wide, SOURCE);
  assert.ok(auditThemeSwitcher(wide).some((p) => p.includes("44px icon")));
  const name = SOURCE.replace(
    "const triggerName = `${L.label}: ${L[DEFAULT_MODE]}`",
    "const triggerName = `${L.label}`",
  );
  assert.notEqual(name, SOURCE);
  assert.ok(
    auditThemeSwitcher(name).some((p) => p.includes("accessible name")),
  );
  const motion = SOURCE.replace(
    /(@media \(prefers-reduced-motion: reduce\)[\s\S]*?)transition:\s*none !important;/,
    "$1transition: all 1s;",
  );
  assert.notEqual(motion, SOURCE);
  assert.ok(
    auditThemeSwitcher(motion).some((p) => p.includes("reduced-motion")),
  );
});
