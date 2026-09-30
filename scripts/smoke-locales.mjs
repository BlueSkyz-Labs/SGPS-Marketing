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

export function isLocalizedCanonicalRoute(
  candidate,
  site,
  languages = SUPPORTED_LANGUAGES,
) {
  try {
    const expected = new URL(site);
    const actual = new URL(candidate);
    if (actual.origin !== expected.origin) return false;
    if (actual.search || actual.hash) return false;

    const segments = actual.pathname.split("/").filter(Boolean);
    const locale = segments[0];
    return (
      typeof locale === "string" &&
      languages.includes(locale) &&
      actual.pathname.startsWith(`/${locale}/`)
    );
  } catch {
    return false;
  }
}
