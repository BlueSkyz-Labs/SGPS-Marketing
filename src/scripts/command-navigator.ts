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

const WORD_SPLIT = /[^\p{L}\p{N}]+/u;
const CJK = /[\u3400-\u9fff]/u;

function words(value: string): string[] {
  return value.split(WORD_SPLIT).filter((word) => word.length > 0);
}

/**
 * Whole-word / word-prefix match on accent-folded text (never a substring
 * inside a word). Short tokens (< 4 chars) must be whole words. A token the
 * visitor typed with accents ("giá") must also match accent-sensitively, so it
 * cannot match "giao". CJK text has no word breaks and uses substring.
 */
function tokenMatches(token: string, text: string): boolean {
  if (text.length === 0) return false;
  if (CJK.test(token)) return text.toLocaleLowerCase().includes(token);
  const accented = token.normalize("NFC") !== normalize(token);
  const folded = words(normalize(text));
  const raw = accented ? words(text.toLocaleLowerCase().normalize("NFC")) : [];
  const foldedToken = normalize(token);
  return folded.some((word, index) => {
    const exact = word === foldedToken;
    const prefix = foldedToken.length >= 4 && word.startsWith(foldedToken);
    if (!exact && !prefix) return false;
    if (!accented) return true;
    const original = raw[index] ?? "";
    return (
      original === token ||
      (foldedToken.length >= 4 && original.startsWith(token))
    );
  });
}

/** 0 = no match; title 3 > keywords 2 > body text 1. */
function scoreItem(tokens: string[], item: Element): number {
  const title = item.getAttribute("data-title") ?? "";
  const keys = item.getAttribute("data-keys") ?? "";
  const body = item.getAttribute("data-body") ?? "";
  let total = 0;
  for (const token of tokens) {
    const tier = [title, keys, body].findIndex((text) =>
      tokenMatches(token, text),
    );
    if (tier < 0) return 0;
    total += 3 - tier;
  }
  return total;
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
  const live = dialog.querySelector("[data-command-live]");
  const empty = dialog.querySelector("[data-command-empty]");
  const items = Array.from(dialog.querySelectorAll("[data-command-item]"));
  if (!(input instanceof HTMLInputElement) || items.length === 0) {
    return;
  }

  let invoker: HTMLElement | null = null;

  const list = dialog.querySelector("[data-command-list]");
  const status = dialog.querySelector("[data-command-status]");
  const fallback = dialog.querySelector("[data-command-fallback]");
  const intents = (status?.getAttribute("data-intents") ?? "")
    .split("|")
    .filter((entry) => entry.length > 0);
  const originalOrder = items.slice();

  const applyFilter = (query: string): void => {
    const lowered = query.trim().toLocaleLowerCase();
    const tokens = words(lowered);
    const isEmptyQuery = lowered.length === 0;
    // Emoji/punctuation can produce no tokens. That is not a blank search.
    const rank = (item: Element): number => {
      if (isEmptyQuery) return 1;
      if (tokens.length === 0) return 0;
      return scoreItem(tokens, item);
    };
    let visibleCount = 0;
    const scored = originalOrder.map((item, index) => ({
      item,
      index,
      score: rank(item),
    }));
    for (const { item, score } of scored) {
      if (item instanceof HTMLElement) {
        item.hidden = score === 0;
      }
      if (score > 0) {
        visibleCount += 1;
      }
    }
    if (list) {
      // Rank title hits above keyword hits above body hits; stable otherwise.
      scored
        .sort((a, b) => b.score - a.score || a.index - b.index)
        .forEach(({ item }) => list.appendChild(item));
    }
    if (empty instanceof HTMLElement) {
      empty.hidden = visibleCount > 0;
    }
    if (fallback instanceof HTMLElement) {
      fallback.hidden = visibleCount > 0;
    }
    if (status instanceof HTMLElement) {
      const folded = ` ${words(normalize(lowered)).join(" ")} `;
      // A status-intent word keeps the availability line even when the query
      // also finds a product through its published text (e.g. "download").
      status.hidden = !intents.some((intent) =>
        folded.includes(` ${normalize(intent)} `),
      );
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

  const visibleLinks = (): HTMLAnchorElement[] =>
    items
      .filter((item) => item instanceof HTMLElement && !item.hidden)
      .map((item) => item.querySelector("a"))
      .filter((link): link is HTMLAnchorElement => link !== null);

  // Keyboard-first: Enter opens the first visible result, arrows move through
  // results (links stay ordinary links; Tab still works).
  dialog.addEventListener("keydown", (event) => {
    const links = visibleLinks();
    if (event.key === "Enter" && event.target === input) {
      event.preventDefault();
      links[0]?.click();
      return;
    }
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    if (links.length === 0) return;
    event.preventDefault();
    const index = links.findIndex((link) => link === document.activeElement);
    const next =
      event.key === "ArrowDown"
        ? index < 0
          ? 0
          : Math.min(index + 1, links.length - 1)
        : index <= 0
          ? -1
          : index - 1;
    if (next < 0) input.focus();
    else links[next]?.focus();
  });

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
    const compactSummary = root.querySelector("header details summary");
    // Focus must land on something visible: the invoking control when it is
    // still rendered, otherwise the compact menu summary (mobile close).
    const candidates: Array<unknown> = [invoker, fallback, compactSummary];
    const target = candidates.find(
      (candidate): candidate is HTMLElement =>
        candidate instanceof HTMLElement &&
        candidate.isConnected &&
        // checkVisibility() understands content-visibility:hidden (closed
        // <details>), where offsetParent still reports a box.
        candidate.checkVisibility(),
    );
    invoker = null;
    // The native dialog close restores focus to the previously focused
    // element first (which may be hidden inside a closed menu); apply our
    // visible-candidate focus on the next task so it wins deterministically.
    setTimeout(() => {
      target?.focus();
    }, 0);
  });
}
