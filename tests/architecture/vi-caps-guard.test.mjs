/**
 * Vietnamese small-caps guard.
 *
 * Inter is self-hosted as a latin and a vietnamese subset, so an all-caps run
 * such as "GIAI ĐOẠN HIỆN TẠI" is shaped across two font files and loses the
 * T+Ạ kerning pair (a visible gap). Vietnamese keeps labels in sentence case:
 * every uppercase treatment in src/ must be `.eyebrow` or carry a `:lang(vi)`
 * override that resets `text-transform`.
 */
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { extname, join } from "node:path";
import { test } from "node:test";

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const norm = (sel) => sel.replace(/\s+/g, " ").trim();

/** Findings for one source file: un-overridden uppercase CSS rules or class strings. */
export function auditUppercase(text) {
  const findings = [];
  const css = text.replace(/\/\*[\s\S]*?\*\//g, "");
  const overridden = new Set();
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!/text-transform:\s*none/.test(m[2])) continue;
    for (const sel of m[1].split(",")) {
      const s = norm(sel);
      if (s.startsWith(":lang(vi) ")) overridden.add(s.slice(10));
    }
  }
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (!/text-transform:\s*uppercase/.test(m[2])) continue;
    for (const sel of m[1].split(",")) {
      const s = norm(sel);
      if (s.includes("::first-letter")) continue; // one glyph, no run split
      if (!overridden.has(s)) findings.push(`css: ${s}`);
    }
  }
  // Tailwind utility class strings (attribute values / class:list strings).
  for (const m of text.matchAll(
    /["'`]([^"'`\n]*\buppercase\b[^"'`\n]*)["'`]/g,
  )) {
    const cls = m[1];
    if (/\{|\}\s*$/.test(cls) && /text-transform/.test(cls)) continue;
    if (/(^|\s)eyebrow(\s|$)/.test(cls)) continue;
    if (cls.includes("[&:lang(vi)]:normal-case")) continue;
    findings.push(`class: ${cls}`);
  }
  return findings;
}

test("every uppercase treatment in src/ is .eyebrow or has a :lang(vi) override", () => {
  const offenders = [];
  for (const file of walk("src")) {
    if (![".css", ".astro", ".ts", ".tsx"].includes(extname(file))) continue;
    for (const f of auditUppercase(readFileSync(file, "utf8"))) {
      offenders.push(`${file} -> ${f}`);
    }
  }
  assert.deepEqual(offenders, []);
});

test(".eyebrow resets to sentence case in Vietnamese", () => {
  const css = readFileSync("src/styles/global.css", "utf8");
  assert.match(css, /:lang\(vi\) \.eyebrow \{\s*text-transform: none;\s*\}/);
});

test("negative proof: the auditor flags un-overridden uppercase", () => {
  assert.ok(
    auditUppercase(".x-label {\n  text-transform: uppercase;\n}").length > 0,
  );
  assert.ok(auditUppercase(`<p class="text-xs uppercase">x</p>`).length > 0);
  assert.equal(
    auditUppercase(
      ".x-label {\n text-transform: uppercase;\n}\n:lang(vi) .x-label {\n text-transform: none;\n}",
    ).length,
    0,
  );
  assert.equal(
    auditUppercase(
      `<p class="text-xs uppercase [&:lang(vi)]:normal-case">x</p>`,
    ).length,
    0,
  );
});
