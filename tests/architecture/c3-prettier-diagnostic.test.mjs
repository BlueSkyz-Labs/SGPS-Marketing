import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { format } from "prettier";

const TARGET = "tests/architecture/c3-craft-contract.test.mjs";

test("diagnostic: C3 craft contract matches pinned Prettier", async () => {
  const source = readFileSync(TARGET, "utf8");
  const formatted = await format(source, { parser: "babel" });
  if (source !== formatted) {
    console.error("C3_PRETTIER_CANONICAL_START");
    console.error(formatted);
    console.error("C3_PRETTIER_CANONICAL_END");
  }
  assert.equal(source, formatted, "apply the printed canonical form, then remove this diagnostic");
});
