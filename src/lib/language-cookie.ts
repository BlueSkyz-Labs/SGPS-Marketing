/**
 * Explicit-language-choice cookie shared by the edge Worker (read) and the
 * browser (write). The cookie is the ONLY cookie this site sets: a functional,
 * first-party preference written when a visitor clicks a language choice.
 * No identifiers, no analytics, no country or IP data are ever stored in it.
 *
 * Pure string helpers only (no DOM, no Workers types) so node:test can load
 * this module directly.
 */
export const LANGUAGE_COOKIE = "bsl_lang";
export const LANGUAGE_COOKIE_MAX_AGE_SECONDS = 31_536_000;

/** Serialise the Set-Cookie / document.cookie value for an explicit choice. */
export function serializeLanguageCookie(
  language: string,
  options: { secure?: boolean } = {},
): string {
  const secure = options.secure ?? true;
  return [
    `${LANGUAGE_COOKIE}=${encodeURIComponent(language)}`,
    "Path=/",
    `Max-Age=${LANGUAGE_COOKIE_MAX_AGE_SECONDS}`,
    "SameSite=Lax",
    ...(secure ? ["Secure"] : []),
  ].join("; ");
}

/**
 * Extract the raw (unvalidated) bsl_lang value from a Cookie header or
 * document.cookie string. Callers must validate against the supported list.
 */
export function readLanguageCookieValue(
  cookieHeader: string | null | undefined,
): string | null {
  if (!cookieHeader || cookieHeader.length > 4096) return null;
  for (const part of cookieHeader.split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0) continue;
    if (part.slice(0, separator).trim() !== LANGUAGE_COOKIE) continue;
    const raw = part.slice(separator + 1).trim();
    try {
      return decodeURIComponent(raw);
    } catch {
      return null;
    }
  }
  return null;
}
