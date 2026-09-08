#!/usr/bin/env node
import { spawnSync } from "node:child_process";

const env = {
  ...process.env,
  PUBLIC_SITE_URL: "http://127.0.0.1:3000",
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
run("lhci", ["autorun"]);
