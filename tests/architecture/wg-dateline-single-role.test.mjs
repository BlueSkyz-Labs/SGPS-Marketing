import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import test from "node:test";

/**
 * Wave G2 guard: a visible date has one role, `Dateline.astro`.
 *
 * Rule 1: a time element (`<time` followed by whitespace, `>` or end of line)
 * may appear only inside `Dateline.astro`, or on a line directly after the
 * exemption comment `dateline-exempt: year` (year-only elements).
 *
 * Rule 2: a variable assigned from `...toISOString().slice(0, 10)` must not be
 * printed as visible text: neither interpolated in a template literal
 * (`${var}`) nor as a text child (`{var}` not preceded by `=`). Attribute and
 * prop positions (`data-x={var}`, `iso={var}`) are allowed.
 *
 * Limits (heuristic, source-level): it does not follow the variable through a
 * function call, an object or another file; it ignores `.slice(0, 10)` on
 * values other than `toISOString()`; and rule 1 is a text scan, not a parse,
 * so a time element built by string concatenation would not be seen.
 */
const ROOT = new URL("../../", import.meta.url).pathname;
const DATELINE = ["src", "components", "shared", "Dateline.astro"].join("/");
const EXEMPT = "dateline-exempt: year";

function* astroFiles(dir) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) yield* astroFiles(full);
    else if (name.endsWith(".astro")) yield full;
  }
}

export function datelineProblems(file, source) {
  const problems = [];
  if (file !== DATELINE) {
    const lines = source.split("\n");
    lines.forEach((line, i) => {
      if (!/<time(?=[\s>]|$)/.test(line)) return;
      const previous = lines[i - 1] ?? "";
      if (!previous.includes(EXEMPT)) {
        problems.push(`${file}:${i + 1}: raw <time> outside Dateline`);
      }
    });
  }
  const vars = [
    ...source.matchAll(
      /(?:const|let)\s+(\w+)\s*=[^;\n]*toISOString\(\)\s*\.slice\(\s*0\s*,\s*10\s*\)/g,
    ),
  ].map((m) => m[1]);
  for (const name of vars) {
    if (new RegExp(`\\$\\{\\s*${name}\\s*\\}`).test(source)) {
      problems.push(`${file}: ISO slice "${name}" interpolated in a template`);
    }
    if (new RegExp(`(?<![=$])\\{\\s*${name}\\s*\\}`).test(source)) {
      problems.push(`${file}: ISO slice "${name}" printed as a text child`);
    }
  }
  return problems;
}

test("WG-02: every visible date goes through Dateline (or is a marked year)", () => {
  const all = [];
  let scanned = 0;
  for (const full of astroFiles(join(ROOT, "src"))) {
    scanned += 1;
    const file = relative(ROOT, full).split(sep).join("/");
    all.push(...datelineProblems(file, readFileSync(full, "utf8")));
  }
  assert.ok(scanned > 100, `scanned ${scanned} astro files`);
  assert.deepEqual(all, []);
});

test("WG-02: Dateline renders time with the ISO in datetime and formatDate text", () => {
  const source = readFileSync(join(ROOT, DATELINE), "utf8");
  assert.match(source, /datetime=\{iso\}/);
  assert.match(source, /formatDate\(lang, iso\)/);
  assert.match(source, /font-variant-numeric:\s*tabular-nums/);
  assert.match(source, /var\(--c4-type-meta\)/);
  assert.match(source, /var\(--text-secondary\)/);
  assert.match(source, /letter-spacing:\s*0\.01em/);
  assert.doesNotMatch(source, /<script|new Date\(|Date\.now/);
});

test("WG-02 negative proof: the guard fails on a reintroduced raw <time>", () => {
  const fixture = [
    "---",
    "const published = entry.datePublished;",
    "---",
    '<p class="meta">',
    "  <time datetime={published}>{published}</time>",
    "</p>",
  ].join("\n");
  const problems = datelineProblems("src/components/Fixture.astro", fixture);
  console.log(`NEGATIVE PROOF (raw <time>): FAIL -> ${problems.join(" | ")}`);
  assert.equal(problems.length, 1);
  assert.match(problems[0], /raw <time> outside Dateline/);
  // The year exemption passes only with the token on the preceding line.
  const exempt = `{/* ${EXEMPT} */}\n<time datetime="2024">2024</time>`;
  assert.deepEqual(datelineProblems("src/components/Y.astro", exempt), []);
  const sameLine = `<time datetime="2024">2024</time> {/* ${EXEMPT} */}`;
  assert.equal(datelineProblems("src/components/Y.astro", sameLine).length, 1);
});

test("WG-02 negative proof: the guard fails on an ISO slice printed as text", () => {
  const template = [
    "---",
    "const capturedOn = capture.capturedAt.toISOString().slice(0, 10);",
    "const copy = `Captured ${capturedOn} with sample data`;",
    "---",
  ].join("\n");
  const asTemplate = datelineProblems("src/components/F1.astro", template);
  console.log(`NEGATIVE PROOF (template): FAIL -> ${asTemplate.join(" | ")}`);
  assert.equal(asTemplate.length, 1);
  const textChild = [
    "---",
    "const capturedOn = capture.capturedAt.toISOString().slice(0, 10);",
    "---",
    "<span>{capturedOn}</span>",
  ].join("\n");
  const asText = datelineProblems("src/components/F2.astro", textChild);
  console.log(`NEGATIVE PROOF (text child): FAIL -> ${asText.join(" | ")}`);
  assert.equal(asText.length, 1);
  // Attribute and prop positions stay legal.
  const legal = [
    "---",
    "const capturedOn = capture.capturedAt.toISOString().slice(0, 10);",
    "---",
    '<figure data-capture-date={capturedOn}><Dateline iso={capturedOn} lang="en" /></figure>',
  ].join("\n");
  assert.deepEqual(datelineProblems("src/components/F3.astro", legal), []);
});

test("WG-02: Dateline output per locale and non-ISO fall-through", async () => {
  const { formatDate } = await import("../../src/lib/i18n.ts");
  const expected = {
    en: "September 12, 2026",
    vi: "12 tháng 9, 2026",
    zh: "2026年9月12日",
    "zh-hant": "2026年9月12日",
  };
  for (const [lang, text] of Object.entries(expected)) {
    assert.equal(formatDate(lang, "2026-09-12"), text, lang);
  }
  for (const lang of Object.keys(expected)) {
    assert.equal(formatDate(lang, "soon"), "soon");
    assert.equal(formatDate(lang, "2026-02-31"), "2026-02-31");
    assert.equal(formatDate(lang, "2026"), "2026");
  }
});
