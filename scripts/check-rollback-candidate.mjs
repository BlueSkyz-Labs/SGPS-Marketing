#!/usr/bin/env node
/**
 * Rollback security-floor guard.
 *
 * Recovery is not allowed to resurrect a revision that predates a security or
 * financial-authority revocation. The provider rollback target must first be
 * mapped to an exact Git commit and qualified offline in the repository.
 *
 * This guard proves a bounded source property only:
 *   - candidate is an exact 40-character commit;
 *   - candidate is on the current main lineage;
 *   - candidate is at/after every active security floor;
 *   - candidate's textual public runtime tree (src/ + public/) contains no Marketing payment-authority
 *     markers (VietQR / NAPAS / EMVCo / known payload identifiers);
 *   - the no-payment-authority regression guard exists at the candidate.
 *
 * It does NOT prove the provider version actually maps to that SHA, that the
 * deployment succeeded, or that the rolled-back runtime is healthy. Exact
 * served-SHA smoke/read-back remains a separate post-rollback requirement.
 *
 * Usage:
 *   node scripts/check-rollback-candidate.mjs --candidate <40-hex>
 *   node scripts/check-rollback-candidate.mjs --candidate <40-hex> --main <ref>
 */
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

export const SECURITY_FLOORS = [
  {
    id: "D0_NO_MARKETING_PAYMENT_AUTHORITY",
    revision: "3342d912bf03217979d9325aeff3fe2043b62758",
    rationale:
      "Owner D-0 / PR #302 removed Marketing VietQR payment authority and added the no-payment-authority guard.",
  },
];

const PAYMENT_MARKERS = [
  /A000000727/i,
  /QRIBFTT[AC]/,
  /\bvietqr\b/i,
  /\bnapas\b/i,
  /\bemvco\b/i,
];

const PUBLIC_SOURCE_EXTENSION = /\.(?:astro|ts|tsx|js|mjs|cjs|html|css|svg|xml|txt|yaml|yml|json|webmanifest)$/i;
const PUBLIC_SOURCE_SPECIAL_FILES = new Set(["public/_headers", "public/_redirects"]);
export const PAYMENT_RUNTIME_ROOTS = ["src", "public"];
const REQUIRED_GUARD = "tests/architecture/no-payment-authority.test.mjs";

