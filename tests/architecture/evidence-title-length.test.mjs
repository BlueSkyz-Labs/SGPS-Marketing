/** F15: EN/VI evidence page titles use short labels derived from the claim. */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { CLAIMS } from "../../src/data/claims.ts";

const PREFIX = { en: "Evidence", vi: "Bằng chứng" };
const MAX = 75; // title text before the " | BlueSkyz Labs" brand suffix
const PUBLISHED = [
  "security-reporting-is-private",
  "privacy-no-tracking-on-this-site",
  "registry-publishes-only-proven-products",
];

const titleFor = (claim, lang) =>
  `${PREFIX[lang]}: ${claim.titleLabel?.[lang] ?? claim.statement[lang]}`;
const overLimit = (claims, lang) =>
  claims.filter((c) => [...titleFor(c, lang)].length > MAX).map((c) => c.id);

test("every EN/VI evidence title is within the length budget", () => {
  for (const lang of ["en", "vi"]) {
    assert.deepEqual(overLimit(CLAIMS, lang), [], lang);
  }
});

test("labels stay short (<= 60) and the full statement is kept", () => {
  for (const id of PUBLISHED) {
    const claim = CLAIMS.find((c) => c.id === id);
    assert.ok(claim?.titleLabel, id);
    for (const lang of ["en", "vi"]) {
      assert.ok([...claim.titleLabel[lang]].length <= 60, `${id} ${lang}`);
      assert.ok(claim.statement[lang].length > claim.titleLabel[lang].length);
    }
  }
});

test("evidence pages feed the label into <title> only", () => {
  for (const lang of ["en", "vi"]) {
    const src = readFileSync(`src/pages/${lang}/evidence/[id].astro`, "utf8");
    assert.match(src, /passport\.titleLabel\?\./);
    assert.match(src, /description=\{passport\?\.claim\./);
  }
});

test("negative proof: a full-statement title over the budget is rejected", () => {
  const long = {
    id: "x",
    statement: { en: "x".repeat(120), vi: "y".repeat(120) },
  };
  assert.deepEqual(overLimit([long], "en"), ["x"]);
  assert.deepEqual(overLimit([long], "vi"), ["x"]);
  const labelled = { ...long, titleLabel: { en: "short", vi: "ngắn" } };
  assert.deepEqual(overLimit([labelled], "en"), []);
});
