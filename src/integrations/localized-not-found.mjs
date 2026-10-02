import { copyFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

export const LOCALIZED_404_LANGS = ["en", "vi", "zh", "zh-hant"];

/**
 * Workers Assets `not_found_handling = "404-page"` serves the nearest
 * `404.html` up the request path. Astro emits each localized 404 as
 * `<lang>/404/index.html`, which that lookup never finds, so unknown URLs under
 * /vi/, /zh/ and /zh-hant/ fell back to the English root page. Publish the very
 * same built page (hashed assets and all) as `<lang>/404.html` too.
 * Fails the build if a localized 404 is missing.
 */
export function publishLocalizedNotFound(root) {
  const base = root.endsWith("/") ? root : `${root}/`;
  for (const lang of LOCALIZED_404_LANGS) {
    const from = `${base}${lang}/404/index.html`;
    if (!existsSync(from)) {
      throw new Error(`localized-not-found: missing ${from}`);
    }
    copyFileSync(from, `${base}${lang}/404.html`);
  }
}

export default function localizedNotFound() {
  return {
    name: "localized-not-found",
    hooks: {
      "astro:build:done": ({ dir }) =>
        publishLocalizedNotFound(fileURLToPath(dir)),
    },
  };
}
