/**
 * Experience v6 S2 — brand + flagship hero with a real, labelled capture
 * (source level). Complements tests/e2e/exp-s2-hero-flagship.spec.ts.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = (path) => readFileSync(path, "utf8");

/** The hero contract: promise H1, labelled real capture, one primary CTA. */
export function heroContractHolds(hero, capture) {
  const h1 = hero.match(/<h1[\s\S]*?<\/h1>/)?.[0] ?? "";
  const promiseH1 = /\bproposition\b/.test(h1) && !/\bjobs\b/.test(h1);
  const eagerCapture =
    /<FlagshipCapture[\s\S]*?\bpriority\b[\s\S]*?\/>/.test(hero) &&
    /fetchpriority=\{priority \? "high"/.test(capture) &&
    /width=\{item\.width\}/.test(capture) &&
    /height=\{item\.height\}/.test(capture);
  const labelled =
    /<figcaption/.test(capture) &&
    /development/.test(capture) &&
    /sample data|dữ liệu mẫu|示例数据|範例資料/.test(capture);
  const onePrimary = (hero.match(/<ButtonLink\b/g) ?? []).length === 2;
  return promiseH1 && eagerCapture && labelled && onePrimary;
}

const HERO = "src/components/sections/Hero.astro";
const CAPTURE = "src/components/product/FlagshipCapture.astro";

test("hero: promise H1, eager sized capture, visible label, one primary action", () => {
  assert.ok(heroContractHolds(read(HERO), read(CAPTURE)));
});

test("negative proof: registry job line as H1 is rejected", () => {
  const regressed = read(HERO).replace(
    /(<h1[\s\S]*?)\bproposition\b/,
    "$1copy.jobs[0]",
  );
  assert.equal(heroContractHolds(regressed, read(CAPTURE)), false);
});

test("negative proof: an unlabelled capture is rejected", () => {
  const regressed = read(CAPTURE).replace(
    /<figcaption[\s\S]*?<\/figcaption>/,
    "",
  );
  assert.equal(heroContractHolds(read(HERO), regressed), false);
});

test("negative proof: a lazy, unsized capture is rejected", () => {
  const regressed = read(CAPTURE)
    .replace(/fetchpriority=\{priority \? "high" : "auto"\}/, "")
    .replace(/width=\{item\.width\}/, "");
  assert.equal(heroContractHolds(read(HERO), regressed), false);
});

test("capture facts come from the showcase record, in all four locales", () => {
  const capture = read(CAPTURE);
  assert.match(capture, /getShowcase\(slug\)/);
  assert.match(capture, /item\.alt\[lang\]/);
  assert.match(capture, /capture\.sourceRevision/);
  for (const lang of ["en", "vi", "zh", '"zh-hant"']) {
    assert.ok(capture.includes(`${lang}:`), lang);
  }
});

test("the home flagship act shows the capture, never a device frame around identity art", () => {
  const theatre = read("src/components/product/FlagshipTheatre.astro");
  assert.match(theatre, /<FlagshipCapture/);
  assert.doesNotMatch(theatre, /device-frame|window-controls/);
  assert.doesNotMatch(read(CAPTURE), /ProductVisual|identity-art/);
});

test("the capture sources are files already published in the showcase record", () => {
  const showcase = read("src/content/showcases/sotro.yaml");
  assert.match(showcase, /id: today[\s\S]*?op-01-home\.webp/);
  assert.match(showcase, /id: owner-collect[\s\S]*?mgr-02-payments\.webp/);
});
