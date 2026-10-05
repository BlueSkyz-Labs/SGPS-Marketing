/**
 * Premium language switcher guard (shared header-control family).
 *
 * Language identity never uses country flags (ADR 0009; Owner portfolio
 * decision 2026-10-05, SGPS-DEC-2026-037): flags name countries, not
 * languages. The switcher is a brand-tinted globe + language-code trigger and
 * a captioned popover whose rows lead with a code chip. What must not regress:
 *   - no flag component, flag token, flag data attribute or flag emoji exists;
 *   - the trigger shows the globe (aria-hidden) and the short code at every
 *     width; the native name stays in the accessible name and the rows;
 *   - every row leads with its language code chip (aria-hidden) and the
 *     native name;
 *   - short codes are language codes (VI, EN), never country codes (VN, US);
 *   - the panel has its visible (aria-hidden) caption;
 *   - the current row carries a 2px accent border, others a transparent one
 *     (shared header-control.css row, keyed on aria-current).
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const SWITCHER = readFileSync(
  "src/components/layout/LanguageSwitcher.astro",
  "utf8",
);
// Row styling lives in the shared header-control family stylesheet.
const SHARED = readFileSync("src/components/layout/header-control.css", "utf8");
const TOKENS = readFileSync("src/styles/global.css", "utf8");
const I18N = readFileSync("src/lib/i18n.ts", "utf8");
const FLAG_COMPONENT = "src/components/icon/LanguageFlag.astro";

function rule(source, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return (
    source.match(new RegExp(`(?:^|\\n)\\s*${escaped}\\s*\\{([^}]*)\\}`))?.[1] ??
    null
  );
}

/** Any trace of a country flag standing for a language. */
export function auditNoFlags({ switcher, shared, tokens, flagFileExists }) {
  const problems = [];
  if (flagFileExists)
    problems.push("the LanguageFlag component must not exist");
  if (/LanguageFlag|lang-flag|data-flag/.test(switcher)) {
    problems.push("the switcher must not render a flag");
  }
  if (/[\u{1F1E6}-\u{1F1FF}]/u.test(switcher)) {
    problems.push("no emoji flags in the switcher");
  }
  if (/--flag-/.test(shared) || /--flag-/.test(tokens)) {
    problems.push("no flag tokens in the shared styles");
  }
  return problems;
}

/** Short codes name languages (ISO 639-1 style), never countries. */
export function auditShortCodes(i18n) {
  const problems = [];
  const codes = Object.fromEntries(
    [
      ...i18n.matchAll(/^ {2}"?([\w-]+)"?: \{[\s\S]*?shortLabel: "([^"]+)"/gm),
    ].map((m) => [m[1], m[2]]),
  );
  if (codes.en !== "EN") problems.push(`en short code is ${codes.en}`);
  if (codes.vi !== "VI") problems.push(`vi short code is ${codes.vi}`);
  for (const [lang, code] of Object.entries(codes)) {
    if (/^(VN|US|GB|CN|HK|TW)$/.test(code)) {
      problems.push(`${lang} uses the country code ${code}`);
    }
  }
  return problems;
}

