import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import cjkHeadingBreaks from "./src/integrations/cjk-heading-breaks.mjs";
import localizedNotFound from "./src/integrations/localized-not-found.mjs";
import { execSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";

const site = process.env.PUBLIC_SITE_URL?.trim() || "http://localhost:4321";

/**
 * WP-12 (LSN-marketing-002): stamp the build with the built commit.
 * Writes .astro/build-commit (git-ignored, outside the deployed dist/) at
 * build done. If git is unavailable, writes "unknown". Never fails the build.
 */
function buildStamp() {
  return {
    name: "build-stamp",
    hooks: {
      "astro:build:done": () => {
        let commit = "unknown";
        try {
          commit = execSync("git rev-parse HEAD", {
            encoding: "utf8",
            stdio: ["ignore", "pipe", "ignore"],
          }).trim();
        } catch {
          // git unavailable: stamp stays "unknown", build continues.
        }
        try {
          mkdirSync(".astro", { recursive: true });
          writeFileSync(".astro/build-commit", commit + "\n", "utf8");
        } catch {
          // Filesystem write failed: do not fail the build.
        }
      },
    },
  };
}

export default defineConfig({
  site,
  // cjkHeadingBreaks runs first so the copied localized 404 pages carry it too.
  integrations: [cjkHeadingBreaks(), localizedNotFound(), buildStamp()],
  output: "static",
  trailingSlash: "always",
  vite: {
    plugins: [tailwindcss()],
    build: {
      // Keep component scripts as EXTERNAL files: the production CSP
      // (`script-src 'self'`, no unsafe-inline) blocks inline scripts, and
      // Astro would otherwise inline hoisted script chunks below
      // vite's default assetsInlineLimit (4 KB). check-client-budget also
      // fails the build if an inline executable script ever reappears.
      assetsInlineLimit: 0,
    },
  },
});
