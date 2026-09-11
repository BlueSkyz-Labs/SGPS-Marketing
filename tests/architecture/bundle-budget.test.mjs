import assert from "node:assert/strict";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { brotliCompressSync } from "node:zlib";
import test from "node:test";
import {
  CLIENT_JS_HARD_BUDGET_BYTES,
  measureClientJsBudget,
} from "../../scripts/check-client-budget.mjs";

test("client budget sums Brotli bytes of local scripts referenced by dist/index.html", () => {
  const distDir = join(".tmp", "client-budget-fixture");
  rmSync(distDir, { recursive: true, force: true });
  mkdirSync(join(distDir, "assets"), { recursive: true });

  const jsBody = "console.log('budget-fixture');";
  writeFileSync(join(distDir, "assets", "tiny.js"), jsBody);
  writeFileSync(
    join(distDir, "index.html"),
    `<!doctype html><html><head><script src="/assets/tiny.js"></script></head><body></body></html>\n`,
  );

  const result = measureClientJsBudget(distDir);
  const expected = brotliCompressSync(Buffer.from(jsBody)).byteLength;

  assert.equal(result.totalBrotliBytes, expected);
  assert.equal(result.budgetBytes, CLIENT_JS_HARD_BUDGET_BYTES);
  assert.equal(result.withinBudget, true);
  assert.ok(result.totalBrotliBytes < 120_000);

  rmSync(distDir, { recursive: true, force: true });
});

test("client budget tracks the worst-case page across all routes", () => {
  const distDir = join(".tmp", "client-budget-multipage");
  rmSync(distDir, { recursive: true, force: true });
  mkdirSync(join(distDir, "assets"), { recursive: true });
  mkdirSync(join(distDir, "en"), { recursive: true });

  const smallJs = "console.log('small');";
  const bigJs = "console.log('big-page-script');".repeat(40);
  writeFileSync(join(distDir, "assets", "small.js"), smallJs);
  writeFileSync(join(distDir, "assets", "big.js"), bigJs);
  writeFileSync(
    join(distDir, "index.html"),
    `<!doctype html><html><head><script src="/assets/small.js"></script></head><body></body></html>\n`,
  );
  writeFileSync(
    join(distDir, "en", "index.html"),
    `<!doctype html><html><head><script src="/assets/big.js"></script></head><body></body></html>\n`,
  );

  const result = measureClientJsBudget(distDir);
  const smallBrotli = brotliCompressSync(Buffer.from(smallJs)).byteLength;
  const bigBrotli = brotliCompressSync(Buffer.from(bigJs)).byteLength;

  assert.equal(result.totalBrotliBytes, smallBrotli + bigBrotli);
  assert.equal(result.maxPageBrotliBytes, bigBrotli);
  assert.equal(result.maxPagePath.endsWith(join("en", "index.html")), true);
  assert.equal(result.withinBudget, true);

  rmSync(distDir, { recursive: true, force: true });
});

test("package exposes check:client-budget and retires Next build-log regression script", async () => {
  const { readFileSync, existsSync } = await import("node:fs");
  const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
  assert.match(
    packageJson.scripts["check:client-budget"],
    /check-client-budget/,
  );
  assert.equal(existsSync("scripts/check-bundle-regression.mjs"), false);
});
