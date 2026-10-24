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

function ruleBody(source, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(
    `(?:^|[\\s,}])${escaped}\\s*\\{([^}]*)\\}`,
    "m",
  ).exec(source);
  return match ? match[1] : null;
}

const BOX_PROPS = [
  [/border-radius\s*:/, "border-radius"],
  [/box-shadow\s*:/, "box-shadow"],
  [/background(?:-color)?\s*:/, "background"],
  [/(?<![-\w])border\s*:/, "box border"],
];

export function boxProblems(source, selector) {
  const body = ruleBody(source, selector);
  if (body === null) return [`${selector}: rule not found`];
  return BOX_PROPS.filter(([re]) => re.test(body)).map(
    ([, name]) => `${selector}: carries ${name}`,
  );
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
  const re = new RegExp(`class="([^"]*\\b${marker}\\b[^"]*)"`, "g");
  let found = 0;
  for (const m of source.matchAll(re)) {
    found += 1;
    if (/\brounded(?:-[\w[\]-]+)?\b|\bbg-\[|\bborder\b|\bp-\d/.test(m[1])) {
      problems.push(`class "${m[1]}" still boxes ${marker}`);
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
  const problems = classAttrProblems(
    broken.replace("trust-ledger-status", "trust-ledger-status"),
    "trust-ledger-status",
  );
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
