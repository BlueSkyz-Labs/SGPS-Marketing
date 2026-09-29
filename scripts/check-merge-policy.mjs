#!/usr/bin/env node
/**
 * Merge policy guard (runs inside the required `Quality Gates` job).
 *
 * Auto-merge lands a pull request as soon as its required checks pass. A pull
 * request that changes a governance, supply-chain, deployment or gate root
 * must additionally carry the `owner-approved` label, which only the Owner
 * applies. Everything else stays fully automatic.
 *
 * CI runs this file as it exists on the pull request's BASE commit, so a pull
 * request cannot relax the rule for itself.
 *
 * Usage:
 *   PR_LABELS='["owner-approved"]' node scripts/check-merge-policy.mjs \
 *     --base <sha> --head <sha>
 *
 * Offline and deterministic: only `git` is invoked.
 */
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

export const APPROVAL_LABEL = "owner-approved";

// Directory prefixes end with "/"; everything else is an exact path.
export const PROTECTED_PATHS = [
  ".github/",
  ".githooks/",
  "scripts/",
  "brand/",
  "docs/decisions/",
  "AGENTS.md",
  "SECURITY.md",
  "package.json",
  "pnpm-lock.yaml",
  "pnpm-workspace.yaml",
  ".node-version",
  "wrangler.toml",
  "public/_headers",
  "public/_redirects",
  "eslint.config.mjs",
  "playwright.config.ts",
  "lighthouserc.json",
];

export function isProtected(path) {
  return PROTECTED_PATHS.some((rule) =>
    rule.endsWith("/") ? path.startsWith(rule) : path === rule,
  );
}

export function evaluateMergePolicy({ changedFiles, labels }) {
  const protectedFiles = changedFiles.filter(isProtected).sort();
  const approved = labels.includes(APPROVAL_LABEL);
  return {
    ok: protectedFiles.length === 0 || approved,
    approved,
    protectedFiles,
  };
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 2) {
    const key = argv[i];
    const value = argv[i + 1];
    if (!["--base", "--head"].includes(key) || !/^[0-9a-f]{40}$/.test(value)) {
      throw new Error(`invalid argument ${key} ${value ?? ""}`.trim());
    }
    args[key.slice(2)] = value;
  }
  if (!args.base || !args.head) throw new Error("--base and --head required");
  return args;
}

function changedFilesBetween(base, head) {
  // Includes renames/deletions (both sides) so moving a protected file out
  // of a protected path is still a protected change.
  const out = execFileSync(
    "git",
    ["diff", "--name-only", "--no-renames", "-z", `${base}...${head}`],
    { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );
  return out.split("\0").filter(Boolean);
}

function main() {
  const { base, head } = parseArgs(process.argv.slice(2));
  let labels;
  try {
    labels = JSON.parse(process.env.PR_LABELS ?? "");
  } catch {
    labels = null;
  }
  if (!Array.isArray(labels) || !labels.every((l) => typeof l === "string")) {
    console.error("FAIL: PR_LABELS must be a JSON array of label names.");
    process.exit(1);
  }
  const result = evaluateMergePolicy({
    changedFiles: changedFilesBetween(base, head),
    labels,
  });
  if (result.protectedFiles.length === 0) {
    console.log("PASS: no protected path changed.");
    return;
  }
  const list = result.protectedFiles.map((p) => `  - ${p}`).join("\n");
  if (result.ok) {
    console.log(
      `PASS: protected paths changed, "${APPROVAL_LABEL}" present:\n${list}`,
    );
    return;
  }
  console.error(
    `FAIL: protected paths changed without the "${APPROVAL_LABEL}" label:\n${list}\n` +
      `The Owner adds "${APPROVAL_LABEL}" after review; agents never apply it.`,
  );
  process.exit(1);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main();
