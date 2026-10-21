#!/usr/bin/env node
/**
 * Cross-browser Playwright runner behind `pnpm test:e2e`.
 *
 * Default: the whole repository matrix (Chromium, Firefox, WebKit, mobile
 * Chromium), exactly as before. CI shards the same matrix across parallel jobs
 * and selects one project per job with E2E_PROJECT; the guard in
 * tests/architecture/browser-assurance-matrix.test.mjs keeps the workflow's
 * shard list identical to E2E_PROJECTS, so sharding can never narrow coverage.
 */
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";

export const E2E_PROJECTS = [
  "chromium",
  "firefox",
  "webkit",
  "mobile-chromium",
];

// CI may split one project across parallel jobs with E2E_SHARD ("i/n").
// Playwright's --shard partitions that project's tests, so the union of a
// project's shards is the whole project; the matrix guard checks that every
// sharded project lists each of 1..n exactly once.
export function selectShard(requested) {
  const value = (requested ?? "").trim();
  if (value === "") return [];
  const match = /^([1-9]\d*)\/([1-9]\d*)$/.exec(value);
  if (!match || Number(match[1]) > Number(match[2])) {
    throw new Error(`E2E_SHARD "${value}" is not i/n with 1 <= i <= n`);
  }
  return [`--shard=${value}`];
}

export function selectProjects(requested) {
  const value = (requested ?? "").trim();
  if (value === "") return E2E_PROJECTS;
  if (!E2E_PROJECTS.includes(value)) {
    throw new Error(
      `E2E_PROJECT "${value}" is not one of: ${E2E_PROJECTS.join(", ")}`,
    );
  }
  return [value];
}

function run(command, args) {
  const executable = process.platform === "win32" ? `${command}.cmd` : command;
  const result = spawnSync(executable, args, {
    env: process.env,
    shell: process.platform === "win32",
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  let projects;
  let shard;
  try {
    projects = selectProjects(process.env.E2E_PROJECT);
    shard = selectShard(process.env.E2E_SHARD);
  } catch (error) {
    console.error(error.message);
    process.exit(2);
  }
  run("node", ["scripts/build-parity-fixture.mjs"]);
  // `pnpm exec` resolves the project's own Playwright even when this file is
  // run directly, where a global `playwright` on PATH would be a second copy.
  run("pnpm", [
    "exec",
    "playwright",
    "test",
    ...projects.map((project) => `--project=${project}`),
    ...shard,
    ...process.argv.slice(2),
  ]);
}
