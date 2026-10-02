/**
 * `pnpm test:e2e` entry-guard parity.
 *
 * scripts/run-e2e.mjs only executes its main entry when the guard recognizes
 * "this file was run directly". The guard must use the canonical Node form
 * (`pathToFileURL(process.argv[1]).href`) — a hand-built `file://${argv[1]}`
 * string never matches on Windows (drive-letter/backslash paths), and the
 * runner then exits 0 having run nothing (observed: a silent no-op that read
 * as a green local gate).
 *
 * This test executes the real file: with an invalid E2E_PROJECT the guard must
 * fire, project validation must run, and the process must exit 2. Before the
 * fix this fails on Windows (exit 0, no validation) and passes on POSIX.
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

test("run directly, the e2e runner validates E2E_PROJECT and exits 2 on a bad value", () => {
  const result = spawnSync(process.execPath, ["scripts/run-e2e.mjs"], {
    env: { ...process.env, E2E_PROJECT: "__not_a_project__" },
    encoding: "utf8",
  });
  assert.equal(
    result.status,
    2,
    `expected exit 2, got ${result.status}\nstdout: ${result.stdout}\nstderr: ${result.stderr}\nerror: ${result.error ?? "none"}`,
  );
  assert.match(result.stderr, /E2E_PROJECT/);
});
