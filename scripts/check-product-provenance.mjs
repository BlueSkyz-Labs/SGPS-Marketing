#!/usr/bin/env node
/**
 * T3 — product provenance guard (fail-closed).
 * A published product must cite a `sourceRevision` that resolves to a real
 * commit reachable from the checked-out candidate. An empty registry is idle,
 * not a pass by accident: the guard reports the idle state explicitly.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { verifyAncestry, verifyRevision } from "./verify-git-evidence.mjs";

const args = process.argv.slice(2);
const rootIndex = args.indexOf("--root");
const ROOT = rootIndex > -1 ? args[rootIndex + 1] : process.cwd();
const repoIndex = args.indexOf("--repo");
/** Repository used for Git lookups; defaults to the scanned root. */
const REPO = repoIndex > -1 ? args[repoIndex + 1] : ROOT;
const PRODUCTS_DIR = join(ROOT, "src/content/products");

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

function declaredRevision(file) {
  const source = readFileSync(file, "utf8");
  const match = /^\s*sourceRevision:\s*["']?([0-9a-zA-Z._/-]+)["']?\s*$/m.exec(
    source,
  );
  return match ? match[1] : null;
}

const files = walk(PRODUCTS_DIR);
const failures = [];
let verified = 0;

for (const file of files) {
  const revision = declaredRevision(file);
  if (!revision) {
    failures.push(
      `FAIL ${file} — no sourceRevision (fix: cite the commit that evidences this product)`,
    );
    continue;
  }
  const resolved = verifyRevision(revision, REPO);
  if (resolved.status !== "PASS") {
    failures.push(
      `FAIL ${file} — revision ${revision} ${resolved.status} (fix: ${resolved.hint})`,
    );
    continue;
  }
  const ancestry = verifyAncestry(revision, REPO);
  if (ancestry.status !== "PASS") {
    failures.push(
      `FAIL ${file} — revision ${revision} is not reachable from HEAD (fix: ${ancestry.hint})`,
    );
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
