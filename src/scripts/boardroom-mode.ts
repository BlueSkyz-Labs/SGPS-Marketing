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

/**
 * The deck is closed until the composer asks for it: `boardroom:set` carries
 * the selected entry ids (the same single list the composer renders), and
 * `boardroom:open` / `boardroom:close` show or hide the presentation. With no
 * selection there is nothing to present, so the deck never opens.
 */
export function initBoardroomMode(): void {
  const elements = readElements();
  if (!elements) return;
  const el = elements;

  let ids: string[] = [];
  let visible: HTMLElement[] = [];
  let current = 0;

  el.deck.setAttribute("data-boardroom-ready", "true");

  function show(index: number, moveFocus = false) {
    const count = Math.max(1, visible.length);
    current = Math.max(0, Math.min(count - 1, index));

    el.screens.forEach((screen) => {
      const active = screen === visible[current];
      screen.classList.toggle("c4-boardroom__screen--active", active);
      screen.setAttribute("aria-hidden", active ? "false" : "true");
    });

    // Focus moves only on explicit navigation: moving it on page load would
    // hijack the visitor's reading position.
    if (moveFocus) {
      visible[current]
        ?.querySelector<HTMLElement>(".c4-boardroom__screen-heading")
        ?.focus();
    }

    el.progressCurrent.textContent = String(current + 1);
    el.progressTotal.textContent = String(count);
    el.prevBtn.disabled = current <= 0 || count <= 1;
    el.nextBtn.disabled = current >= count - 1 || count <= 1;
  }

  function refilter() {
    const wanted = new Set(ids);
    visible = el.screens.filter((screen) =>
      wanted.has(screen.getAttribute("data-boardroom-id") ?? ""),
    );
  }

  function close() {
    el.deck.hidden = true;
    el.screens.forEach((screen) => {
      screen.classList.remove("c4-boardroom__screen--active");
      screen.setAttribute("aria-hidden", "true");
    });
    document.dispatchEvent(new CustomEvent("boardroom:closed"));
  }

  ids = (
    document.querySelector<HTMLElement>("[data-dossier-present]")?.dataset
      .selectedIds ?? ""
  )
    .split(",")
    .filter(Boolean);
  refilter();

  document.addEventListener("boardroom:set", (event) => {
    const detail = (event as CustomEvent<{ ids?: string[] }>).detail;
    ids = Array.isArray(detail?.ids) ? detail.ids : [];
    refilter();
    if (ids.length === 0) {
      if (!el.deck.hidden) close();
      return;
    }
    if (!el.deck.hidden) show(current);
  });

  document.addEventListener("boardroom:open", () => {
    if (visible.length === 0) return;
    el.deck.hidden = false;
    show(0, true);
    el.deck.scrollIntoView({ block: "start" });
  });

  document.addEventListener("boardroom:close", () => {
    if (!el.deck.hidden) close();
  });

  el.prevBtn.addEventListener("click", () => {
    if (current > 0) show(current - 1, true);
  });

  el.nextBtn.addEventListener("click", () => {
    if (current < visible.length - 1) show(current + 1, true);
  });

  el.exitBtn.addEventListener("click", close);

  // Arrow navigation on the deck only (not globally) to avoid intercepting page scroll.
  el.deck.addEventListener("keydown", (event: KeyboardEvent) => {
    if (event.defaultPrevented) return;
    if (event.key === "ArrowLeft" && current > 0) {
      event.preventDefault();
      show(current - 1, true);
    } else if (event.key === "ArrowRight" && current < visible.length - 1) {
      event.preventDefault();
      show(current + 1, true);
    } else if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
  });
}

initBoardroomMode();
