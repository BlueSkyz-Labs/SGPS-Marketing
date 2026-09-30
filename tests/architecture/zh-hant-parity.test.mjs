/**
 * Traditional Chinese (zh-hant) first-class parity guard.
 *
 * `/zh-hant/` mirrors `/zh/` route-for-route and content-file-for-content-file,
 * never links back into the Simplified tree, and every machine-assisted file
 * says so (OpenCC s2twp, pending native review) — the copy is never presented
 * as natively reviewed.
 */
import assert from "node:assert/strict";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import test from "node:test";

const MARKER = /machine-assisted \(OpenCC s2twp\), pending native review/;

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

const relFiles = (dir) =>
  walk(dir)
    .map((file) => relative(dir, file))
    .sort();

export function missingTwins(source, target) {
  return source.filter((file) => !target.includes(file));
}

test("every zh page route has a zh-hant twin and vice versa", () => {
  const zh = relFiles("src/pages/zh");
  const hant = relFiles("src/pages/zh-hant");
  assert.ok(zh.length >= 16, "the zh route set must not be empty");
  assert.deepEqual(missingTwins(zh, hant), [], "zh-hant is missing routes");
  assert.deepEqual(missingTwins(hant, zh), [], "zh-hant has extra routes");
});

test("every zh content page has a zh-hant twin with lang: zh-hant", () => {
  const zh = relFiles("src/content/pages/zh");
  const hant = relFiles("src/content/pages/zh-hant");
  assert.deepEqual(missingTwins(zh, hant), []);
  assert.deepEqual(missingTwins(hant, zh), []);
  for (const file of hant) {
    const text = readFileSync(join("src/content/pages/zh-hant", file), "utf8");
    assert.match(
      text,
      /^lang: zh-hant$/m,
      `${file} must declare lang: zh-hant`,
    );
    assert.match(text, MARKER, `${file} must carry the machine-assisted note`);
    assert.doesNotMatch(text, /(?:^|\s)\/zh\//m, `${file} must not link /zh/`);
    assert.doesNotMatch(text, /native(ly)? (reviewed|verified)/i);
  }
});

test("zh-hant pages point only at zh-hant and carry the machine note", () => {
  for (const file of walk("src/pages/zh-hant")) {
    const text = readFileSync(file, "utf8");
    assert.match(text, MARKER, `${file} must carry the machine-assisted note`);
    assert.doesNotMatch(text, /["'`]\/zh\//, `${file} must not link /zh/`);
    assert.doesNotMatch(text, /lang="zh"/, `${file} must render lang zh-hant`);
    assert.doesNotMatch(
      text,
      /,\s*"zh"\)/,
      `${file} must call helpers with zh-hant`,
    );
  }
});

test("every public product carries a zh-hant block mirroring zh", () => {
  const dir = "src/content/products";
  for (const file of readdirSync(dir).filter((f) => f.endsWith(".yaml"))) {
    const text = readFileSync(join(dir, file), "utf8");
    if (!/^public:\s*true\s*$/m.test(text)) continue;
    const zh = text.match(/^ {2}zh:\n((?: {4}.*\n?)+)/m)?.[1] ?? "";
    const hant = text.match(/^ {2}zh-hant:\n((?: {4}.*\n?)+)/m)?.[1] ?? "";
    assert.ok(zh, `${file}: zh block`);
    assert.ok(hant, `${file}: missing i18n.zh-hant`);
    const keys = (block) =>
      [...block.matchAll(/^ {4}(\w+):/gm)].map((m) => m[1]);
    assert.deepEqual(keys(hant), keys(zh), `${file}: zh-hant keys mirror zh`);
    const items = (block) => (block.match(/^ {6}- /gm) ?? []).length;
    assert.equal(
      items(hant),
      items(zh),
      `${file}: zh-hant list lengths mirror zh`,
    );
    assert.match(
      text,
      new RegExp(`${MARKER.source}\\.\\n {2}zh-hant:`),
      `${file}: zh-hant block must carry the machine-assisted note`,
    );
  }
});

test("the runtime language set and the page trees agree", async () => {
  const { SUPPORTED_LANGUAGES } = await import("../../src/lib/i18n.ts");
  for (const lang of SUPPORTED_LANGUAGES) {
    assert.ok(
      statSync(join("src/pages", lang)).isDirectory(),
      `src/pages/${lang} must exist for every supported language`,
    );
    assert.ok(
      statSync(join("src/content/pages", lang)).isDirectory(),
      `src/content/pages/${lang} must exist for every supported language`,
    );
  }
});

test("negative proof: a missing twin is detected", () => {
  const zh = relFiles("src/pages/zh");
  const hant = relFiles("src/pages/zh-hant").filter(
    (file) => file !== "about.astro",
  );
  assert.deepEqual(missingTwins(zh, hant), ["about.astro"]);
});
