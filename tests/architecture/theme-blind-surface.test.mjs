/**
 * Theme-blind surfaces (plan v5 Wave 0, dark-mode regression).
 * Text colours come from theme tokens that flip in dark mode, so a surface
 * hard-coded to white leaves white text on a white card under OS dark mode.
 * Raised surfaces must use `--surface-raised`.
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";

const LITERAL_WHITE_SURFACE = [
  /\bbg-white(?=[\s"'`]|$)/m, // bg-white/10 style overlays stay allowed
  /\bbg-\[#fff(?:fff)?\]/i,
  /\bbackground(?:-color)?:\s*(?:white|#fff(?:fff)?)\s*;/i,
  // F-28: a mix that resolves towards literal white is the same defect wearing
  // a `color-mix` costume — it stays light while the text token flips dark.
  /\bbg-\[color-mix\([^\]]*\bwhite\b[^\]]*\)\]/i,
  /\bbackground(?:-color)?:\s*color-mix\([^;]*\bwhite\b[^;]*\)\s*;/i,
];

export function themeBlindSurfaces(text) {
  return LITERAL_WHITE_SURFACE.filter((re) => re.test(text)).map(String);
}

const walk = (dir, out = []) => {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(astro|css)$/.test(entry)) out.push(full);
  }
  return out;
};

test("no raised surface is hard-coded to white", () => {
  const offenders = walk("src")
    .map((file) => [file, themeBlindSurfaces(readFileSync(file, "utf8"))])
    .filter(([, hits]) => hits.length > 0);
  assert.deepEqual(offenders, [], "use bg-[var(--surface-raised)]");
});

test("the raised surface token flips in both dark blocks", () => {
  const css = readFileSync("src/styles/global.css", "utf8");
  assert.equal((css.match(/--surface-raised:\s*#0f172a;/g) ?? []).length, 2);
  assert.match(css, /--surface-raised:\s*#ffffff;/);
});

test("the footer stays on ink because its text is always porcelain", () => {
  const footer = readFileSync("src/components/layout/Footer.astro", "utf8");
  assert.match(footer, /<footer class="[^"]*bg-\[var\(--brand-ink\)\]/);
});

test("negative proof: literal white surfaces are detected", () => {
  assert.ok(themeBlindSurfaces('class="rounded bg-white p-4"').length > 0);
  assert.ok(themeBlindSurfaces('class="bg-[#ffffff] text-x"').length > 0);
  assert.ok(themeBlindSurfaces(".card {\n  background: white;\n}").length > 0);
  assert.ok(
    themeBlindSurfaces(
      'class="bg-[color-mix(in_srgb,var(--brand-cobalt)_6%,white)]"',
    ).length > 0,
    "a mix towards white is the same theme-blind surface",
  );
  assert.deepEqual(themeBlindSurfaces('class="bg-white/10 border"'), []);
  assert.deepEqual(
    themeBlindSurfaces('class="bg-[var(--surface-raised)]"'),
    [],
  );
  assert.deepEqual(
    themeBlindSurfaces(
      'class="bg-[color-mix(in_srgb,var(--brand-cobalt)_6%,var(--surface-raised))]"',
    ),
    [],
  );
});

/**
 * F-32 guard: a `var(--action-*)` token referenced in the source but never
 * defined resolves to nothing — the flagship CTA's `hover:bg-[var(--action-primary-hover)]`
 * made the button transparent on hover. Every action token must be declared in
 * global.css for the light root and both dark blocks where it carries text.
 */
test("every action token is defined in the theme source", () => {
  const css = readFileSync("src/styles/global.css", "utf8");
  const used = new Set(
    [
      ...walk("src")
        .map((file) => readFileSync(file, "utf8"))
        .join("\n"),
    ]
      .join("")
      .match(/var\(--action-[a-z-]+\)/g)
      ?.map((token) => token.slice(4, -1)) ?? [],
  );
  assert.ok(used.size > 0, "action tokens must be referenced");
  const undefinedTokens = [...used].filter(
    (token) => !css.includes(`${token}:`),
  );
  assert.deepEqual(undefinedTokens, [], "declare the token in global.css");
});
