/**
 * Capture viewer (UX P2-4): progressive enhancement for the sample-data
 * capture links. Without JavaScript the link keeps its plain href to the
 * image. With it, a plain click opens the same image in one shared native
 * <dialog> that has a visible close button, so in-app browsers (Zalo,
 * Facebook, Messenger) never strand the visitor on a bare image.
 *
 * Native modal semantics give the focus containment, Esc and focus return.
 * Built with DOM APIs only: no innerHTML, no inline script or style, so it is
 * Trusted Types and CSP safe. All text comes from data attributes rendered
 * from the existing capture data and locale copy.
 */
const SELECTOR = "a[data-capture-inspect]";

function build(): {
  dialog: HTMLDialogElement;
  img: HTMLImageElement;
  caption: HTMLElement;
  close: HTMLButtonElement;
} {
  const dialog = document.createElement("dialog");
  dialog.className = "capture-viewer";
  dialog.setAttribute("data-capture-viewer", "");
  const img = document.createElement("img");
  img.className = "capture-viewer__img";
  const caption = document.createElement("p");
  caption.className = "capture-viewer__caption";
  const close = document.createElement("button");
  close.type = "button";
  close.className = "capture-viewer__close";
  close.setAttribute("data-capture-viewer-close", "");
  dialog.append(img, caption, close);
  document.body.append(dialog);
  return { dialog, img, caption, close };
}

export function initCaptureViewer(root: Document = document): void {
  if (root.documentElement.hasAttribute("data-capture-viewer-ready")) return;
  root.documentElement.setAttribute("data-capture-viewer-ready", "");
  if (typeof HTMLDialogElement === "undefined") return;

  const originalSemantics = new WeakMap<
    HTMLAnchorElement,
    { label: string | null; haspopup: string | null }
  >();

  // Wire each link: with JS a plain click opens the dialog, so the "opens in
  // a new tab" suffix would be false. Without JS the original label stays.
  for (const link of root.querySelectorAll<HTMLAnchorElement>(SELECTOR)) {
    originalSemantics.set(link, {
      label: link.getAttribute("aria-label"),
      haspopup: link.getAttribute("aria-haspopup"),
    });
    const label = link.dataset.viewerLabel;
    if (label) link.setAttribute("aria-label", label);
    link.setAttribute("aria-haspopup", "dialog");
  }

  let parts: ReturnType<typeof build> | null = null;
  let trigger: HTMLElement | null = null;

  root.addEventListener("click", (event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    const target = event.target;
    if (!(target instanceof Element)) return;
    const link = target.closest<HTMLAnchorElement>(SELECTOR);
    if (!link) return;
    const href = link.getAttribute("href");
    if (!href) return;

    if (!parts) {
      parts = build();
      const { dialog } = parts;
      parts.close.addEventListener("click", () => dialog.close());
      // Backdrop click: the click lands on the dialog element itself.
      dialog.addEventListener("click", (e) => {
        if (e.target === dialog) dialog.close();
      });
      // The close button is the only tab stop: keep focus on it (a native
      // modal may otherwise hand focus to browser chrome).
      dialog.addEventListener("keydown", (e) => {
        if (e.key === "Tab") {
          e.preventDefault();
          parts?.close.focus();
        }
      });
      dialog.addEventListener("close", () => {
        // Do not flash a previous capture on the next modal opening.
        // Release the full-resolution source while the viewer is hidden.
        parts?.img.removeAttribute("src");
        // Native close restores focus; make it deterministic for engines
        // that do not.
        trigger?.focus();
        trigger = null;
      });
    }
    trigger = link;
    const { dialog, img, caption, close } = parts;
    img.alt = link.dataset.viewerAlt ?? "";
    caption.textContent = link.dataset.viewerTitle ?? "";
    close.textContent = link.dataset.viewerClose ?? "";
    close.setAttribute("aria-label", link.dataset.viewerClose ?? "");
    dialog.setAttribute("aria-label", link.dataset.viewerTitle ?? "");
    // Some in-app browsers expose <dialog> but fail when showModal() runs.
    // Intercept the native image link only after the modal opens successfully:
    // when enhancement fails, target="_blank" remains the honest fallback.
    try {
      if (!dialog.open) dialog.showModal();
    } catch {
      const original = originalSemantics.get(link);
      if (original?.label === null) link.removeAttribute("aria-label");
      else if (original) link.setAttribute("aria-label", original.label ?? "");
      if (original?.haspopup === null) link.removeAttribute("aria-haspopup");
      else if (original)
        link.setAttribute("aria-haspopup", original.haspopup ?? "");
      trigger = null;
      return;
    }
    event.preventDefault();
    // Load the full-resolution image only after successful enhancement.
    // A failed in-app modal must not start a duplicate download.
    img.src = href;
    close.focus();
  });
}

initCaptureViewer();
