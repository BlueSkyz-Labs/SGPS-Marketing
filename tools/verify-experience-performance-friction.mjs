#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const mode = process.argv[2] || "source";
if (!["source", "go-live"].includes(mode)) {
  console.error(
    "usage: node tools/verify-experience-performance-friction.mjs source|go-live",
  );
  process.exit(2);
}
const p = path.resolve(".sgps/experience-performance-friction.json");
if (!fs.existsSync(p)) {
  console.error(
    "DEC028_FAIL missing .sgps/experience-performance-friction.json",
  );
  process.exit(1);
}
let c;
try {
  c = JSON.parse(fs.readFileSync(p, "utf8"));
} catch (e) {
  console.error("DEC028_FAIL invalid JSON", e.message);
  process.exit(1);
}

const errors = [];
if (c.schema_version !== 1) errors.push("schema_version must be 1");
if (c.decision !== "SGPS-DEC-2026-028") errors.push("decision mismatch");
if (c.applicability !== "MANDATORY")
  errors.push("applicability must be MANDATORY for this project");
if (!Array.isArray(c.critical_journeys) || c.critical_journeys.length === 0)
  errors.push("critical_journeys required");
if (!c.gate || c.gate.fail_closed !== true)
  errors.push("gate.fail_closed must be true");
if (!c.gate || c.gate.exact_revision_required !== true)
  errors.push("exact revision required");
if (!c.negative_proof || c.negative_proof.required !== true)
  errors.push("negative proof must be required");
if (!c.positive_proof || c.positive_proof.required !== true)
  errors.push("positive proof must be required");
if (!c.canonical || c.canonical.candidate_pr !== 257)
  errors.push("canonical candidate PR must be 257");
if (errors.length) {
  console.error("DEC028_SOURCE_FAIL");
  for (const e of errors) console.error("-", e);
  process.exit(1);
}

if (mode === "source") {
  console.log("DEC028_SOURCE_PASS");
  process.exit(0);
}
const sha = c.canonical.merged_sha || "";
const go = [];
if (!/^[0-9a-f]{40}$/.test(sha)) go.push("canonical merged_sha not bound");
if (c.evidence?.status !== "PASS") go.push("exact-head evidence is not PASS");
if (c.negative_proof?.status !== "PASS") go.push("negative proof is not PASS");
if (c.positive_proof?.status !== "PASS") go.push("positive proof is not PASS");
if (c.go_live?.state !== "READY") go.push("go_live.state is not READY");
if (go.length) {
  console.error("DEC028_GO_LIVE_BLOCKED");
  for (const e of go) console.error("-", e);
  process.exit(1);
}
console.log("DEC028_GO_LIVE_PASS");
