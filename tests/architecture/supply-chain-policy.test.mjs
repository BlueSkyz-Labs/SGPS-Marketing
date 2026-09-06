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

test("GitHub source assurance is immutable, least privilege, and secretless", () => {
  const workflow = readIfPresent(".github/workflows/quality-gates.yml");

  assert.match(workflow, /^name:\s*Source Assurance/m);
  assert.match(workflow, /permissions:\s*\n\s+contents:\s*read/);
  assert.match(workflow, /name:\s*Quality Gates/);
  assert.match(workflow, /name:\s*Browser Assurance/);

  const actionRefs = [...workflow.matchAll(/uses:\s*[^@\s]+@([^\s#]+)/g)].map(
    ([, ref]) => ref,
  );
  assert.ok(actionRefs.length >= 2, "expected pinned checkout/setup-node actions");
  for (const ref of actionRefs) {
    assert.match(ref, /^[0-9a-f]{40}$/, `action ref must be a full SHA: ${ref}`);
  }

  assert.doesNotMatch(workflow, /secrets\./);
  assert.doesNotMatch(workflow, /CLOUDFLARE|wrangler|deploy:workers/);
  assert.doesNotMatch(workflow, /permissions:\s*write-all|contents:\s*write/);
});
