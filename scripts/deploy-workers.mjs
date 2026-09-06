#!/usr/bin/env node
/**
 * One-shot Workers Static Assets deploy with an explicit PUBLIC_SITE_URL.
 * Prefer Cloudflare Workers Builds Git Connect for ongoing promotion.
 */
import { spawnSync } from "node:child_process";

const siteUrl = process.env.PUBLIC_SITE_URL?.trim();
if (!siteUrl || !/^https:\/\//i.test(siteUrl)) {
  console.error(
    "PUBLIC_SITE_URL must be set to an https URL before deploy (workers.dev or canonical corporate domain).",
  );
  process.exit(1);
}

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    env: process.env,
    shell: false,
  });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run("pnpm", ["build"]);
run("pnpm", ["check:client-budget"]);
run("pnpm", ["check:static-links"]);
run("pnpm", ["wrangler", "deploy"]);
