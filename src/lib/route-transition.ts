/**
 * C3-A Task 5 (design S5) — route transition grammar: which elements are
 * paired across a navigation, and under what name.
 *
 * The grammar is deliberately tiny and declarative:
 *
 *   root                 the document cross-fade, declared by `@view-transition
 *                        { navigation: auto }` in the global sheet;
 *   product-{card,media}-<slug>   product continuity, owned by product-transition;
 *   language-{en,vi}     the locale pair, owned here.
 *
 * Two rules make the names safe:
 *
 *   - a `view-transition-name` must be unique inside a document (the platform
 *     fails silently on duplicates), so a name is derived from a closed
 *     vocabulary instead of being typed at a call site;
 *   - the name is emitted as an inline style property, so an engine without
 *     cross-document View Transition support ignores it. Nothing here gates
 *     navigation: the transition is decoration, never a precondition.
 */
export type TransitionLanguage = "en" | "vi";

const SUPPORTED_LANGUAGES: readonly TransitionLanguage[] = ["en", "vi"];

/**
 * Stable name for one locale entry of the language switcher. The same two names
 * exist on every localized page, which is what makes the pair animatable.
 * Throws on anything outside the vocabulary rather than emitting a name that
 * could collide or leak into the style attribute.
 */
export function languageTransitionName(language: string): string {
  if (!SUPPORTED_LANGUAGES.includes(language as TransitionLanguage)) {
    throw new Error(
      `unsupported language for a view-transition-name: ${JSON.stringify(language)}`,
    );
  }
  return `language-${language}`;
}

/** The inline style value to spread onto one language switcher entry. */
export function languageTransitionStyle(language: string): string {
  return `view-transition-name: ${languageTransitionName(language)}`;
}
