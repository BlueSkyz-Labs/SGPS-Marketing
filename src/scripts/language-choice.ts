/**
 * Persist an explicit language choice as the first-party `bsl_lang` cookie so
 * the edge Worker can honour it on the next visit to `/`.
 *
 * Hooks clicks on any `a[data-language-choice]` (the header switcher and the
 * root chooser) from one shared module, so the switcher markup is untouched.
 * Best-effort: navigation always works even if cookies are blocked. The cookie
 * holds only a supported language code; localStorage remains written by the
 * switcher for the client-side fallback.
 */
import { LANGUAGE_STORAGE_KEY, isActiveLanguage } from "@/lib/i18n";
import { serializeLanguageCookie } from "@/lib/language-cookie";

let bound = false;

export function initLanguageChoice(): void {
  if (bound) return;
  bound = true;
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const link = target.closest<HTMLAnchorElement>("a[data-language-choice]");
    const language = link?.dataset.languageChoice;
    if (!isActiveLanguage(language)) return;
    try {
      document.cookie = serializeLanguageCookie(language, {
        secure: window.location.protocol === "https:",
      });
    } catch {
      // Cookies blocked: the choice still applies to this navigation.
    }
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // Storage blocked: best-effort only.
    }
  });
}
