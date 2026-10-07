import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

/**
 * Experience v6 S8 — honest empty states. No e-mail address or phone number
 * may appear in rendered sources unless it comes from the approved data path
 * (the env-supplied `SITE.contactEmail`, never a literal).
 *
 * Founder literals (audit E-26, resolved 2026-10-07, #523): the Owner
 * confirmed the entity facts, so the About composition — and only it — may
 * render founder name/title/year/location, strictly from the `pages`
 * collection (`{lang}-about` entry), never as hardcoded literals elsewhere.
 */
export const EMAIL =
  /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/;
export const PHONE =
  /tel:|(?:\+\d{1,3}[ .-]?)\(?\d{1,4}\)?[ .-]\d{3}[ .-]?\d{3,4}|\b0\d{2,3}[ .-]\d{3}[ .-]\d{3,4}\b/;
export const FOUNDER =
  /Tony Nguyen|\bFounder\b|\bCEO\b|Nhà sáng lập|Giám đốc điều hành|创始人|創辦人|首席执行官|執行長/;

export function wordCount(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const RENDERED = ["src/pages", "src/components", "src/layouts", "src/data"]
  .flatMap(walk)
  .filter((p) => /\.(astro|ts|md)$/.test(p));
const SCANNED = RENDERED;

test("rendered sources carry no literal e-mail address", () => {
  const hits = SCANNED.filter((p) =>
    EMAIL.test(readFileSync(p, "utf8").replace(/@\/[\w./-]*/g, "")),
  );
  assert.deepEqual(hits, []);
});

test("rendered sources carry no phone number or tel: link", () => {
  const hits = SCANNED.filter((p) => PHONE.test(readFileSync(p, "utf8")));
  assert.deepEqual(hits, []);
});

test("rendered sources carry no founder or biography literal outside the About composition", () => {
  const hits = SCANNED.filter(
    (p) =>
      !p.endsWith("empty-state/AboutComposition.astro") &&
      FOUNDER.test(readFileSync(p, "utf8")),
  );
  assert.deepEqual(hits, []);
});

test("the retired About block (deleted in v8 W10) does not return", () => {
  assert.equal(
    existsSync("src/components/sections/AboutBlueSkyz.astro"),
    false,
  );
  const importers = SCANNED.filter((p) =>
    readFileSync(p, "utf8").includes("AboutBlueSkyz"),
  );
  assert.deepEqual(importers, []);
});

test("product content and page data carry no e-mail or phone literal", () => {
  const files = ["src/content/products", "src/content/pages"].flatMap(walk);
  const hits = files.filter((p) => {
    const text = readFileSync(p, "utf8");
    return EMAIL.test(text) || PHONE.test(text);
  });
  assert.deepEqual(hits, []);
});

test("contact mailbox renders only from SITE.contactEmail", () => {
  for (const lang of ["en", "vi", "zh", "zh-hant"]) {
    const page = readFileSync(`src/pages/${lang}/contact.astro`, "utf8");
    assert.match(page, /mailto:\$\{SITE\.contactEmail\}/);
    assert.match(page, /<ProductSignInLane lang="[^"]+" \/>/);
    assert.match(page, /<BusinessRouteState/);
  }
});

test("founder facts render only from the owner-confirmed pages collection", () => {
  const about = readFileSync(
    "src/components/empty-state/AboutComposition.astro",
    "utf8",
  );
  // Data-driven: the composition reads founder_* from the pages collection…
  assert.match(about, /getEntry\("pages"/);
  assert.match(about, /founder_name/);
  // …never hardcoded literals.
  assert.doesNotMatch(about, /Tony Nguyen/);
});

// Negative proofs: each detector turns RED when the protected invariant is broken.
test("negative proof: detectors flag an injected e-mail, phone, founder and 151-word About", () => {
  assert.ok(EMAIL.test("<p>Write to hello@example.com</p>"));
  assert.ok(!EMAIL.test('import x from "@/data/site"'));
  assert.ok(PHONE.test('<a href="tel:+84901234567">call</a>'));
  assert.ok(PHONE.test("Call +84 901 234 567"));
  assert.ok(PHONE.test("Gọi 090 123 4567"));
  assert.ok(FOUNDER.test("Tony Nguyen — Founder & CEO"));
  assert.ok(FOUNDER.test("创始人兼首席执行官"));
  assert.ok(wordCount(Array(151).fill("w").join(" ")) > 150);
  assert.ok(wordCount(Array(150).fill("w").join(" ")) <= 150);
});

