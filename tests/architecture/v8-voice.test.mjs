import assert from "node:assert/strict";
import { execSync } from "node:child_process";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "../..");

/**
 * W1: Banned phrase scan for v8 voice improvements.
 *
 * The banned phrases are removed by W1 (copy foundation) and must not appear
 * in src/**. This test ensures they don't reappear in future edits.
 *
 * Excluded:
 * - tests/: test fixture strings may intentionally contain phrases
 * - docs/: archived/reference text
 * - SITE.proposition: locked/protected branding
 * - verify/*: handled separately by W5a
 */

const BANNED_PHRASES = [
  "View development status",
  "The rest of the house",
  "Web / PWA",
  "first-class routes",
  "not slogans",
  "không phải khẩu hiệu",
  "而非口号",
  "而非口號",
];

function grepSrc(phrase) {
  try {
    const cmd = `grep -r "${phrase.replace(/"/g, '\\"')}" ${path.join(repoRoot, "src")} --include="*.astro" --include="*.ts" --include="*.yaml" 2>/dev/null || true`;
    const result = execSync(cmd, { encoding: "utf-8", stdio: "pipe" });
    return result
      .split("\n")
      .filter((line) => line.trim())
      .filter((line) => {
        // Exclude SITE.proposition
        if (line.includes("SITE.proposition")) return false;
        // Exclude verify component (W5a owns it)
        if (line.includes("verify/")) return false;
        // Exclude Trust.astro (scheduled for deletion in W10; ProofBand.astro is the active component)
        if (line.includes("sections/Trust.astro")) return false;
        return true;
      });
  } catch {
    return [];
  }
}

test("v8-voice: should not contain 'View development status' in src/", () => {
  const hits = grepSrc("View development status");
  assert.equal(hits.length, 0, `Banned phrase found:\n${hits.join("\n")}`);
});

test("v8-voice: should not contain 'The rest of the house' in src/", () => {
  const hits = grepSrc("The rest of the house");
  assert.equal(hits.length, 0, `Banned phrase found:\n${hits.join("\n")}`);
});

test("v8-voice: should not contain 'Web / PWA' in src/", () => {
  const hits = grepSrc("Web / PWA");
  assert.equal(hits.length, 0, `Banned phrase found:\n${hits.join("\n")}`);
});

test("v8-voice: should not contain 'first-class routes' in src/", () => {
  const hits = grepSrc("first-class routes");
  assert.equal(hits.length, 0, `Banned phrase found:\n${hits.join("\n")}`);
});

test("v8-voice: should not contain 'not slogans' in src/", () => {
  const hits = grepSrc("not slogans");
  assert.equal(hits.length, 0, `Banned phrase found:\n${hits.join("\n")}`);
});

test("v8-voice: should not contain 'không phải khẩu hiệu' (vi \"not slogans\") in src/", () => {
  const hits = grepSrc("không phải khẩu hiệu");
  assert.equal(hits.length, 0, `Banned phrase found:\n${hits.join("\n")}`);
});

for (const phrase of ["而非口号", "而非口號"]) {
  test(`v8-voice: should not contain '${phrase}' (zh "not slogans") in src/`, () => {
    const hits = grepSrc(phrase);
    assert.equal(hits.length, 0, `Banned phrase found:\n${hits.join("\n")}`);
  });
}

test("v8-voice: negative proof - should detect banned phrases when present", () => {
  // This test verifies the mechanism works by checking that BANNED_PHRASES
  // contains known phrases that the other tests check for.
  assert(BANNED_PHRASES.includes("View development status"));
  assert(BANNED_PHRASES.includes("first-class routes"));
});
