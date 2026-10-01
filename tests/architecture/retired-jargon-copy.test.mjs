import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

// Copy Phase 2 (C-20, C-22, C-23, C-24, C-33, C-35): internal system nouns were
// replaced by plain reader language. These strings must not render again.
const RETIRED = [
  "Evidence passport",
  "Hộ chiếu bằng chứng",
  "Reach the right lane",
  "Help that stays honest",
  "Mục lục ngôi nhà",
  "Chòm sao bằng chứng",
  "Vòng đời",
];

const COMMENT_LINE = /^\s*(\/\/|\/\*|\*|<!--)/;

export function findRetired(text) {
  const visible = text
    .split("\n")
    .filter((line) => !COMMENT_LINE.test(line))
    .join("\n");
  return RETIRED.filter((phrase) => visible.includes(phrase));
}

function walk(dir, extensions) {
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter(
      (entry) =>
        entry.isFile() && extensions.some((ext) => entry.name.endsWith(ext)),
    )
    .map((entry) => join(entry.parentPath ?? entry.path, entry.name));
}

test("retired jargon does not appear in rendered source copy", () => {
  const offenders = walk("src", [".astro", ".ts", ".yaml", ".md"]).flatMap(
    (file) =>
      findRetired(readFileSync(file, "utf8")).map(
        (phrase) => `${file}: ${phrase}`,
      ),
  );
  assert.deepEqual(offenders, []);
});

test("retired jargon does not appear in built dist html when dist exists", () => {
  if (!existsSync("dist")) return;
  const offenders = walk("dist", [".html"]).flatMap((file) =>
    findRetired(readFileSync(file, "utf8")).map(
      (phrase) => `${file}: ${phrase}`,
    ),
  );
  assert.deepEqual(offenders, []);
});

test("negative proof: the detector flags each retired phrase and ignores comments", () => {
  for (const phrase of RETIRED) {
    assert.deepEqual(findRetired(`<h1>${phrase}</h1>`), [phrase]);
  }
  assert.deepEqual(findRetired("// Evidence passport (historic note)"), []);
  assert.deepEqual(findRetired("<h1>Evidence for this claim</h1>"), []);
});
