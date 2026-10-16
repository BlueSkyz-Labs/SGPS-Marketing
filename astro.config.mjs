import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import cjkHeadingBreaks from "./src/integrations/cjk-heading-breaks.mjs";
import localizedNotFound from "./src/integrations/localized-not-found.mjs";
import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const site = process.env.PUBLIC_SITE_URL?.trim() || "http://localhost:4321";

/**
 * WP-12 (LSN-marketing-002): stamp dist/ with the built commit.
 * Writes dist/.build-commit at build done. If git is unavailable,
 * writes "unknown". Never fails the build.
 */
function buildStamp() {
  return {
    name: "build-stamp",
    hooks: {
      "astro:build:done": ({ dir }) => {
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
          // dir is a file:// URL; convert to path.
          const distPath = new URL(".build-commit", dir);
          writeFileSync(distPath, commit + "\n", "utf8");
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
