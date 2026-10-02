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
  try {
    projects = selectProjects(process.env.E2E_PROJECT);
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
    ...process.argv.slice(2),
  ]);
}
