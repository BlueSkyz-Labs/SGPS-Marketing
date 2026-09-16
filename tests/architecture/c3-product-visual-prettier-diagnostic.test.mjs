import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { format } from "prettier";

const TARGET = "tests/e2e/c3-product-visual.spec.ts";

test("diagnostic: ProductVisual E2E contract matches pinned Prettier", async () => {
  const source = readFileSync(TARGET, "utf8");
  const formatted = await format(source, { parser: "typescript" });
  if (source !== formatted) {
    console.error("C3_PRODUCT_VISUAL_PRETTIER_START");
    console.error(formatted);
    console.error("C3_PRODUCT_VISUAL_PRETTIER_END");
  }
  assert.equal(source, formatted, "apply canonical form, then remove this diagnostic");
});
