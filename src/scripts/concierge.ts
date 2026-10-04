/**
 * C3-E Task 5 (deterministic step) — concierge list filter.
 *
 * Mirrors the Command Navigator's filter semantics (diacritic-insensitive,
 * substring match over server-rendered data-search text) with no model, no
 * network and no storage. The server-rendered list is the no-JS baseline;
 * this module only hides what does not match.
 */
function normalize(value: string): string {
  return value
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export function initConcierge(root: ParentNode = document): void {
  const surface = root.querySelector("[data-concierge]");
  if (!(surface instanceof HTMLElement)) {
    return;
  }
  // Idempotent init: duplicate calls must never double-bind handlers.
  if (surface.hasAttribute("data-concierge-ready")) {
    return;
  }
  surface.setAttribute("data-concierge-ready", "");

  const input = surface.querySelector("[data-concierge-input]");
  const live = surface.querySelector("[data-concierge-live]");
  const empty = surface.querySelector("[data-concierge-empty]");
  const items = Array.from(surface.querySelectorAll("[data-concierge-item]"));
  if (!(input instanceof HTMLInputElement) || items.length === 0) {
    return;
  }

  const applyFilter = (query: string): void => {
    const needle = normalize(query.trim());
    let visibleCount = 0;
    for (const item of items) {
      const haystack = item.getAttribute("data-search") ?? "";
      const match = needle.length === 0 || normalize(haystack).includes(needle);
      if (item instanceof HTMLElement) {
        item.hidden = !match;
      }
      if (match) {
        visibleCount += 1;
      }
    }
    if (empty instanceof HTMLElement) {
      empty.hidden = visibleCount > 0;
    }
    if (live instanceof HTMLElement) {
      const none = live.getAttribute("data-live-none") ?? "";
      const template = live.getAttribute("data-live-template") ?? "%n";
      live.textContent =
        visibleCount === 0
          ? none
          : template.replace("%n", String(visibleCount));
    }
  };

  input.addEventListener("input", () => applyFilter(input.value));
}
