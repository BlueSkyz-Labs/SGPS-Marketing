/**
 * T5 — deployment contract (fail-closed).
 * The one-shot deploy script must prove public truth *before* it builds and
 * publishes, must never swallow a failing gate, and GitHub Actions must stay
 * source-assurance only (Cloudflare Workers Builds own promotion).
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const DEPLOY = "scripts/deploy-workers.mjs";
const WORKFLOW_DIR = ".github/workflows";

const deploy = readFileSync(DEPLOY, "utf8");
const order = (needle) => deploy.indexOf(needle);

test("public-truth validation runs before build and deploy", () => {
  const publicTruth = order("validate:public-truth");
  const build = order('run("pnpm", ["build"])');
  const publish = order('"deploy"');
  assert.ok(publicTruth > -1, "deploy must run validate:public-truth");
  assert.ok(build > -1, "deploy must run the static build");
  assert.ok(publish > -1, "deploy must run wrangler deploy");
  assert.ok(
    publicTruth < build,
    "public-truth validation must come before the build",
  );
  assert.ok(build < publish, "the build must come before publish");
});

test("the deploy script fails closed on every gate", () => {
  assert.match(
    deploy,
    /if \(result\.status !== 0\) process\.exit\(/,
    "a failing step must abort the deploy",
  );
  assert.doesNotMatch(deploy, /\|\|\s*true/, "no swallowed failures");
  assert.doesNotMatch(deploy, /shell:\s*true/, "no shell:true invocations");
  assert.ok(
    /[/"]\.well-known[/"]|PUBLIC_SITE_URL/.test(deploy),
    "deploy must require an explicit public site URL or publish public truth",
  );
});

test("the deploy script requires an https public site URL", () => {
  assert.match(deploy, /\^https:\\\/\\\//, "PUBLIC_SITE_URL must be https");
  assert.match(deploy, /process\.exit\(1\)/, "missing URL must abort");
});

test("no credentials or tokens are hard-coded", () => {
  assert.doesNotMatch(
    deploy,
    /(api[_-]?token|secret|password)\s*[:=]\s*["'][^"']+["']/i,
    "no literal secret assignment",
  );
  assert.doesNotMatch(
    deploy,
    /\b[a-f0-9]{32,}\b/i,
    "no literal long hex token",
  );
});

test("GitHub Actions stays source-assurance only", () => {
  const files = readFileSync(`${WORKFLOW_DIR}/quality-gates.yml`, "utf8");
  assert.doesNotMatch(files, /wrangler\s+deploy/, "CI must not deploy");
  assert.doesNotMatch(files, /cloudflare\/wrangler-action/, "no deploy action");
  assert.match(files, /persist-credentials: false/, "no persisted credentials");
  assert.match(files, /fetch-depth: 0/, "full history for provenance checks");
});
