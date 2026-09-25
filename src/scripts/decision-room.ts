/**
 * Decision Room — bounded, ephemeral comparison (v3 G4).
 * In-memory only: no storage, no cookies, no network, no grading.
 * Idempotent init; state (a Set) is discarded on reload by construction.
 */

import {
  ATELIER_CONSTRAINTS,
  ATELIER_GOALS,
  arrangeDecisionItems,
} from "@/lib/decision-atelier";
import { planDossierHandoff } from "@/lib/decision-handoff";
import type { DecisionItem, DecisionKind } from "@/lib/decision-room";
import type { Language } from "@/lib/dossier";

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
  initDecisionAtelier(room);
  initAtelierHandoff(room);

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

/**
 * C4-E Task 3 — atelier controls.
 *
 * Progressive enhancement over the same room: without JavaScript the baseline
 * item list is already complete and these controls stay hidden. Grouping is the
 * declared arrangement from the library, applied to the existing items, so the
 * room never grows a second rule set. Nothing is written to storage, nothing is
 * sent anywhere, and the only URL state read is a validated goal/constraint.
 */
export function initDecisionAtelier(room: HTMLElement): void {
  const controls = room.querySelector<HTMLElement>("[data-atelier-controls]");
  const list = room.querySelector<HTMLElement>("[data-decision-items]");
  const goalSelect = room.querySelector<HTMLSelectElement>(
    "[data-atelier-goal]",
  );
  const resetButton = room.querySelector<HTMLButtonElement>(
    "[data-atelier-reset]",
  );
  const status = room.querySelector<HTMLElement>("[data-atelier-status]");
  if (!controls || !list || !goalSelect || !resetButton || !status) {
    return;
  }

  const checkboxes = Array.from(
    room.querySelectorAll<HTMLInputElement>("[data-atelier-constraint]"),
  );
  const items = Array.from(
    list.querySelectorAll<HTMLElement>("[data-decision-item]"),
  );

  // The vocabulary is validated here as well, so a crafted URL changes nothing.
  const goals = new Set<string>(ATELIER_GOALS);
  const constraints = new Set<string>(ATELIER_CONSTRAINTS);

  const message = (key: string): string =>
    room.getAttribute(`data-msg-${key}`) ?? "";
  const fill = (text: string, n: number): string =>
    text.replace("{n}", String(n));

  const asItem = (element: HTMLElement): DecisionItem => {
    const placeholder = { en: "", vi: "", zh: "" };
    return {
      id: element.getAttribute("data-decision-item") ?? "",
      kind: (element.getAttribute("data-item-kind") ?? "claim") as DecisionKind,
      label: placeholder,
      evidenceHref: element.hasAttribute("data-has-evidence")
        ? placeholder
        : undefined,
      boundaryText: element.hasAttribute("data-has-boundary")
        ? placeholder
        : undefined,
    };
  };

  const sourceIndex = (element: HTMLElement): number =>
    Number(element.getAttribute("data-source-index") ?? "0");

  const clear = (): void => {
    // Restore the published source order by re-appending, so no CSS layout
    // mode is required and the baseline stays exactly as authored.
    for (const element of [...items].sort(
      (a, b) => sourceIndex(a) - sourceIndex(b),
    )) {
      list.appendChild(element);
    }
    for (const element of items) {
      element.removeAttribute("data-atelier-group");
      element.querySelector("[data-atelier-group-label]")?.remove();
      element.querySelector("[data-atelier-reason-text]")?.remove();
      element.hidden = false;
    }
  };

  const apply = (announce: boolean): void => {
    const goal = goalSelect.value;
    clear();

    if (!goal) {
      if (announce) status.textContent = message("cleared");
      return;
    }

    const arrangement = arrangeDecisionItems(items.map(asItem), {
      goal,
      constraints: checkboxes
        .filter((box) => box.checked)
        .map((box) => box.value),
    });

    let shown = 0;
    for (const group of arrangement.groups) {
      // A <template>'s children live in its content fragment, so read that;
      // textContent on the template element itself comes back empty.
      const template = room.querySelector<HTMLTemplateElement>(
        `template[data-atelier-label="${group.id}"]`,
      );
      const label = (template?.content.textContent ?? "").trim() || group.id;
      // The reason is the group's declared dimension, rendered from a template.
      const reasonTemplate = room.querySelector<HTMLTemplateElement>(
        `template[data-atelier-reason="${group.reason}"]`,
      );
      const reasonText = (reasonTemplate?.content.textContent ?? "").trim();
      for (const item of group.items) {
        const element = items.find(
          (candidate) =>
            candidate.getAttribute("data-decision-item") === item.id,
        );
        if (!element) continue;
        element.setAttribute("data-atelier-group", group.id);
        list.appendChild(element);
        // An item can match more than one group; it still shows one label and one
        // reason, so the first matching group states the dimension.
        if (!element.querySelector("[data-atelier-group-label]")) {
          const badge = document.createElement("span");
          badge.className = "decision-room__group-label";
          badge.setAttribute("data-atelier-group-label", group.id);
          badge.textContent = label;
          element.prepend(badge);
        }
        if (
          reasonText &&
          !element.querySelector("[data-atelier-reason-text]")
        ) {
          const reason = document.createElement("span");
          reason.className = "decision-room__group-reason";
          reason.setAttribute("data-atelier-reason-text", group.reason);
          reason.textContent = reasonText;
          element.prepend(reason);
        }
        shown += 1;
      }
    }

    const matched = new Set(
      arrangement.groups.flatMap((group) => group.items.map((i) => i.id)),
    );
    for (const element of items) {
      if (!matched.has(element.getAttribute("data-decision-item") ?? "")) {
        element.hidden = true;
      }
    }

    if (announce) {
      status.textContent =
        shown === 0 ? message("none") : fill(message("grouped"), shown);
    }
  };

  // Validated URL state only. Nothing is stored and nothing is rewritten.
  const params = new URLSearchParams(window.location.search);
  const requestedGoal = params.get("goal");
  if (requestedGoal && goals.has(requestedGoal)) {
    goalSelect.value = requestedGoal;
  }
  const requestedConstraint = params.get("constraint");
  for (const box of checkboxes) {
    if (
      requestedConstraint &&
      constraints.has(requestedConstraint) &&
      box.value === requestedConstraint
    ) {
      box.checked = true;
    }
  }

  controls.hidden = false;
  controls.setAttribute("data-atelier-ready", "");
  goalSelect.addEventListener("change", () => apply(true));
  for (const box of checkboxes) {
    box.addEventListener("change", () => apply(true));
  }
  resetButton.addEventListener("click", () => {
    goalSelect.value = "";
    for (const box of checkboxes) {
      box.checked = false;
    }
    apply(true);
  });

  apply(false);
}

