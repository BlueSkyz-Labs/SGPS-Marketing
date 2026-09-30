import { readFileSync } from "node:fs";

/**
 * Single source of truth: SUPPORTED_LANGUAGES in src/lib/i18n.ts. Parsed (not
 * imported) because the file is TypeScript; fails closed if it cannot be read.
 */
export function loadSupportedLanguages() {
  const source = readFileSync(
    new URL("../src/lib/i18n.ts", import.meta.url),
    "utf8",
  );
  const match = source.match(/SUPPORTED_LANGUAGES\s*=\s*\[([^\]]+)\]/);
  const codes = match
    ? [...match[1].matchAll(/"([a-z-]+)"/g)].map((m) => m[1])
    : [];
  if (codes.length === 0) {
    throw new Error("cannot derive SUPPORTED_LANGUAGES from src/lib/i18n.ts");
  }
  return codes;
}

export const SUPPORTED_LANGUAGES = loadSupportedLanguages();
// Longest-first so alternation never shadows zh-hant with zh (en|vi|zh|zh-hant).
export function localeRoutePattern(languages = SUPPORTED_LANGUAGES) {
  const alternation = [...languages]
    .sort((a, b) => b.length - a.length)
    .join("|");
  return new RegExp(`^https?://[^/]+/(${alternation})/`);
}
