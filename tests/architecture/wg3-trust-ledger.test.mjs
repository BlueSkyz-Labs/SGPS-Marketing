import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

/**
 * Wave G3-B guard: the trust surfaces (Verify claims, TrustLedger, the
 * Verify disclosure, Contact sections, the 404 numeral) are hairline rows in
 * the C4 grammar, not boxes.
 *
 * Each rule reads a CSS rule body (or a class attribute) from source and
 * fails on a radius, a shadow, a raised or tinted fill, a box border, or a
 * missing C4 token. Negative-proof fixtures below break each rule on purpose.
 */
const ROOT = new URL("../../", import.meta.url).pathname;
const read = (path) => readFileSync(`${ROOT}${path}`, "utf8");

const VERIFY = "src/components/verify/VerifyCentre.astro";
const LEDGER = "src/components/experience/TrustLedger.astro";
const HEADER = "src/components/layout/PageHeader.astro";
const C4 = "src/styles/c4-quiet-authority.css";
const CONTACT_FILES = [
  "src/components/empty-state/PublicContactEmails.astro",
  "src/pages/en/contact.astro",
  "src/pages/vi/contact.astro",
  "src/pages/zh/contact.astro",
  "src/pages/zh-hant/contact.astro",
];

/**
 * Minimal CSS reader: every rule as { selectors, body, inMedia }, walking into
 * at-rules so a rule hidden inside `@media` is still inspected. Comments are
 * stripped first.
 */
export function parseRules(source) {
  const styles = [...source.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)];
  const css = (
    styles.length > 0 ? styles.map((m) => m[1]).join("\n") : source
  ).replace(/\/\*[\s\S]*?\*\//g, "");
  const rules = [];
  function walk(text, inMedia) {
    let i = 0;
    while (i < text.length) {
      const open = text.indexOf("{", i);
      if (open === -1) break;
      const prelude = text.slice(i, open).trim();
      let depth = 1;
      let j = open + 1;
      while (j < text.length && depth > 0) {
        if (text[j] === "{") depth += 1;
        else if (text[j] === "}") depth -= 1;
        j += 1;
      }
      const inner = text.slice(open + 1, j - 1);
      if (prelude.startsWith("@")) {
        walk(inner, inMedia || /^@(media|supports|container)/.test(prelude));
      } else {
        rules.push({
          selectors: prelude
            .split(",")
            .map((part) => part.trim())
            .filter(Boolean),
          body: inner,
          inMedia,
        });
      }
      i = j;
    }
  }
  walk(css, false);
  return rules;
}

/** Last compound of a selector part, e.g. `:lang(vi) .a:hover` -> `.a:hover`. */
const lastCompound = (part) => part.split(/\s+(?![^(]*\))/).pop();

/**
 * Rules whose subject is `selector` (any ancestor prefix, any pseudo-class
 * except focus; never a pseudo-element). `exact` limits to a bare selector.
 */
export function rulesFor(source, selector, { exact = false } = {}) {
  return parseRules(source).filter((rule) =>
    rule.selectors.some((part) => {
      if (exact) return part === selector;
      const compound = lastCompound(part);
      if (!compound.startsWith(selector)) return false;
      const rest = compound.slice(selector.length);
      if (rest === "") return true;
      if (/^(\[[^\]]*\])*(:(?!:)(?!focus)[a-z-]+(\([^)]*\))?)*$/.test(rest))
        return true;
      return false;
    }),
  );
}

/** First exact, non-media body: the rule the token checks read. */
function ruleBody(source, selector) {
  const rule = rulesFor(source, selector, { exact: true }).find(
    (r) => !r.inMedia,
  );
  return rule ? rule.body : null;
}

