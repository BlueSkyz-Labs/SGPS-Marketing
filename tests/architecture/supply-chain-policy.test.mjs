import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const readIfPresent = (path) => (existsSync(path) ? readFileSync(path, "utf8") : "");

test("pnpm supply-chain policy is explicit and fail closed", () => {
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  const workspace = readIfPresent("pnpm-workspace.yaml");
  const npmrc = readIfPresent(".npmrc");

  assert.equal(pkg.packageManager, "pnpm@11.25.0");
  assert.equal(pkg.engines?.pnpm, ">=11.25.0 <12");

  assert.match(workspace, /minimumReleaseAge:\s*1440/);
  assert.match(workspace, /minimumReleaseAgeStrict:\s*true/);
  assert.match(workspace, /minimumReleaseAgeIgnoreMissingTime:\s*false/);
  assert.match(workspace, /blockExoticSubdeps:\s*true/);
  assert.match(workspace, /strictDepBuilds:\s*true/);
  assert.match(workspace, /allowBuilds:\s*(?:\{\}|\n)/);
  assert.doesNotMatch(workspace, /dangerouslyAllowAllBuilds/);

  assert.doesNotMatch(
    npmrc,
    /minimum-release-age|minimumReleaseAge|dangerouslyAllowAllBuilds|ignore-scripts|ignoreScripts/,
  );
});
