import { defineConfig } from "astro/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../../../..");

// Throwaway parity fixture (S+ v2 Task 0.2): renders the real shared
// components with a synthetic product so product-present EN/VI behavior can
// be asserted while the production registry stays empty. Never deployed.
export default defineConfig({
  outDir: "./dist",
  vite: {
    resolve: {
      alias: { "@": path.join(repoRoot, "src") },
    },
  },
});
