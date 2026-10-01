/**
 * Compact header menu (<details>): progressive enhancement only. Without
 * JavaScript the disclosure still opens and closes natively.
 * Escape closes it and returns focus to the summary; a pointer press outside
 * the open menu closes it without moving focus.
 */
export function initMobileMenu(root: Document = document): void {
  const details = root.querySelector<HTMLDetailsElement>("header details");
  const summary = details?.querySelector("summary");
  if (!details || !(summary instanceof HTMLElement)) return;
  if (details.hasAttribute("data-menu-ready")) return;
  details.setAttribute("data-menu-ready", "");

  root.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !details.open) return;
    // A popover/dialog opened from the menu handles its own Escape first.
    if (
      details.querySelector(":popover-open") ||
      root.querySelector("dialog[open]")
    ) {
      return;
    }
    details.open = false;
    summary.focus();
  });

  root.addEventListener("pointerdown", (event) => {
    if (!details.open) return;
    if (event.target instanceof Node && details.contains(event.target)) return;
    details.open = false;
  });
}
