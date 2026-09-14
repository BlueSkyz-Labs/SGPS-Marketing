import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { format } from "prettier";

test("diagnostic: C2 home test matches canonical Prettier output", async () => {
  const path = "tests/e2e/c2-home.spec.ts";
  const source = readFileSync(path, "utf8");
  const formatted = await format(source, { filepath: path });

  if (source !== formatted) {
    console.log("--- CANONICAL C2 HOME TEST ---");
    console.log(formatted);
    console.log("--- END CANONICAL C2 HOME TEST ---");
  }

  assert.equal(source, formatted);
});
