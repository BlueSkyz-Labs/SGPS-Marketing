import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const lockfile = readFileSync("pnpm-lock.yaml", "utf8");
const workspace = readFileSync("pnpm-workspace.yaml", "utf8");
const deployScript = readFileSync("scripts/deploy-workers.mjs", "utf8");

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

test("Workers deployment uses a project-local exact-pinned Wrangler", () => {
  const wrangler = pkg.devDependencies?.wrangler;
  assert.equal(typeof wrangler, "string");
  assert.match(
    wrangler,
    /^\d+\.\d+\.\d+$/,
    "Wrangler must be an exact project dependency, not a range or moving tag",
  );

  const pinned = escapeRegExp(wrangler);
  assert.match(
    lockfile,
    new RegExp(
      "wrangler:\\r?\\n\\s+specifier: " +
        pinned +
        "\\r?\\n\\s+version: " +
        pinned +
        "(?:\\(|\\r?$)",
      "m",
    ),
    "pnpm-lock.yaml must bind the exact package.json Wrangler version",
  );

  assert.match(deployScript, /run\("pnpm", \["wrangler", "deploy"\]\)/);
  assert.doesNotMatch(deployScript, /run\("npx"|wrangler@latest|pnpm.*dlx/);
});

test("Wrangler runtime lifecycle scripts are explicitly allowlisted", () => {
  assert.match(
    workspace,
    /allowBuilds:\r?\n\s+esbuild: true\r?\n\s+workerd: true/,
  );
  assert.doesNotMatch(workspace, /dangerouslyAllowAllBuilds/);
});
