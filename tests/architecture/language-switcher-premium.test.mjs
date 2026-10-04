/**
 * Premium language switcher guard (shared header-control family).
 *
 * The switcher is a flag pill trigger plus a captioned, flag-led popover.
 * What must not regress:
 *   - the decorative flag appears in the trigger and in every row, aria-hidden;
 *   - the panel has its visible (aria-hidden) caption;
 *   - the current row carries a 2px accent border, others a transparent one
 *     (shared header-control.css row, keyed on aria-current);
 *   - the trigger shows the native name from lg and the short code below;
 *   - the flag mapping is the Owner decision: en US, vi VN, zh CN, zh-hant HK.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const SWITCHER = readFileSync(
  "src/components/layout/LanguageSwitcher.astro",
  "utf8",
);
const FLAG = readFileSync("src/components/icon/LanguageFlag.astro", "utf8");
// Row styling lives in the shared header-control family stylesheet.
const SHARED = readFileSync("src/components/layout/header-control.css", "utf8");

function rule(source, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return (
    source.match(new RegExp(`(?:^|\\n)\\s*${escaped}\\s*\\{([^}]*)\\}`))?.[1] ??
    null
  );
}

export function auditPremium(switcher, flag, shared = SHARED) {
  const problems = [];
  const triggerBlock = switcher.match(/<button[\s\S]*?<\/button>/)?.[0] ?? "";
  if (!/<LanguageFlag language=\{currentLang\}/.test(triggerBlock)) {
    problems.push("the trigger must render the current language flag");
  }
  if (!/<LanguageFlag language=\{lang\}/.test(switcher)) {
    problems.push("every row must lead with its language flag");
  }
  if (
    !/<span\s+class:list=\{\["lang-flag"[\s\S]*?aria-hidden="true"/.test(flag)
  ) {
    problems.push("the flag is decoration and must be aria-hidden");
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
    problems.push("the native name is hidden below lg");
  }
  if (
    !/@media \(min-width: 64rem\)\s*\{\s*\.lang-switch__code\s*\{\s*display:\s*none;\s*\}\s*\.lang-switch__name\s*\{\s*display:\s*inline;/.test(
      switcher,
    )
  ) {
    problems.push("lg must swap the short code for the native name");
  }
  const map = flag.match(/LANGUAGE_FLAG_CODE[^=]*=\s*\{([^}]*)\}/)?.[1];
  const pairs = [...(map ?? "").matchAll(/"?([\w-]+)"?:\s*"(\w+)"/g)].map(
    (m) => `${m[1]}=${m[2]}`,
  );
  const expected = ["en=US", "vi=VN", "zh=CN", "zh-hant=HK"];
  if (pairs.sort().join() !== expected.sort().join()) {
    problems.push("flag mapping must be en US, vi VN, zh CN, zh-hant HK");
  }
  return problems;
}

test("the premium switcher contract holds", () => {
  assert.deepEqual(auditPremium(SWITCHER, FLAG), []);
});

test("no emoji flags anywhere in the switcher or flag component", () => {
  assert.doesNotMatch(SWITCHER + FLAG, /[\u{1F1E6}-\u{1F1FF}]/u);
});

test("negative proof: dropping the trigger flag is caught", () => {
  const mutated = SWITCHER.replace(
    "<LanguageFlag language={currentLang} />",
    "",
  );
  assert.notEqual(mutated, SWITCHER);
  assert.ok(
    auditPremium(mutated, FLAG).some((p) => p.includes("trigger must render")),
  );
});

test("negative proof: a row without its flag is caught", () => {
  const mutated = SWITCHER.replace("<LanguageFlag language={lang} />", "");
  assert.notEqual(mutated, SWITCHER);
  assert.ok(auditPremium(mutated, FLAG).some((p) => p.includes("every row")));
});

test("negative proof: an exposed flag or a missing caption is caught", () => {
  const exposed = FLAG.replace(' aria-hidden="true"', "");
  assert.notEqual(exposed, FLAG);
  assert.ok(
    auditPremium(SWITCHER, exposed).some((p) => p.includes("aria-hidden")),
  );
  const noCaption = SWITCHER.replace(
    /lang-panel__caption" aria-hidden="true"/,
    'lang-panel__caption"',
  );
  assert.notEqual(noCaption, SWITCHER);
  assert.ok(auditPremium(noCaption, FLAG).some((p) => p.includes("caption")));
});

test("negative proof: losing the accent border or the lg swap is caught", () => {
  const noBorder = SHARED.replace(
    /(\.hc-row:is\(\[aria-current="page"\], \[aria-pressed="true"\]\),[^{]*\{\s*)border-color:\s*var\(--hc-accent\);/,
    "$1",
  );
  assert.notEqual(noBorder, SHARED);
  assert.ok(
    auditPremium(SWITCHER, FLAG, noBorder).some((p) =>
      p.includes("accent border"),
    ),
  );
  const noSwap = SWITCHER.replace("min-width: 64rem", "min-width: 99rem");
  assert.notEqual(noSwap, SWITCHER);
  assert.ok(auditPremium(noSwap, FLAG).some((p) => p.includes("lg must swap")));
});

test("negative proof: a wrong flag mapping is caught", () => {
  const mutated = FLAG.replace('"zh-hant": "HK"', '"zh-hant": "CN"');
  assert.notEqual(mutated, FLAG);
  assert.ok(
    auditPremium(SWITCHER, mutated).some((p) => p.includes("flag mapping")),
  );
});
