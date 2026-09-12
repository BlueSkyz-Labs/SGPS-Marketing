/**
 * Decision Room — bounded, ephemeral comparison (v3 G4).
 * In-memory only: no storage, no cookies, no network, no grading.
 * Idempotent init; state (a Set) is discarded on reload by construction.
 */

const MAX_DEFAULT = 4;

function template(message: string, n: number, max: number): string {
  return message.replace("{n}", String(n)).replace("{max}", String(max));
}

export function initDecisionRoom(root: ParentNode = document): void {
  const room = root.querySelector("[data-decision-room]");
  if (!(room instanceof HTMLElement)) {
    return;
  }
  if (room.hasAttribute("data-decision-ready")) {
    return;
  }
  room.setAttribute("data-decision-ready", "");

  const board = room.querySelector("[data-decision-board]");
  const empty = room.querySelector("[data-decision-empty-state]");
  const live = room.querySelector("[data-decision-live]");
  const reset = room.querySelector("[data-decision-reset]");
  const max = Math.min(
    MAX_DEFAULT,
    Number(room.getAttribute("data-max")) || MAX_DEFAULT,
  );

  const msgCount = room.getAttribute("data-msg-count") ?? "{n}/{max}";
  const msgFull = room.getAttribute("data-msg-full") ?? "max {max}";

  const selected = new Set<string>();
  const addButtons = Array.from(
    room.querySelectorAll<HTMLButtonElement>("[data-decision-add]"),
  );
  const removeButtons = Array.from(
    room.querySelectorAll<HTMLButtonElement>("[data-decision-remove]"),
  );
  const rows = Array.from(
    room.querySelectorAll<HTMLElement>("[data-decision-row]"),
  );

  const announce = (message: string): void => {
    if (live instanceof HTMLElement) {
      live.textContent = message;
    }
  };

  const render = (): void => {
    for (const row of rows) {
      const id = row.getAttribute("data-decision-row") ?? "";
      row.hidden = !selected.has(id);
    }
    if (empty instanceof HTMLElement) {
      empty.hidden = selected.size > 0;
    }
    if (board instanceof HTMLElement) {
      board.hidden = selected.size === 0;
    }
    for (const button of addButtons) {
      const id = button.getAttribute("data-decision-add") ?? "";
      const isSelected = selected.has(id);
      button.setAttribute("aria-pressed", String(isSelected));
      button.disabled = !isSelected && selected.size >= max;
    }
    if (reset instanceof HTMLElement) {
      reset.hidden = selected.size === 0;
    }
  };

  const toggle = (id: string, fromButton: boolean): void => {
    if (!id) return;
    if (selected.has(id)) {
      selected.delete(id);
      announce(template(msgCount, selected.size, max));
    } else if (selected.size >= max) {
      announce(template(msgFull, selected.size, max));
    } else {
      selected.add(id);
      announce(template(msgCount, selected.size, max));
    }
    render();
    if (fromButton) {
      const button = addButtons.find(
        (candidate) => candidate.getAttribute("data-decision-add") === id,
      );
      button?.focus();
    }
  };

  for (const button of addButtons) {
    button.addEventListener("click", () => {
      toggle(button.getAttribute("data-decision-add") ?? "", false);
    });
  }
  for (const button of removeButtons) {
    button.addEventListener("click", () => {
      const id = button.getAttribute("data-decision-remove") ?? "";
      selected.delete(id);
      announce(template(msgCount, selected.size, max));
      render();
      const origin = addButtons.find(
        (candidate) => candidate.getAttribute("data-decision-add") === id,
      );
      origin?.focus();
    });
  }
  if (reset instanceof HTMLButtonElement) {
    reset.addEventListener("click", () => {
      selected.clear();
      announce(template(msgCount, 0, max));
      render();
    });
  }

  render();
}
