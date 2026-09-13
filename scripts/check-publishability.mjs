/**
 * v3 G9 — publishability compiler CLI (Task 19).
 * Deterministic; performs no network calls and never mutates content.
 * Exit 0 = publishable, exit 1 = fail-closed (one line per failure).
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  checkPublishability,
  formatPublishabilityFailures,
} from "../src/lib/publishability.ts";

const ROOT = process.cwd();
const CONTENT_DIR = join(ROOT, "src", "content", "products");

/** Minimal reader mirroring the product storage contract (no selector logic). */
function readPublicProducts() {
  if (!existsSync(CONTENT_DIR)) return [];
  const products = [];
  for (const file of readdirSync(CONTENT_DIR)) {
    if (!file.endsWith(".json")) continue;
    const raw = readFileSync(join(CONTENT_DIR, file), "utf8");
    const data = JSON.parse(raw);
    products.push({
      slug: data.slug ?? file.replace(/\.json$/, ""),
      name: data.name ?? "",
    });
  }
  return products;
}

const failures = checkPublishability(readPublicProducts());

if (failures.length > 0) {
  for (const line of formatPublishabilityFailures(failures)) {
    console.error(line);
  }
  console.error(`Publishability: FAIL (${failures.length} issue(s))`);
  process.exit(1);
}

console.log(
  "Publishability: PASS (public truth, evidence, locale parity, product, claim integrity)",
);
