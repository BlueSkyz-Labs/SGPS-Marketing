import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const lockfile = readFileSync("pnpm-lock.yaml", "utf8");
const deployScript = readFileSync("scripts/deploy-workers.mjs", "utf8");

test("Workers deployment uses a project-local locked Wrangler", () => {
  assert.equal(pkg.devDependencies?.wrangler, "4.127.1");
  assert.match(
    lockfile,
    /wrangler:\n\s+specifier: 4\.127\.1\n\s+version: 4\.127\.1/,
  );
  assert.match(deployScript, /run\("pnpm", \["wrangler", "deploy"\]\)/);
  assert.doesNotMatch(deployScript, /run\("npx"|wrangler@latest|pnpm.*dlx/);
});
