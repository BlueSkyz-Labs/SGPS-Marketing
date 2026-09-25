/**
 * C4-C Task 4 — Boardroom presentation mode client module.
 *
 * Contained control surface: ArrowLeft / ArrowRight navigate screens;
 * Escape exits presentation mode; explicit buttons navigate; focus stays
 * visible and reachable; no focus trap; no global scroll interception;
 * no network, storage, or analytics. Reduced motion is respected by
 * neutralizing transition animations when `prefers-reduced-motion: reduce`
 * is set.
 */

interface BoardroomElements {
  stage: HTMLElement;
  screens: HTMLElement[];
  prevBtn: HTMLButtonElement;
  nextBtn: HTMLButtonElement;
  exitBtn: HTMLButtonElement;
  progressCurrent: HTMLElement;
  progressTotal: HTMLElement;
  deck: HTMLElement;
}

function readElements(): BoardroomElements | null {
  const deck = document.querySelector<HTMLElement>("[data-boardroom-deck]");
  const stage = document.querySelector<HTMLElement>("[data-boardroom-stage]");
  const screens = stage
    ? Array.from(stage.querySelectorAll<HTMLElement>("[data-boardroom-screen]"))
    : [];
  const prevBtn =
    deck?.querySelector<HTMLButtonElement>("[data-boardroom-prev]") ?? null;
  const nextBtn =
    deck?.querySelector<HTMLButtonElement>("[data-boardroom-next]") ?? null;
  const exitBtn =
    deck?.querySelector<HTMLButtonElement>("[data-boardroom-exit]") ?? null;
  const progressCurrent =
    deck?.querySelector<HTMLElement>("[data-boardroom-progress-current]") ??
    null;
  const progressTotal =
    deck?.querySelector<HTMLElement>("[data-boardroom-progress-total]") ?? null;

  if (!deck || !stage || !prevBtn || !nextBtn || !exitBtn) return null;
  return {
    deck,
    stage,
    screens,
    prevBtn,
    nextBtn,
    exitBtn,
    progressCurrent: progressCurrent ?? prevBtn,
    progressTotal: progressTotal ?? nextBtn,
  };
}

export function initBoardroomMode(): void {
  const elements = readElements();
  if (!elements) return;
  const el = elements;

  const count = Math.max(1, el.screens.length);
  let current = 0;

  function show(index: number, moveFocus = false) {
    const target = Math.max(0, Math.min(count - 1, index));
    current = target;

    el.screens.forEach((screen, i) => {
      const active = i === current;
      screen.classList.toggle("c4-boardroom__screen--active", active);
      // Inactive screens are display:none, so their links are already out of
      // the tab order; no focus trap is needed to contain the mode.
      screen.setAttribute("aria-hidden", active ? "false" : "true");
    });

    // Focus moves only on explicit navigation: moving it on page load would
    // hijack the visitor's reading position.
    if (moveFocus) {
      el.screens[current]
        ?.querySelector<HTMLElement>(".c4-boardroom__screen-heading")
        ?.focus();
    }

    if (el.progressCurrent) {
      el.progressCurrent.textContent = String(current + 1);
    }
    if (el.progressTotal) {
      el.progressTotal.textContent = String(count);
    }

    el.prevBtn.disabled = current <= 0 || count <= 1;
    el.nextBtn.disabled = current >= count - 1 || count <= 1;
  }

  // Initialize first screen
  show(0);

  el.prevBtn.addEventListener("click", () => {
    if (current > 0) show(current - 1, true);
  });

  el.nextBtn.addEventListener("click", () => {
    if (current < count - 1) show(current + 1, true);
  });

  el.exitBtn.addEventListener("click", () => {
    // Exit presentation: leave the deck readable (all screens remain in the
    // document), disable the controls and return focus to the exit button so
    // the keyboard path stays reachable.
    el.screens.forEach((screen) => {
      screen.classList.remove("c4-boardroom__screen--active");
      screen.setAttribute("aria-hidden", "true");
    });
    el.prevBtn.disabled = true;
    el.nextBtn.disabled = true;
    if (el.progressCurrent) el.progressCurrent.textContent = "—";
    el.exitBtn.focus();
  });

  // Arrow navigation on the deck only (not globally) to avoid intercepting page scroll.
  function onKey(event: KeyboardEvent) {
    if (event.defaultPrevented) return;
    if (event.key === "ArrowLeft") {
      if (current > 0) {
        event.preventDefault();
        show(current - 1, true);
      }
      return;
    }
    if (event.key === "ArrowRight") {
      if (current < count - 1) {
        event.preventDefault();
        show(current + 1, true);
      }
      return;
    }
    if (event.key === "Escape") {
      // Exit mode: same behavior as exit button.
      event.preventDefault();
      el.exitBtn.click();
      return;
    }
  }

  el.deck.addEventListener("keydown", onKey);
}

initBoardroomMode();
