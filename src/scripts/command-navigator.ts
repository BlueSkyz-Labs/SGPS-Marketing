/**
 * S+ Command Navigator (Task 9) — dependency-free keyboard-first navigation.
 * Native <dialog> provides modal semantics + focus containment; results are
 * ordinary links; the index is server-rendered from live route truth.
 */
const OPEN_EVENT = "blueskyz:navigator";

function normalize(value: string): string {
  return value
    .toLocaleLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export function initCommandNavigator(root: ParentNode = document): void {
  const dialog = root.querySelector("[data-command-navigator]");
  if (!(dialog instanceof HTMLDialogElement)) {
    return;
  }
  // Idempotent init: duplicate calls must never double-bind handlers.
  if (dialog.hasAttribute("data-command-ready")) {
    return;
  }
  dialog.setAttribute("data-command-ready", "");

  const input = dialog.querySelector("[data-command-input]");
  const empty = dialog.querySelector("[data-command-empty]");
  const items = Array.from(dialog.querySelectorAll("[data-command-item]"));
  if (!(input instanceof HTMLInputElement) || items.length === 0) {
    return;
  }

  let invoker: HTMLElement | null = null;

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
  };

  const open = (trigger: HTMLElement | null): void => {
    invoker = trigger;
    input.value = "";
    applyFilter("");
    if (!dialog.open) {
      dialog.showModal();
    }
    input.focus();
    window.dispatchEvent(
      new CustomEvent(OPEN_EVENT, { detail: { action: "open" } }),
    );
  };

  const close = (): void => {
    if (dialog.open) {
      dialog.close();
    }
  };

  for (const trigger of root.querySelectorAll("[data-command-trigger]")) {
    if (trigger instanceof HTMLElement) {
      trigger.addEventListener("click", () => {
        // If the trigger lives inside the mobile menu, close it first so the
        // dialog opens over a clean surface.
        const details = trigger.closest("details");
        if (details) {
          details.open = false;
        }
        open(trigger);
      });
    }
  }

  document.addEventListener("keydown", (event) => {
    const isShortcut =
      (event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k";
    if (!isShortcut) {
      return;
    }
    event.preventDefault();
    if (dialog.open) {
      close();
    } else {
      open(
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null,
      );
    }
  });

  input.addEventListener("input", () => applyFilter(input.value));

  // Backdrop click closes (the panel itself stops at the dialog element).
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      close();
    }
  });

  // Result activation keeps navigation native; emit a semantic hook only.
  dialog
    .querySelector("[data-command-list]")
    ?.addEventListener("click", (event) => {
      const link = (event.target as Element | null)?.closest("a");
      if (!link) {
        return;
      }
      const item = link.closest("[data-command-item]");
      window.dispatchEvent(
        new CustomEvent(OPEN_EVENT, {
          detail: {
            action: "result",
            kind: item?.getAttribute("data-command-kind") ?? "route",
          },
        }),
      );
    });

  // Focus returns to the invoking control after close (native Escape/backdrop
  // included); falls back to the first visible trigger.
  dialog.addEventListener("close", () => {
    const fallback = root.querySelector("[data-command-trigger]");
    const target =
      invoker && invoker.isConnected
        ? invoker
        : fallback instanceof HTMLElement
          ? fallback
          : null;
    target?.focus();
    invoker = null;
  });
}