/**
 * C4-E Task 5 — hand the visitor's own ticks to the dossier.
 *
 * The visitor's selection is the only input. Nothing is ticked for them, the
 * plan is recomputed from what is checked right now, and the destination is an
 * ordinary same-origin link the browser follows only when they click it.
 */
export function initAtelierHandoff(room: HTMLElement): void {
  const link = room.querySelector<HTMLAnchorElement>(
    "[data-atelier-handoff-link]",
  );
  const empty = room.querySelector<HTMLElement>("[data-atelier-handoff-empty]");
  const report = room.querySelector<HTMLElement>(
    "[data-atelier-handoff-report]",
  );
  const actionTemplate = room.querySelector<HTMLTemplateElement>(
    "template[data-atelier-handoff-action]",
  );
  const reportTemplate = room.querySelector<HTMLTemplateElement>(
    "template[data-atelier-handoff-report]",
  );
  if (!link || !empty || !report || !actionTemplate || !reportTemplate) return;

  const actionCopy = (actionTemplate.content.textContent ?? "").trim();
  const reportCopy = (reportTemplate.content.textContent ?? "").trim();
  const lang = readLanguage();

  const render = (): void => {
    const selected = Array.from(
      room.querySelectorAll<HTMLInputElement>(
        "[data-atelier-item-select]:checked",
      ),
    ).map((input) => input.value);
    const plan = planDossierHandoff(selected, lang);

    if (plan.href !== null && plan.itemIds.length > 0) {
      link.setAttribute("href", plan.href);
      link.textContent = actionCopy.replace("{n}", String(plan.itemIds.length));
      link.hidden = false;
      empty.hidden = true;
    } else {
      link.removeAttribute("href");
      link.hidden = true;
      empty.hidden = false;
    }

    if (plan.rejected.length > 0) {
      report.textContent = reportCopy.replace(
        "{n}",
        String(plan.rejected.length),
      );
      report.hidden = false;
    } else {
      report.textContent = "";
      report.hidden = true;
    }
  };

  const itemInputs = Array.from(
    room.querySelectorAll<HTMLInputElement>("[data-atelier-item-select]"),
  );
  for (const input of itemInputs) {
    // Firefox can restore native checkbox state across reloads. The handoff is
    // intentionally ephemeral, so discard that browser-restored state before
    // the first render rather than allowing it to become a hidden selection.
    input.checked = false;
    input.addEventListener("change", render);
  }
  render();
}

/** The document's language, restricted to the locales the site publishes. */
function readLanguage(): Language {
  const tag = (document.documentElement.lang || "en").toLowerCase();
  if (tag.startsWith("vi")) return "vi";
  if (tag.startsWith("zh")) return "zh";
  return "en";
}
