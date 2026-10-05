/**
 * SGPS-DEC-2026-017 Security-by-Default: the local invariant map stays complete
 * and honest. Every SBD-INV-01..16 appears exactly once, with a bounded
 * disposition, and every cited evidence path exists. WAIVED is never allowed
 * (SBD-INV-16: no project-local waiver may weaken an invariant).
 */
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";

const MAP = "docs/sgps/adoption/SGPS_DEC_2026_017_SECURITY_BY_DEFAULT.md";
const DISPOSITIONS = new Set(["ENFORCED", "NOT_APPLICABLE", "OWNER_GATED"]);

export function parseSbdRows(markdown) {
  const rows = [];
  for (const line of markdown.split("\n")) {
    const m = line.match(
      /^\|\s*`(SBD-INV-\d{2})`\s*\|([^|]*)\|([^|]*)\|([^|]*)\|/,
    );
    if (!m) continue;
    rows.push({
      id: m[1],
      disposition: m[2].trim(),
      control: m[3].trim(),
      evidence: [...m[4].matchAll(/`([^`]+)`/g)].map((x) => x[1]),
    });
  }
  return rows;
}

export function sbdMapProblems(markdown, exists = existsSync) {
  const problems = [];
  const rows = parseSbdRows(markdown);
  const expected = Array.from(
    { length: 16 },
    (_, i) => `SBD-INV-${String(i + 1).padStart(2, "0")}`,
  );
  for (const id of expected) {
    const n = rows.filter((r) => r.id === id).length;
    if (n !== 1) problems.push(`${id} appears ${n} times (expected 1)`);
  }
  for (const r of rows) {
    if (!expected.includes(r.id))
      problems.push(`${r.id} is not a doctrine invariant`);
    if (!DISPOSITIONS.has(r.disposition))
      problems.push(`${r.id} has disposition "${r.disposition}"`);
    if (r.control.length < 40)
      problems.push(`${r.id} control is not described`);
    if (r.evidence.length === 0)
      problems.push(`${r.id} cites no evidence path`);
    for (const p of r.evidence)
      if (!exists(p)) problems.push(`${r.id} cites missing path ${p}`);
  }
  if (/\|\s*WAIVED\s*\|/i.test(markdown))
    problems.push("a WAIVED disposition is present (SBD-INV-16)");
  return problems;
}

test("DEC-017 map covers SBD-INV-01..16 with bounded dispositions and real evidence", () => {
  assert.ok(existsSync(MAP), `${MAP} must exist`);
  assert.deepEqual(sbdMapProblems(readFileSync(MAP, "utf8")), []);
});

test("negative proof: a missing, waived or unevidenced invariant is rejected", () => {
  const good = readFileSync(MAP, "utf8");
  const dropped = good.replace(/^\|\s*`SBD-INV-07`.*\n/m, "");
  assert.ok(
    sbdMapProblems(dropped).some((p) => p.includes("SBD-INV-07 appears 0")),
  );

  const waived = good.replace(
    /^(\|\s*`SBD-INV-16`\s*\|)\s*ENFORCED\s*\|/m,
    "$1 WAIVED |",
  );
  assert.ok(sbdMapProblems(waived).some((p) => p.includes("WAIVED")));

  const ghost = good.replace(
    "`wrangler.toml`",
    "`wrangler.does-not-exist.toml`",
  );
  assert.ok(sbdMapProblems(ghost).some((p) => p.includes("missing path")));
});
