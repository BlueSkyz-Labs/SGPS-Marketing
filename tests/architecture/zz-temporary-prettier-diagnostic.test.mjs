import { readFileSync } from "node:fs";
import test from "node:test";
import { format, resolveConfig } from "prettier";

// TEMPORARY EVIDENCE TOOL: exact Prettier output for existing PR #282 formatting failures.
// Remove before merge. No network, credentials, personal data or production side effects.
test("diagnostic: print exact formatted source of two changed files", async () => {
  for (const path of [
    "src/pages/vi/support.astro",
    "tests/architecture/support-intake-separation.test.mjs",
  ]) {
    const original = readFileSync(path, "utf8");
    const options = (await resolveConfig(path)) ?? {};
    const formatted = await format(original, { ...options, filepath: path });
    console.log("PRETTIER_FORMAT_RESULT " + JSON.stringify({ path, changed: formatted !== original, formatted }));
  }
});
