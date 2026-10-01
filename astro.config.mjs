import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import localizedNotFound from "./src/integrations/localized-not-found.mjs";

const site = process.env.PUBLIC_SITE_URL?.trim() || "http://localhost:4321";

export default defineConfig({
  site,
  integrations: [localizedNotFound()],
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
