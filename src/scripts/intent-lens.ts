/**
 * S+ Intent Lens (Task 7) + v3 G5 mission paths (Task 15) — explicit,
 * first-party interaction state. DOM/in-memory only: no cookies, no
 * storage, no fingerprinting, no remote profile. Selecting an intent
 * updates emphasis and journey step **order** only; it never hides trust,
 * legal, product, or boundary facts. Init is idempotent.
 */
import { orderItemsByMission } from "@/lib/journey";

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

  // Journey-bar mission state: capture the server order once.
  const bar = root.querySelector<HTMLElement>("[data-journey-bar]");
  const list = bar?.querySelector("ul");
  const originalItems = list
    ? Array.from(list.querySelectorAll<HTMLElement>("li[data-step-key]"))
    : [];
  const parseMap = (
    raw: string | null | undefined,
  ): Record<string, string[]> => {
    if (!raw) return {};
    try {
      const parsed: unknown = JSON.parse(raw);
      return typeof parsed === "object" && parsed !== null
        ? (parsed as Record<string, string[]>)
        : {};
    } catch {
      return {};
    }
  };
  const missionOrders = parseMap(bar?.getAttribute("data-mission-orders"));
  const missionEvidence = parseMap(bar?.getAttribute("data-mission-evidence"));

  const applyMissionOrder = (intent: string | null): void => {
    if (!list || originalItems.length === 0) return;
    const orderedKeys = intent ? missionOrders[intent] : undefined;
    const evidenceKeys = new Set(intent ? (missionEvidence[intent] ?? []) : []);

    const ordered =
      orderedKeys && orderedKeys.length > 0
        ? orderItemsByMission(
            originalItems,
            (item) => item.getAttribute("data-step-key") ?? "",
            orderedKeys,
          )
        : originalItems;

    // Reorder in the DOM (screen-reader order follows the real DOM) and
    // mark evidence-first steps for emphasis. No item is ever removed.
    for (const item of ordered) {
      const key = item.getAttribute("data-step-key") ?? "";
      if (evidenceKeys.has(key)) {
        item.setAttribute("data-evidence-first", "true");
      } else {
        item.removeAttribute("data-evidence-first");
      }
      list.append(item);
    }
  };

  const applyIntent = (intent: string | null): void => {
    if (intent) {
      document.documentElement.dataset.intent = intent;
    } else {
      delete document.documentElement.dataset.intent;
    }
    applyMissionOrder(intent);
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
