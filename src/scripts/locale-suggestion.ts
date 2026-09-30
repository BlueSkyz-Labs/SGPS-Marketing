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

function bind(
  region: HTMLElement,
  target: Language,
  page: Language,
  accept: HTMLElement,
  keep: HTMLElement,
): void {
  accept.addEventListener("click", () => persist(target));
  keep.addEventListener("click", () => {
    persist(page);
    region.remove();
    document.getElementById("main-content")?.focus({ preventScroll: true });
  });
}

/**
 * The strip is normally inserted before first paint by
 * public/locale-suggestion-early.js (no layout shift). This function attaches
 * its interactions, and builds the strip itself only when the early script did
 * not run (the same decision, the same DOM).
 */
export function initLocaleSuggestion(): void {
  const page = explicitPathLanguage(window.location.pathname);
  if (!page) return;

  const existing = document.querySelector<HTMLElement>(
    "[data-locale-suggestion]",
  );
  if (existing) {
    const target = existing.getAttribute("data-locale-suggestion") as Language;
    const accept = existing.querySelector<HTMLElement>(
      ".locale-suggestion__accept",
    );
    const keep = existing.querySelector<HTMLElement>(
      ".locale-suggestion__keep",
    );
    if (accept && keep && !existing.hasAttribute("data-bound")) {
      existing.setAttribute("data-bound", "");
      bind(existing, target, page, accept, keep);
    }
    return;
  }

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
  // In-flow, directly under the header: it never overlays page content.
  const header = document.querySelector("body > header");
  if (header) header.after(region);
  else document.body.prepend(region);
}
