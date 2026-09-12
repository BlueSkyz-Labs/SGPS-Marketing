import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import test from "node:test";
import * as prettier from "prettier";

const file = "docs/evidence/2026-09-12-principal-plan-premerge-reconciliation.md";

test("DEBUG print reconciliation Prettier diff", async () => {
  const source = readFileSync(file, "utf8");
  const formatted = await prettier.format(source, { filepath: file });
  writeFileSync("/tmp/reconciliation-formatted.md", formatted);
  let diff = "";
  try {
    execFileSync("diff", ["-u", file, "/tmp/reconciliation-formatted.md"], {
      encoding: "utf8",
    });
  } catch (error) {
    diff = `${error.stdout ?? ""}`;
  }
  console.log("PRETTIER_DIFF_START\n" + diff + "PRETTIER_DIFF_END");
  assert.fail("temporary formatter-debug test; delete after applying diff");
});
