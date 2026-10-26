import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import test from "node:test";

const CREDENTIAL_VALUE =
  /\b(ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|sk_live_[A-Za-z0-9]+|sk_test_[A-Za-z0-9]+)\b/;
const SECRET_ASSIGNMENT =
  /^\s*(?:api_token|api_key|secret_access_key|CLOUDFLARE_API_TOKEN|CLOUDFLARE_API_KEY|CLOUDFLARE_AUTH_TOKEN)\s*=/im;
const SECRET_KEY = /TOKEN|SECRET|PASSWORD|PRIVATE_KEY|API_KEY/i;

function assignedKeys(source) {
  return [...source.matchAll(/^\s*([A-Z][A-Z0-9_]*)\s*=/gm)].map(
    (match) => match[1],
  );
}

test("SECURITY.md routes reports through GitHub private vulnerability reporting", () => {
  const policy = readFileSync("SECURITY.md", "utf8");

  assert.match(policy, /Report a vulnerability/i);
  assert.match(
    policy,
    /github\.com\/BlueSkyz-Labs\/blueskyz-web\/security\/advisories\/new/,
  );
  assert.match(policy, /privately-reporting-a-security-vulnerability/);
  assert.match(policy, /Do not (open|file) a public/i);
  assert.doesNotMatch(policy, /mailto:/);
});

test("CODEOWNERS records a default in-repo owner without inventing a team", () => {
  const owners = readFileSync(".github/CODEOWNERS", "utf8");

  assert.match(
    owners,
    /^\*\s+@[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?(?:\/[A-Za-z0-9._-]+)?\s*$/m,
  );
});

test("committed Wrangler config does not embed Cloudflare or API secrets", () => {
  const wrangler = readFileSync("wrangler.toml", "utf8");
  const varsBlock = wrangler.split("[vars]")[1] ?? "";

  assert.doesNotMatch(wrangler, SECRET_ASSIGNMENT);
  assert.doesNotMatch(wrangler, CREDENTIAL_VALUE);

  for (const key of assignedKeys(varsBlock)) {
    assert.doesNotMatch(
      key,
      SECRET_KEY,
      `${key} looks like a secret and must not live in wrangler.toml [vars]`,
    );
  }
});

test(".env.example stays a public template and does not contain credentials", () => {
  const sample = readFileSync(".env.example", "utf8");

  assert.doesNotMatch(sample, CREDENTIAL_VALUE);
  assert.doesNotMatch(sample, SECRET_ASSIGNMENT);

  for (const key of assignedKeys(sample)) {
    assert.doesNotMatch(
      key,
      SECRET_KEY,
      `${key} looks like a secret and must not be assigned in .env.example`,
    );
  }
});

test("package metadata does not invent a public corporate email", () => {
  const pkg = JSON.parse(readFileSync("package.json", "utf8"));
  assert.doesNotMatch(String(pkg.author ?? ""), /@/);
  assert.doesNotMatch(JSON.stringify(pkg), /hello@blueskyz\.io/i);
});

test("legacy Next static server residual is removed", () => {
  assert.equal(
    existsSync("scripts/serve-static.mjs"),
    false,
    "serve-static.mjs targeted Next out/ and must stay deleted",
  );
});
