import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import test from "node:test";

/**
 * Wave G2 guard: a visible date has one role, `Dateline.astro`.
 *
 * Rule 1: a time element (`<time` followed by whitespace, `>` or end of line)
 * may appear only inside `Dateline.astro`, or when the previous line carries
 * a JSX comment holding the token `dateline-exempt: year` AND the element itself is
 * year-only (`datetime={String(<x>Year)}` or `datetime="YYYY"`). The token in
 * an attribute or plain text does not exempt anything.
 *
 * Rule 2: a variable assigned from an ISO-day expression (`toISOString()`
 * followed by `.slice(0, 10)`, `.substring(0, 10)` or `.split("T")[0]`, or any
 * `toLocaleDateString(`) must not be printed as visible text: neither
 * interpolated in a template literal (`${var}`) nor as a text child (`{var}`
 * not preceded by `=`). Such an expression written inline inside `{...}` or
 * `${...}` is flagged too. Attribute and prop positions are allowed.
 *
 * Remaining limits (source-level heuristic, not a parse): the variable is not
 * followed through a rename (`const b = a`), a function call, an object or
 * another file; rule 1 is a text scan, so a time element built by string
 * concatenation is not seen. The dist-level backstop in
 * wg-dateline-dist.test.mjs covers rendered output when `dist/` exists.
 */
const ROOT = new URL("../../", import.meta.url).pathname;
const DATELINE = ["src", "components", "shared", "Dateline.astro"].join("/");
const EXEMPT = "dateline-exempt: year";
const YEAR_ONLY = /^\s*<time datetime=(\{String\([\w.]+Year\)\}|"\d{4}")>/;
const ISO_DAY =
  "toISOString\\(\\)\\s*(?:\\.slice\\(\\s*0\\s*,\\s*10\\s*\\)|\\.substring\\(\\s*0\\s*,\\s*10\\s*\\)|\\.split\\(\\s*[\"']T[\"']\\s*\\)\\s*\\[\\s*0\\s*\\])";

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
      const marked = new RegExp(`\\{/\\*\\s*${EXEMPT}\\s*\\*/\\}`).test(
        previous,
      );
      if (!marked || !YEAR_ONLY.test(line)) {
        problems.push(`${file}:${i + 1}: raw <time> outside Dateline`);
      }
    });
  }
  const ISO_EXPR = `(?:${ISO_DAY}|toLocaleDateString\\()`;
  const vars = [
    ...source.matchAll(
      new RegExp(`(?:const|let)\\s+(\\w+)\\s*=[^;\\n]*${ISO_EXPR}`, "g"),
    ),
  ].map((m) => m[1]);
  if (new RegExp(`(?:\\$|(?<![=\\s]))\\{[^{}]*${ISO_EXPR}`).test(source)) {
    problems.push(`${file}: ISO-day expression printed inline as visible text`);
  }
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
  const exempt = `{/* ${EXEMPT} */}\n<time datetime="2024">2024</time>\n{/* ${EXEMPT} */}\n<time datetime={String(SITE.operatingSinceYear)}>`;
  assert.deepEqual(datelineProblems("src/components/Y.astro", exempt), []);
  const wrongElement = `{/* ${EXEMPT} */}\n<time datetime={entry.datePublished}>x</time>`;
  const wrong = datelineProblems("src/components/Y.astro", wrongElement);
  console.log(
    `NEGATIVE PROOF (exempt on a full date): FAIL -> ${wrong.join(" | ")}`,
  );
  assert.equal(wrong.length, 1);
  const attrToken = `<p data-x="${EXEMPT}">\n<time datetime="2024">2024</time>`;
  assert.equal(datelineProblems("src/components/Y.astro", attrToken).length, 1);
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
  const inline = datelineProblems(
    "src/components/F4.astro",
    "<p>{capture.capturedAt.toISOString().slice(0, 10)}</p>",
  );
  console.log(`NEGATIVE PROOF (inline): FAIL -> ${inline.join(" | ")}`);
  assert.equal(inline.length, 1);
  for (const expr of [
    "d.toISOString().substring(0, 10)",
    'd.toISOString().split("T")[0]',
  ]) {
    const src = `---\nconst when = ${expr};\n---\n<p>{when}</p>`;
    assert.equal(
      datelineProblems("src/components/F5.astro", src).length,
      1,
      expr,
    );
  }
  const locale = `---\nconst when = d.toLocaleDateString("en");\n---\n<p>{when}</p>`;
  assert.equal(datelineProblems("src/components/F6.astro", locale).length, 1);
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

test("WG-02: Dateline refuses a non-ISO value at build time", () => {
  const source = readFileSync(join(ROOT, DATELINE), "utf8");
  assert.match(source, /\^\\d\{4\}-\\d\{2\}-\\d\{2\}\$\/\.test\(iso\)/);
  assert.match(source, /throw new Error\(\s*`Dateline:/);
  // astro/container exists in this Astro version, but rendering a .astro file
  // needs the Vite/Astro compiler pipeline that node --test does not run and
  // the repo has no vitest harness: NOT AVAILABLE here. Rendered output is
  // covered by tests/e2e/wg-dateline.spec.ts and the dist backstop.
});