function git(args, options = {}) {
  return execFileSync("git", args, {
    cwd: options.cwd ?? process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).trim();
}

function gitOk(args, cwd = process.cwd()) {
  try {
    execFileSync("git", args, {
      cwd,
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

export function paymentMarkersIn(text) {
  return PAYMENT_MARKERS.filter((pattern) => pattern.test(text)).map(String);
}

function resolveDefaultMain(cwd) {
  for (const ref of ["origin/main", "main"]) {
    if (gitOk(["rev-parse", "--verify", "--quiet", ref], cwd)) return ref;
  }
  return null;
}

function candidateFiles(candidate, cwd) {
  const output = git(
    ["ls-tree", "-r", "--name-only", candidate, "--", ...PAYMENT_RUNTIME_ROOTS],
    { cwd },
  );
  return output
    .split("\n")
    .filter(Boolean)
    .filter(
      (path) =>
        PUBLIC_SOURCE_EXTENSION.test(path) ||
        PUBLIC_SOURCE_SPECIAL_FILES.has(path),
    );
}

function fileAt(candidate, path, cwd) {
  return git(["show", `${candidate}:${path}`], { cwd });
}

export function qualifyRollbackCandidate({
  candidate,
  mainRef,
  cwd = process.cwd(),
}) {
  const failures = [];

  if (!/^[0-9a-f]{40}$/.test(candidate ?? "")) {
    failures.push({
      id: "EXACT_SHA_REQUIRED",
      detail: "rollback candidate must be an exact 40-character Git SHA",
    });
    return { eligible: false, failures, candidate: candidate ?? null, mainRef };
  }

  if (!gitOk(["cat-file", "-e", `${candidate}^{commit}`], cwd)) {
    failures.push({
      id: "CANDIDATE_NOT_FOUND",
      detail: `candidate ${candidate} does not resolve to a commit`,
    });
    return { eligible: false, failures, candidate, mainRef };
  }

  const resolvedMain = mainRef ?? resolveDefaultMain(cwd);
  if (!resolvedMain) {
    failures.push({
      id: "MAIN_REF_NOT_FOUND",
      detail: "cannot resolve origin/main or main for rollback qualification",
    });
    return { eligible: false, failures, candidate, mainRef: null };
  }

  if (!gitOk(["merge-base", "--is-ancestor", candidate, resolvedMain], cwd)) {
    failures.push({
      id: "NOT_ON_CURRENT_MAIN_LINEAGE",
      detail: `candidate ${candidate} is not an ancestor of ${resolvedMain}`,
    });
  }

  for (const floor of SECURITY_FLOORS) {
    if (!gitOk(["cat-file", "-e", `${floor.revision}^{commit}`], cwd)) {
      failures.push({
        id: "SECURITY_FLOOR_NOT_FOUND",
        detail: `security floor ${floor.id} (${floor.revision}) is unavailable`,
      });
      continue;
    }
    if (!gitOk(["merge-base", "--is-ancestor", floor.revision, candidate], cwd)) {
      failures.push({
        id: "PREDATES_SECURITY_FLOOR",
        detail: `candidate predates ${floor.id} at ${floor.revision}: ${floor.rationale}`,
      });
    }
  }

  if (
    !gitOk(
      ["cat-file", "-e", `${candidate}:${REQUIRED_GUARD}`],
      cwd,
    )
  ) {
    failures.push({
      id: "PAYMENT_GUARD_MISSING",
      detail: `candidate does not contain ${REQUIRED_GUARD}`,
    });
  }

  let files = [];
  try {
    files = candidateFiles(candidate, cwd);
  } catch {
    failures.push({
      id: "SOURCE_TREE_UNREADABLE",
      detail: "candidate src/ tree cannot be inspected",
    });
  }

  for (const path of files) {
    let source;
    try {
      source = fileAt(candidate, path, cwd);
    } catch {
      failures.push({
        id: "SOURCE_FILE_UNREADABLE",
        detail: `cannot inspect ${path} at candidate`,
      });
      continue;
    }
    const hits = paymentMarkersIn(source);
    if (hits.length > 0) {
      failures.push({
        id: "PAYMENT_AUTHORITY_MARKER",
        detail: `${path} contains forbidden payment-authority marker(s): ${hits.join(", ")}`,
      });
    }
  }

  return {
    eligible: failures.length === 0,
    failures,
    candidate,
    mainRef: resolvedMain,
  };
}

function parseArgs(argv) {
  const parsed = { candidate: null, mainRef: null };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--candidate") {
      parsed.candidate = argv[index + 1] ?? null;
      index += 1;
    } else if (arg === "--main") {
      parsed.mainRef = argv[index + 1] ?? null;
      index += 1;
    } else {
      throw new Error(`unknown argument ${arg}`);
    }
  }
  return parsed;
}

export function main(argv = process.argv.slice(2)) {
  let parsed;
  try {
    parsed = parseArgs(argv);
  } catch (error) {
    console.error(`Rollback candidate: INELIGIBLE — ${error.message}`);
    process.exitCode = 1;
    return 1;
  }

  const result = qualifyRollbackCandidate({
    candidate: parsed.candidate,
    mainRef: parsed.mainRef,
  });

  for (const failure of result.failures) {
    console.error(`FAIL ${failure.id} — ${failure.detail}`);
  }

  if (!result.eligible) {
    console.error(
      `Rollback candidate: INELIGIBLE (${result.failures.length} violation(s))`,
    );
    process.exitCode = 1;
    return 1;
  }

  console.log(
    `Rollback candidate: ELIGIBLE (${result.candidate}; source security-floor/payment checks only; provider mapping and runtime NOT_VERIFIED)`,
  );
  process.exitCode = 0;
  return 0;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  main();
}
