import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  cpSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, sep } from "node:path";
import test from "node:test";

const KIT = "brand/blueskyz-production-v4";
const SUMS = "00_START_HERE/SHA256SUMS.txt";
// The two index files describe the kit and cannot list their own digest.
const SELF_DESCRIBING = new Set([SUMS, "00_START_HERE/MANIFEST.csv"]);

function listFiles(root, dir = root) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return listFiles(root, path);
    return [relative(root, path).split(sep).join("/")];
  });
}

// Returns every way the mirror differs from the kit's own SHA256SUMS.txt.
function auditKit(root) {
  const expected = new Map(
    readFileSync(join(root, SUMS), "utf8")
      .split(/\r?\n/)
      .filter(Boolean)
      .map((line) => {
        const [, digest, path] = line.match(/^([0-9a-f]{64}) [ *](.+)$/);
        return [path, digest];
      }),
  );
  const present = new Set(listFiles(root));
  const problems = [];
  for (const [path, digest] of expected) {
    if (!present.has(path)) {
      problems.push(`missing: ${path}`);
      continue;
    }
    const actual = createHash("sha256")
      .update(readFileSync(join(root, path)))
      .digest("hex");
    if (actual !== digest) problems.push(`changed: ${path}`);
  }
  for (const path of present) {
    if (!expected.has(path) && !SELF_DESCRIBING.has(path)) {
      problems.push(`unlisted: ${path}`);
    }
  }
  return { checked: expected.size, problems };
}

test("the committed kit mirror matches every SHA256SUMS entry byte for byte", () => {
  const { checked, problems } = auditKit(KIT);
  assert.equal(checked, 240);
  assert.deepEqual(problems, []);
});

test("negative proof: a changed, missing or unlisted kit file is reported", () => {
  const copy = mkdtempSync(join(tmpdir(), "bsl-kit-"));
  try {
    cpSync(KIT, copy, { recursive: true });
    const changed = join(copy, "07_DESIGN_TOKENS/tokens.css");
    writeFileSync(changed, `${readFileSync(changed, "utf8")}\n`);
    rmSync(join(copy, "03_ICONS/01_FAVICON_PWA/favicon.ico"));
    writeFileSync(join(copy, "Mockup DEMO.png"), "not a kit asset");
    // CRLF normalisation is the realistic silent drift (.gitattributes).
    const csv = join(copy, "00_START_HERE/ASSET_USAGE_MATRIX.csv");
    writeFileSync(
      csv,
      readFileSync(csv).toString("latin1").replaceAll("\r\n", "\n"),
      "latin1",
    );

    assert.deepEqual(auditKit(copy).problems.sort(), [
      "changed: 00_START_HERE/ASSET_USAGE_MATRIX.csv",
      "changed: 07_DESIGN_TOKENS/tokens.css",
      "missing: 03_ICONS/01_FAVICON_PWA/favicon.ico",
      "unlisted: Mockup DEMO.png",
    ]);
  } finally {
    rmSync(copy, { recursive: true, force: true });
  }
});

test("git keeps the kit mirror byte-exact instead of normalising line endings", () => {
  assert.match(
    readFileSync(".gitattributes", "utf8"),
    /^brand\/blueskyz-production-v4\/\*\* -text$/m,
  );
});