export function auditPremium(switcher, shared = SHARED) {
  const problems = [];
  const triggerBlock = switcher.match(/<button[\s\S]*?<\/button>/)?.[0] ?? "";
  if (
    !/<span class="lang-switch__globe hc-glyph" aria-hidden="true">\s*<BlueSkyzIcon name="globe" \/>/.test(
      triggerBlock,
    )
  ) {
    problems.push("the trigger must lead with the aria-hidden globe");
  }
  if (!/lang-switch__code[^>]*>\s*\{current\.shortLabel\}/.test(triggerBlock)) {
    problems.push("the trigger must show the short code");
  }
  if (
    !/<span class="hc-row__lead lang-chip" aria-hidden="true">\s*\{config\.shortLabel\}/.test(
      switcher,
    )
  ) {
    problems.push("every row must lead with its aria-hidden code chip");
  }
  if (!/lang-option__native[\s\S]*?\{config\.label\}/.test(switcher)) {
    problems.push("every row must show the native name");
  }
  if (!/lang-panel__caption"\s+aria-hidden="true"/.test(switcher)) {
    problems.push("the panel needs its visible caption (aria-hidden)");
  }
  if (!/"lang-option hc-row"/.test(switcher)) {
    problems.push("language rows must use the shared row");
  }
  const current = shared.match(
    /\.hc-row:is\(\[aria-current="page"\], \[aria-pressed="true"\]\),[^{]*\{([^}]*)\}/,
  )?.[1];
  if (!current || !/border-color:\s*var\(--hc-accent\)/.test(current)) {
    problems.push("the current row must carry the accent border");
  }
  const option = rule(shared, ".hc-row");
  if (!option || !/border:\s*2px solid transparent/.test(option)) {
    problems.push("rows keep a 2px transparent border (no layout shift)");
  }
  const name = rule(switcher, ".lang-switch__name");
  if (!name || !/display:\s*none/.test(name)) {
    problems.push("the pill hides the native name");
  }
  if (
    /\.lang-switch__code\s*\{\s*display:\s*none;/.test(
      switcher.replace(
        /\.lang-switch--menu \.lang-switch__code\s*\{\s*display:\s*none;\s*\}/,
        "",
      ),
    )
  ) {
    problems.push("the pill shows the short code at every width");
  }
  return problems;
}

const LIVE = {
  switcher: SWITCHER,
  shared: SHARED,
  tokens: TOKENS,
  flagFileExists: existsSync(FLAG_COMPONENT),
};

test("no country flag stands for a language", () => {
  assert.deepEqual(auditNoFlags(LIVE), []);
});

test("short codes are language codes, not country codes", () => {
  assert.deepEqual(auditShortCodes(I18N), []);
});

test("the premium switcher contract holds", () => {
  assert.deepEqual(auditPremium(SWITCHER), []);
});

test("negative proof: any flag trace is caught", () => {
  assert.ok(
    auditNoFlags({ ...LIVE, flagFileExists: true }).some((p) =>
      p.includes("must not exist"),
    ),
  );
  for (const planted of [
    "<LanguageFlag language={lang} />",
    '<span data-flag="VN"></span>',
    "\u{1F1FB}\u{1F1F3}",
  ]) {
    assert.notDeepEqual(
      auditNoFlags({ ...LIVE, switcher: `${SWITCHER}\n${planted}` }),
      [],
      planted,
    );
  }
  assert.ok(
    auditNoFlags({ ...LIVE, tokens: `${TOKENS}\n:root{--flag-red-vn:#da251d}` })
      .length > 0,
  );
});

test("negative proof: a country code as short label is caught", () => {
  const vn = I18N.replace('shortLabel: "VI"', 'shortLabel: "VN"');
  assert.notEqual(vn, I18N);
  assert.ok(auditShortCodes(vn).some((p) => p.includes("VN")));
  const us = I18N.replace('shortLabel: "EN"', 'shortLabel: "US"');
  assert.notEqual(us, I18N);
  assert.ok(auditShortCodes(us).some((p) => p.includes("US")));
});

test("negative proof: dropping the globe, code or chip is caught", () => {
  const noGlobe = SWITCHER.replace(
    '<BlueSkyzIcon name="globe" />\n    </span>\n    <span class="lang-switch__code"',
    '\n    </span>\n    <span class="lang-switch__code"',
  );
  assert.notEqual(noGlobe, SWITCHER);
  assert.ok(auditPremium(noGlobe).some((p) => p.includes("globe")));
  const noChip = SWITCHER.replace(
    /<span class="hc-row__lead lang-chip" aria-hidden="true">\s*\{config\.shortLabel\}/,
    '<span class="hc-row__lead lang-chip">{config.shortLabel}',
  );
  assert.notEqual(noChip, SWITCHER);
  assert.ok(auditPremium(noChip).some((p) => p.includes("code chip")));
});

test("negative proof: hiding the code on wide screens is caught", () => {
  const swapped = SWITCHER.replace(
    "  .lang-chip {",
    "  @media (min-width: 64rem) {\n    .lang-switch__code {\n      display: none;\n    }\n  }\n\n  .lang-chip {",
  );
  assert.notEqual(swapped, SWITCHER);
  assert.ok(auditPremium(swapped).some((p) => p.includes("every width")));
});

test("negative proof: an exposed caption or lost accent border is caught", () => {
  const noCaption = SWITCHER.replace(
    /lang-panel__caption" aria-hidden="true"/,
    'lang-panel__caption"',
  );
  assert.notEqual(noCaption, SWITCHER);
  assert.ok(auditPremium(noCaption).some((p) => p.includes("caption")));
  const noBorder = SHARED.replace(
    /(\.hc-row:is\(\[aria-current="page"\], \[aria-pressed="true"\]\),[^{]*\{\s*)border-color:\s*var\(--hc-accent\);/,
    "$1",
  );
  assert.notEqual(noBorder, SHARED);
  assert.ok(
    auditPremium(SWITCHER, noBorder).some((p) => p.includes("accent border")),
  );
});
