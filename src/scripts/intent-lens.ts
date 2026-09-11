/**
 * S+ Intent Lens (Task 7) — explicit, first-party interaction state.
 * DOM/in-memory only: no cookies, no storage, no fingerprinting, no remote
 * profile. Selection changes emphasis, never factual availability.
 * Init is idempotent; call `initIntentLens()` once from the component.
 */
const INTENT_EVENT = "blueskyz:intent";

export function initIntentLens(root: ParentNode = document): void {
  const lens = root.querySelector("[data-intent-lens]");
  if (!(lens instanceof HTMLElement)) {
    return;
  }
  // Idempotent init: a double call must never attach duplicate handlers
  // (two listeners would double-toggle each click back to a no-op).
  if (lens.hasAttribute("data-intent-lens-ready")) {
    return;
  }
  lens.setAttribute("data-intent-lens-ready", "");
  const buttons = Array.from(
    lens.querySelectorAll<HTMLButtonElement>("button[data-intent]"),
  );
  if (buttons.length === 0) {
    return;
  }

  const applyIntent = (intent: string | null): void => {
    if (intent) {
      document.documentElement.dataset.intent = intent;
    } else {
      delete document.documentElement.dataset.intent;
    }
  };

  for (const button of buttons) {
    button.addEventListener("click", () => {
      const intent = button.dataset.intent ?? "";
      const wasPressed = button.getAttribute("aria-pressed") === "true";
      for (const other of buttons) {
        other.setAttribute(
          "aria-pressed",
          other === button && !wasPressed ? "true" : "false",
        );
      }
      applyIntent(wasPressed ? null : intent);
      if (!wasPressed && intent) {
        // Semantic hook only — analytics, if ever added (#100), observes the
        // event; it does not own the interaction.
        window.dispatchEvent(
          new CustomEvent(INTENT_EVENT, { detail: { intent } }),
        );
      }
    });
  }
}