const BOX_PROPS =
  /(?:^|[;\s{])(border(?:-[a-z-]*)?-radius|box-shadow|filter|background(?:-[a-z]+)?|border(?:-(?:top|bottom|left|right|block|inline)[a-z-]*)?-width|outline)\s*:/g;

const HAIRLINE = "1px solid var(--c4-hairline)";

/** Border declarations that box a row: shorthand, sides, or a non-hairline rule. */
function borderProblemsIn(body) {
  const problems = [];
  for (const [, name, value] of body.matchAll(
    /(?:^|[;\s{])(border(?:-[a-z-]+)?)\s*:\s*([^;]+)/g,
  )) {
    if (/-(radius|width)$/.test(name)) continue;
    const v = value.trim();
    if (name === "border-top" || name === "border-bottom") {
      if (v !== HAIRLINE && v !== "0" && v !== "none")
        problems.push(`${name}: ${v}`);
    } else if (name === "border-bottom-color" || name === "border-top-color") {
      if (v !== "transparent" && !v.startsWith("var(--c4-hairline"))
        problems.push(`${name}: ${v}`);
    } else if (!/^border-(style|color)$/.test(name)) {
      problems.push(`${name}: ${v}`);
    }
  }
  return problems;
}

export function boxProblems(source, selector) {
  const rules = rulesFor(source, selector);
  if (rules.length === 0) return [`${selector}: rule not found`];
  const problems = [];
  for (const rule of rules) {
    const where = rule.inMedia ? " (in at-rule)" : "";
    for (const [, name] of rule.body.matchAll(BOX_PROPS)) {
      problems.push(`${selector}${where}: carries ${name}`);
    }
    for (const bad of borderProblemsIn(rule.body)) {
      problems.push(`${selector}${where}: carries box border ${bad}`);
    }
  }
  const declared = rulesFor(source, selector, { exact: true }).filter(
    (r) => !r.inMedia,
  ).length;
  if (declared !== 1)
    problems.push(
      `${selector}: declared ${declared} times outside media (expected 1)`,
    );
  return problems;
}

export function tokenProblems(source, selector, tokens) {
  const body = ruleBody(source, selector);
  if (body === null) return [`${selector}: rule not found`];
  return tokens
    .filter((token) => !body.includes(token))
    .map((token) => `${selector}: missing ${token}`);
}

export function classAttrProblems(source, marker) {
  const problems = [];
  const literal = new RegExp(`class="([^"]*\\b${marker}\\b[^"]*)"`, "g");
  const list = new RegExp(
    `class:list=\\{([\\s\\S]*?\\b${marker}\\b[\\s\\S]*?)\\}(?=[\\s/>])`,
    "g",
  );
  const boxing =
    /\brounded(?:-[\w[\]-]+)?\b|\bbg-[\w[\]-]+|\bshadow(?:-[\w[\]-]+)?\b|\bborder\b|\bp-\d/;
  let found = 0;
  for (const re of [literal, list]) {
    for (const m of source.matchAll(re)) {
      found += 1;
      if (boxing.test(m[1])) {
        problems.push(`class "${m[1].trim()}" still boxes ${marker}`);
      }
    }
  }
  if (found === 0) problems.push(`${marker}: no element found`);
  return problems;
}

export function numeralProblems(source) {
  const body = ruleBody(source, ".page-header__eyebrow--numeral");
  if (body === null) return ["numeral rule not found"];
  const problems = [];
  if (!/color\s*:\s*var\(--text-secondary\)/.test(body))
    problems.push("numeral colour is not --text-secondary");
  if (!/font-weight\s*:\s*500\b/.test(body))
    problems.push("numeral weight is not 500");
  return problems;
}

const TOP_RULE = [
  [".verify-claim", VERIFY],
  [".trust-ledger-card", LEDGER],
  [".verify-layer__summary", VERIFY],
  [".contact-section", C4],
];

test("claim, ledger and disclosure rows carry no radius, shadow, fill or box border", () => {
  const problems = [
    ...boxProblems(read(VERIFY), ".verify-claim"),
    ...boxProblems(read(VERIFY), ".verify-layer__summary"),
    ...boxProblems(read(LEDGER), ".trust-ledger-card"),
    ...boxProblems(read(LEDGER), ".trust-ledger-status"),
    ...boxProblems(read(C4), ":where(.contact-section)"),
  ];
  assert.deepEqual(problems, []);
  assert.equal(ruleBody(read(VERIFY), ".verify-layer"), null);
});

test("rows rule themselves with the C4 hairline token", () => {
  const problems = TOP_RULE.flatMap(([selector, file]) =>
    tokenProblems(
      read(file),
      selector === ".contact-section" ? ":where(.contact-section)" : selector,
      ["border-top: 1px solid var(--c4-hairline)"],
    ),
  );
  assert.deepEqual(problems, []);
  assert.deepEqual(
    tokenProblems(read(VERIFY), ".verify-claim", ["padding: var(--space-6) 0"]),
    [],
  );
});

test("status, disclosure and contact headings speak eyebrow voice from C4 tokens", () => {
  const voice = [
    "font-size: var(--c4-type-meta)",
    "letter-spacing: var(--tracking-eyebrow)",
    "text-transform: uppercase",
    "color: var(--text-secondary)",
  ];
  assert.deepEqual(
    [
      ...tokenProblems(read(LEDGER), ".trust-ledger-status", voice),
      ...tokenProblems(read(VERIFY), ".verify-layer__summary", voice),
      ...tokenProblems(read(C4), ".contact-section__heading", voice),
    ],
    [],
  );
  assert.deepEqual(
    tokenProblems(read(VERIFY), ".verify-claim__limit", [
      "font-size: var(--c4-type-meta)",
    ]),
    [],
  );
  assert.deepEqual(
    tokenProblems(read(VERIFY), ".verify-claim__statement", [
      "font-size: var(--c4-type-reading)",
    ]),
    [],
  );
});

export function globalLedgerProblems(css) {
  return [...css.matchAll(/\.trust-ledger-card[^{,]*\{([^}]*)\}/g)]
    .filter(([, body]) => /box-shadow|border-color|background/.test(body))
    .map(() => "global CSS still elevates .trust-ledger-card");
}

test("no global rule elevates or tints the ledger rows", () => {
  assert.deepEqual(globalLedgerProblems(read("src/styles/global.css")), []);
});

test("TrustLedger drops the tinted status colour map but keeps its hooks", () => {
  const source = read(LEDGER);
  assert.doesNotMatch(source, /STATUS_CLASSES/);
  assert.doesNotMatch(source, /color-mix/);
  assert.match(source, /data-trust-ledger/);
  assert.match(source, /data-trust-surface=\{entry\.id\}/);
  assert.deepEqual(classAttrProblems(source, "trust-ledger-card"), []);
});

test("Contact sections are unboxed in the component and all four locales", () => {
  const problems = CONTACT_FILES.flatMap((file) =>
    classAttrProblems(read(file), "contact-section").map(
      (p) => `${file}: ${p}`,
    ),
  );
  assert.deepEqual(problems, []);
  for (const file of CONTACT_FILES.slice(1)) {
    assert.match(read(file), /data-contact-card="security"/);
  }
});

test("the 404 numeral is quiet and keeps its forced-colors rule", () => {
  const source = read(HEADER);
  assert.deepEqual(numeralProblems(source), []);
  assert.match(
    source,
    /@media \(forced-colors: active\)[\s\S]*?\.page-header__eyebrow--numeral\s*\{\s*color: CanvasText;/,
  );
});

test("negative proof: a boxed claim fails", () => {
  const broken = read(VERIFY).replace(
    ".verify-claim {",
    ".verify-claim {\n    border-radius: var(--radius-card);",
  );
  const problems = boxProblems(broken, ".verify-claim");
  console.log(`FAIL (expected): ${problems.join("; ")}`);
  assert.ok(problems.some((p) => p.includes("border-radius")));
});

test("negative proof: a raised ledger background fails", () => {
  const broken = read(LEDGER).replace(
    ".trust-ledger-card {",
    ".trust-ledger-card {\n    background: var(--surface-raised);",
  );
  const problems = boxProblems(broken, ".trust-ledger-card");
  console.log(`FAIL (expected): ${problems.join("; ")}`);
  assert.ok(problems.some((p) => p.includes("background")));
});

test("negative proof: a shadowed contact section fails", () => {
  const broken = read(C4).replace(
    ":where(.contact-section) {",
    ":where(.contact-section) {\n  box-shadow: 0 1px 2px #000;",
  );
  const problems = boxProblems(broken, ":where(.contact-section)");
  console.log(`FAIL (expected): ${problems.join("; ")}`);
  assert.ok(problems.some((p) => p.includes("box-shadow")));
});

test("negative proof: a missing hairline fails", () => {
  const broken = read(VERIFY).replace(
    "border-top: 1px solid var(--c4-hairline);\n  }\n\n  .verify-claim__main",
    "}\n\n  .verify-claim__main",
  );
  const problems = tokenProblems(broken, ".verify-claim", [
    "border-top: 1px solid var(--c4-hairline)",
  ]);
  console.log(`FAIL (expected): ${problems.join("; ")}`);
  assert.equal(problems.length, 1);
});

test("negative proof: a tinted status pill class fails", () => {
  const broken = read(LEDGER).replace(
    'class="trust-ledger-status"',
    'class="trust-ledger-status rounded-md border"',
  );
  assert.match(broken, /rounded-md border/);
  const problems = classAttrProblems(broken, "trust-ledger-status");
  console.log(`FAIL (expected): ${problems.join("; ")}`);
  assert.equal(problems.length, 1);
});

test("negative proof: a boxed contact class fails", () => {
  const broken = read(CONTACT_FILES[1]).replace(
    'class="contact-section flex',
    'class="contact-section rounded-xl border p-6 flex',
  );
  const problems = classAttrProblems(broken, "contact-section");
  console.log(`FAIL (expected): ${problems.join("; ")}`);
  assert.equal(problems.length, 1);
});

test("negative proof: a loud 404 numeral fails", () => {
  const broken = read(HEADER).replace(
    "color: var(--text-secondary);\n    font-variant-numeric",
    "color: var(--action-primary);\n    font-variant-numeric",
  );
  const problems = numeralProblems(broken);
  console.log(`FAIL (expected): ${problems.join("; ")}`);
  assert.ok(problems.some((p) => p.includes("--text-secondary")));
});

test("negative proof: a global elevation on the ledger row fails", () => {
  const broken = `${read("src/styles/global.css")}\n.trust-ledger-card:hover { box-shadow: var(--elevation-2); }`;
  const problems = globalLedgerProblems(broken);
  console.log(`FAIL (expected): ${problems.join("; ")}`);
  assert.equal(problems.length, 1);
});

export function viOverrideProblems(source, selector) {
  const hit = parseRules(source).some(
    (rule) =>
      rule.selectors.includes(`:lang(vi) ${selector}`) &&
      /text-transform\s*:\s*none/.test(rule.body),
  );
  return hit ? [] : [`${selector}: no :lang(vi) text-transform: none override`];
}

const EYEBROWS = [
  [LEDGER, ".trust-ledger-status"],
  [VERIFY, ".verify-layer__summary"],
  [C4, ".contact-section__heading"],
];

test("every new uppercase eyebrow has a Vietnamese sentence-case override", () => {
  assert.deepEqual(
    EYEBROWS.flatMap(([file, selector]) =>
      viOverrideProblems(read(file), selector),
    ),
    [],
  );
});

test("negative proof: a deleted :lang(vi) override fails", () => {
  const problems = EYEBROWS.flatMap(([file, selector]) => {
    const source = read(file);
    const rule = new RegExp(
      `:lang\\(vi\\) ${selector.replace(".", "\\.")} \\{[^}]*\\}\\n?`,
    );
    assert.match(source, rule, `${selector}: fixture must find the override`);
    return viOverrideProblems(source.replace(rule, ""), selector);
  });
  console.log(`FAIL (expected): ${problems.join("; ")}`);
  assert.equal(problems.length, EYEBROWS.length);
});

test("negative proof: a longhand radius, a filter and a background-image fail", () => {
  const cases = [
    ["border-top-left-radius: 8px;", "border-top-left-radius"],
    ["border-start-start-radius: 8px;", "border-start-start-radius"],
    ["filter: drop-shadow(0 1px 2px #000);", "filter"],
    ["background-image: linear-gradient(#fff, #eee);", "background-image"],
    ["border-block-width: 2px;", "border-block-width"],
    ["outline: 1px solid red;", "outline"],
  ];
  for (const [decl, name] of cases) {
    const broken = read(VERIFY).replace(
      ".verify-claim {",
      `.verify-claim {\n    ${decl}`,
    );
    const problems = boxProblems(broken, ".verify-claim");
    console.log(`FAIL (expected): ${problems.join("; ")}`);
    assert.ok(
      problems.some((p) => p.includes(name)),
      `${decl} must be caught`,
    );
  }
});

test("negative proof: a box border side fails, a hairline side passes", () => {
  const broken = read(VERIFY).replace(
    ".verify-claim {",
    ".verify-claim {\n    border-left: 3px solid var(--action-primary);",
  );
  const problems = boxProblems(broken, ".verify-claim");
  console.log(`FAIL (expected): ${problems.join("; ")}`);
  assert.ok(problems.some((p) => p.includes("border-left")));
  assert.deepEqual(boxProblems(read(VERIFY), ".verify-claim"), []);
});

test("negative proof: a boxing rule hidden inside @media fails", () => {
  const broken = read(VERIFY).replace(
    "</style>",
    "@media (min-width: 640px) {\n  .verify-claim { box-shadow: 0 1px 2px #000; }\n}\n</style>",
  );
  const problems = boxProblems(broken, ".verify-claim");
  console.log(`FAIL (expected): ${problems.join("; ")}`);
  assert.ok(problems.some((p) => p.includes("in at-rule")));
});

test("negative proof: a second declaration of a guarded selector fails", () => {
  const broken = read(LEDGER).replace(
    "</style>",
    ".trust-ledger-card { margin: 0; }\n</style>",
  );
  const problems = boxProblems(broken, ".trust-ledger-card");
  console.log(`FAIL (expected): ${problems.join("; ")}`);
  assert.ok(problems.some((p) => p.includes("declared 2 times")));
});

test("negative proof: a pseudo-class variant that boxes the row fails", () => {
  const broken = read(VERIFY).replace(
    "</style>",
    ".verify-claim:hover { background: var(--surface-raised); }\n</style>",
  );
  const problems = boxProblems(broken, ".verify-claim");
  console.log(`FAIL (expected): ${problems.join("; ")}`);
  assert.ok(problems.some((p) => p.includes("background")));
});

test("negative proof: shadow-* and bg-* utilities and class:list fail", () => {
  const shadow = read(LEDGER).replace(
    'class="trust-ledger-status"',
    'class="trust-ledger-status shadow-md"',
  );
  const bg = read(LEDGER).replace(
    'class="trust-ledger-status"',
    'class="trust-ledger-status bg-slate-50"',
  );
  const list = read(LEDGER).replace(
    'class="trust-ledger-status"',
    'class:list={["trust-ledger-status", "rounded-md"]}',
  );
  const problems = [shadow, bg, list].flatMap((source) =>
    classAttrProblems(source, "trust-ledger-status"),
  );
  console.log(`FAIL (expected): ${problems.join("; ")}`);
  assert.equal(problems.length, 3);
});

test("the open verify disclosure hands its closing rule to the body", () => {
  const open = rulesFor(read(VERIFY), ".verify-layer__summary").filter((r) =>
    r.selectors.some((part) => part.includes("[open]")),
  );
  assert.equal(open.length, 1);
  assert.match(open[0].body, /border-bottom\s*:\s*0\s*;/);
});

test("negative proof: a boxing open-state summary rule fails", () => {
  const broken = read(VERIFY).replace(
    "border-bottom: 0;\n  }",
    "border-bottom: 2px solid red;\n  }",
  );
  const problems = boxProblems(broken, ".verify-layer__summary");
  console.log(`FAIL (expected): ${problems.join("; ")}`);
  assert.ok(problems.some((p) => p.includes("border-bottom")));
});
