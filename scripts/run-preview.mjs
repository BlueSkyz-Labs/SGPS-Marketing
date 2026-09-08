#!/usr/bin/env node
import { spawn, spawnSync } from "node:child_process";

const port = 3000;
const host = "127.0.0.1";
const executable = process.platform === "win32" ? "pnpm.cmd" : "pnpm";
const preview = spawn(
  executable,
  ["exec", "astro", "preview", "--host", host, "--port", String(port)],
  {
    env: process.env,
    shell: process.platform === "win32",
    stdio: "inherit",
  },
);

const wait = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

async function waitForPreview() {
  const url = `http://${host}:${port}`;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    try {
      await fetch(url);
      return;
    } catch {
      if (preview.exitCode !== null) {
        throw new Error(`Astro preview exited with code ${preview.exitCode}`);
      }
      await wait(250);
    }
  }
  throw new Error(`Astro preview did not become ready at ${url}`);
}

function stopPreview() {
  spawnSync(executable, ["exec", "astro", "preview", "stop"], {
    env: process.env,
    shell: process.platform === "win32",
    stdio: "inherit",
  });
}

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    stopPreview();
    process.exit(0);
  });
}

await waitForPreview();
setInterval(() => {}, 2 ** 31 - 1);
