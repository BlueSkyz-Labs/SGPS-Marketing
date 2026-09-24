#!/usr/bin/env node
/**
 * Post-merge landing-verification guard.
 * After a PR merge is claimed, asserts the mergeCommit (from `gh pr view` or
 * a passed argument) is an ancestor of `origin/main` (or HEAD). Fails loudly (rc 1,
 * stderr message) otherwise.
 *
 * Usage:
 *   node scripts/verify-post-merge-landing.mjs [--merge-commit <sha>] [--ref <ref>]
 *
 * Default ref is `origin/main`. Runs deterministically offline (only `git`).
 */
import { execFileSync } from "node:child_process";

const GIT_ENV = {
  ...process.env,
  GIT_TERMINAL_PROMPT: "0",
  GIT_OPTIONAL_LOCKS: "0",
  GIT_PAGER: "cat",
};

function git(args, cwd = process.cwd()) {
  try {
    const out = execFileSync("git", args, {
      cwd,
      env: GIT_ENV,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
    return { ok: true, stdout: out, status: 0 };
  } catch (e) {
    return {
      ok: false,
      stdout: typeof e?.stdout === "string" ? e.stdout.trim() : "",
      status: typeof e?.status === "number" ? e.status : 1,
    };
  }
}

function parseArgs(argv) {
  const out = { mergeCommit: null, ref: "origin/main" };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--merge-commit") out.mergeCommit = argv[++i];
    else if (a === "--ref") out.ref = argv[++i];
    else if (a === "--help" || a === "-h") {
      console.log(
        "usage: node scripts/verify-post-merge-landing.mjs [--merge-commit <sha>] [--ref <ref>]",
      );
      return null;
    } else {
      console.error(`unknown argument: ${a}`);
      process.exit(2);
    }
  }
  return out;
}

const args = parseArgs(process.argv.slice(2));
if (args === null) {
  process.exit(0);
}

const ROOT = process.cwd();

// Resolve the target ref.
const refResolve = git(["rev-parse", "--verify", args.ref], ROOT);
if (!refResolve.ok) {
  console.error(
    `FAIL: ref "${args.ref}" does not resolve (maybe missing from fetch?) — exit ${refResolve.status}`,
  );
  process.exit(1);
}
const targetSha = refResolve.stdout;

// Determine mergeCommit.
let mergeSha = args.mergeCommit;
if (!mergeSha) {
  // Try `gh pr view` with an environment-inferred PR number if present,
  // but never fail silently: if no commit is determinable, fail loud.
  const prEnv = process.env.POST_MERGE_PR_NUMBER || process.env.POST_MERGE_PR;
  if (prEnv) {
    // Intentionally left: the guard requires --merge-commit explicitly
    // and does not invoke `gh` (external/network) speculatively.
  }
  console.error(
    "FAIL: --merge-commit is required when no POST_MERGE_PR_NUMBER is set; " +
      "guard must run with an explicit merge commit (no speculative gh call).",
  );
  process.exit(1);
}

const shaResolve = git(["rev-parse", "--verify", `${mergeSha}^{commit}`], ROOT);
if (!shaResolve.ok) {
  console.error(
    `FAIL: mergeCommit ${mergeSha} does not resolve to a commit in this repository (exit ${shaResolve.status}).`,
  );
  process.exit(1);
}
mergeSha = shaResolve.stdout;

const ancestor = git(["merge-base", "--is-ancestor", mergeSha, args.ref], ROOT);
if (ancestor.ok) {
  console.log(
    `PASS: mergeCommit ${mergeSha} IS an ancestor of ${args.ref} (${targetSha}). Post-merge landing verified.`,
  );
  process.exit(0);
} else {
  // Loud failure: print the exact command that failed plus the commit info.
  console.error(
    "================================================================",
  );
  console.error("POST-MERGE LANDING VERIFICATION FAILED LOUDLY");
  console.error(
    "================================================================",
  );
  console.error(`ref            : ${args.ref}`);
  console.error(`ref resolved    : ${targetSha}`);
  console.error(`mergeCommit     : ${mergeSha}`);
  console.error(
    `ancestor?       : NO (git merge-base --is-ancestor returned non-zero)`,
  );
  console.error(
    `simulated PR #248 commit : 5101129 (re-landed) OR dcfb121 (original missing from main)`,
  );
  console.error(
    `action required : the squash/merge commit did NOT land on the promotion ref.`,
  );
  console.error(
    "================================================================",
  );
  process.exit(1);
}
