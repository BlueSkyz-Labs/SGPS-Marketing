#!/usr/bin/env node
/**
 * T3 — product provenance guard (fail-closed).
 *
 * A published product record must be able to name where its facts come from. This guard exists
 * because a candidate shipped `repositoryUrl` values pointing at repositories that do not exist,
 * one `sourceRevision` repeated across five products that was in fact a commit of THIS repository,
 * and composed brand banners labelled as product screenshots. The previous contract
 * ("sourceRevision must be reachable from this repository") accepted all three: the misattributed
 * revision really was reachable here, so the guard proved only that the site cites itself.
 *
 * Contract per record under src/content/products:
 *   1. `slug` is present and equal to the file stem.
 *   2. `proof.repositoryUrl` is exactly https://github.com/BlueSkyz-Labs/<repo> for the slug's
 *      allow-listed repository — an unknown product, an unknown slug or a foreign organisation
 *      fails closed.
 *   3. `sourceRevision` is a 40-hex revision and is NOT a commit of this repository: attributing
 *      this repository's own revision to a product is the defect, not evidence.
 *   4. `proof.media` is declared, so identity/brand art is never claimed as a product screenshot.
 *
 * Offline by design. A foreign revision cannot be proven to exist from here, so the guard refuses
 * the cases it can decide (unknown repository, this repository's own revision, unlabelled media)
 * and reports IDLE for an empty registry instead of passing by accident.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { basename, extname, join } from "node:path";

const args = process.argv.slice(2);
const rootIndex = args.indexOf("--root");
const ROOT = rootIndex > -1 ? args[rootIndex + 1] : process.cwd();
const repoIndex = args.indexOf("--repo");
/** Repository used to detect a revision that belongs here; defaults to the scanned root. */
const REPO = repoIndex > -1 ? args[repoIndex + 1] : ROOT;
const PRODUCTS_DIR = join(ROOT, "src/content/products");
const ORG = "https://github.com/BlueSkyz-Labs";

/** The only repositories a product record may cite, keyed by product slug. */
const PRODUCT_REPOSITORIES = {
  apexagent: "ApexAgent",
  fluentarc: "FluentArc",
  sotam: "sotam",
  sotro: "Sotro",
  vungtaylai: "VungTayLai",
};

function walk(dir) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) out.push(...walk(path));
    else if (/\.(ya?ml|json)$/i.test(entry)) out.push(path);
  }
  return out;
}

function field(source, name) {
  const match = new RegExp(
    `^\\s*${name}:\\s*["']?([^"'\\n#]+?)["']?\\s*$`,
    "m",
  ).exec(source);
  return match ? match[1].trim() : null;
}

function hasKey(source, name) {
  return new RegExp(`^\\s*${name}:\\s*$`, "m").test(source);
}

/** True when the revision resolves to an object in the repository being guarded. */
function revisionBelongsToThisRepository(revision) {
  try {
    execFileSync("git", ["cat-file", "-e", revision], {
      cwd: REPO,
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}

const files = walk(PRODUCTS_DIR);
const failures = [];
let verified = 0;

for (const file of files) {
  const source = readFileSync(file, "utf8");
  const relative = file.slice(ROOT.length + 1).replace(/\\/g, "/");
  const problems = [];

  const slug = field(source, "slug");
  if (!slug) {
    problems.push("no slug");
  } else if (slug !== basename(file, extname(file))) {
    problems.push(`slug ${slug} does not match the file name`);
  }

  const repositoryUrl = field(source, "repositoryUrl");
  const expectedRepository = slug ? PRODUCT_REPOSITORIES[slug] : undefined;
  if (!repositoryUrl) {
    problems.push("no proof.repositoryUrl");
  } else if (!expectedRepository) {
    problems.push(
      `repositoryUrl ${repositoryUrl} cites a product that is not allow-listed (known: ${Object.keys(
        PRODUCT_REPOSITORIES,
      ).join(", ")})`,
    );
  } else if (repositoryUrl !== `${ORG}/${expectedRepository}`) {
    problems.push(
      `repositoryUrl ${repositoryUrl} is not ${ORG}/${expectedRepository}`,
    );
  }

  const revision = field(source, "sourceRevision");
  if (!revision) {
    problems.push(
      "no sourceRevision (fix: cite the product commit that evidences it)",
    );
  } else if (!/^[0-9a-f]{40}$/.test(revision)) {
    problems.push(`sourceRevision ${revision} is not a 40-hex revision`);
  } else if (revisionBelongsToThisRepository(revision)) {
    problems.push(
      `sourceRevision ${revision} is a commit of THIS repository — it must cite the product source, not this site`,
    );
  }

  if (hasKey(source, "screenshot") && !hasKey(source, "media")) {
    problems.push(
      "proof declares a bare screenshot claim; brand or identity art must be declared as proof.media",
    );
  }

  if (problems.length > 0) {
    for (const problem of problems)
      failures.push(`FAIL ${relative} — ${problem}`);
    continue;
  }
  verified += 1;
}

if (failures.length > 0) {
  for (const line of failures) console.error(line);
  console.error(
    `Product provenance: FAIL (${failures.length} of ${files.length} entries)`,
  );
  process.exit(1);
}

if (files.length === 0) {
  console.log(
    "Product provenance: IDLE (0 published products — the guard activates on the first listing)",
  );
  process.exit(0);
}

console.log(`Product provenance: PASS (${verified} entries)`);
