import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

const site = process.env.PUBLIC_SITE_URL?.trim() || "http://localhost:4321";

export default defineConfig({
  site,
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
