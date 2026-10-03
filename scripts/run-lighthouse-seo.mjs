#!/usr/bin/env node
// SEO lab truth (v10 E5). The performance lanes build against the local
// origin, which correctly emits noindex, so their SEO score is noise. This
// lane rebuilds with the canonical production origin, serves it locally and
// asserts the SEO category as an error.
import { spawnSync } from "node:child_process";

const env = {
  ...process.env,
  PUBLIC_SITE_URL: "https://blueskyzlabs.com",
};

function run(command, args) {
  const executable = process.platform === "win32" ? `${command}.cmd` : command;
  const result = spawnSync(executable, args, {
    env,
    shell: process.platform === "win32",
    stdio: "inherit",
  });

  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run("pnpm", ["build"]);
run("lhci", ["autorun", "--config=./lighthouserc.seo.json"]);
