/**
 * Locale suggestion banner (ADR 0009, no-cookie variant).
 *
 * Builds a small, dismissible region when the visitor has no explicit language
 * choice and the best `navigator.languages` match differs from the page
 * language. No cookie, no network, no redirect: accepting is a plain link the
 * visitor activates. The only key ever written is `blueskyz.ui.language`.
 * Every storage access is guarded; a failed read fails closed (no banner).
 */
import {
  LANGUAGES,
  LANGUAGE_STORAGE_KEY,
  getAlternatePath,
  type Language,
} from "../lib/i18n";
import {
  LOCALE_SUGGESTION_COPY,
  explicitPathLanguage,
  keepLabel,
  suggestLanguage,
} from "../lib/locale-suggestion";

function persist(language: Language): void {
  try {
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch {
    // Best effort; navigation and dismissal still work for this view.
  }
}

export function initLocaleSuggestion(): void {
  if (document.querySelector("[data-locale-suggestion]")) return;
  const page = explicitPathLanguage(window.location.pathname);
  if (!page) return;

  let stored: string | null;
  try {
    stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
  } catch {
    return; // Cannot remember a choice: never nag.
  }

  const languages = navigator.languages?.length
    ? navigator.languages
    : [navigator.language];
  const target = suggestLanguage(stored, languages, page);
  if (!target) return;

  const copy = LOCALE_SUGGESTION_COPY[target];
  const config = LANGUAGES[target];

  const region = document.createElement("div");
  region.className = "locale-suggestion";
  region.setAttribute("role", "region");
  region.setAttribute("aria-label", copy.question);
  region.setAttribute("data-locale-suggestion", target);
  region.lang = config.hreflang;

  const text = document.createElement("p");
  text.className = "locale-suggestion__text";
  text.textContent = copy.question;

  const actions = document.createElement("div");
  actions.className = "locale-suggestion__actions";

  const accept = document.createElement("a");
  accept.className = "locale-suggestion__button locale-suggestion__accept";
  accept.href = getAlternatePath(window.location.pathname, target);
  accept.hreflang = config.hreflang;
  accept.textContent = copy.accept;
  accept.addEventListener("click", () => persist(target));

  const keep = document.createElement("button");
  keep.type = "button";
  keep.className = "locale-suggestion__button locale-suggestion__keep";
  keep.textContent = keepLabel(target, page);
  keep.addEventListener("click", () => {
    persist(page);
    region.remove();
    document.getElementById("main-content")?.focus({ preventScroll: true });
  });

  actions.append(accept, keep);
  region.append(text, actions);
  document.body.prepend(region);
}
