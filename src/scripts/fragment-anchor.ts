/**
 * Fragment-anchor stabilization.
 *
 * Firefox can restore the previous document's scroll position over a same-tab
 * fragment navigation, which leaves the deep-link target outside the viewport.
 * Observed 2026-09-29 on `/en/` -> `/en/decision-room/#room-item-trust-privacy`:
 * the document ended at scrollY 1594 (the bottom) while the target sits at 1101,
 * deterministically in the E2E suite but only intermittently in isolation.
 *
 * The native fragment scroll remains the authority and this runs only after the
 * document has loaded: it does nothing when there is no fragment, when the
 * target does not exist, or when the target is already in view. There is no URL
 * mutation, no storage and no network access.
 */
export function initFragmentAnchor(): void {
  if (typeof window === "undefined") return;

  const restore = () => {
    const id = window.location.hash.slice(1);
    if (!id) return;
    const target = document.getElementById(id);
    if (!target) return;

    const rect = target.getBoundingClientRect();
    const inView = rect.top >= 0 && rect.bottom <= window.innerHeight;
    if (inView) return;

    const marginTop =
      Number.parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
    window.scrollTo({
      top: Math.max(window.scrollY + rect.top - marginTop, 0),
      behavior: "instant",
    });
  };

  if (document.readyState === "complete") restore();
  else window.addEventListener("load", restore, { once: true });
}
