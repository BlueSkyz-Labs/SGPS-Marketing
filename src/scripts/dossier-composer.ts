import type { Language } from "../lib/i18n";
import {
  parseDossierSearch,
  writeSelectionToUrl,
} from "../lib/dossier-url-state";

/**
 * C4-C Task 2 — local dossier composer.
 *
 * Progressive enhancement only: the catalog, every item's canonical
 * destination and the no-JS explanation are server-rendered semantic HTML.
 * This module coordinates selection and presentation, nothing else.
 *
 * It never transmits, never persists and never loads remote code. Selection
 * arrives only through validated query parameters, and an id that is not in the
 * rendered allowlist fails closed: it is reported, never composed.
 */

interface ComposerElements {
  form: HTMLFormElement;
  preview: HTMLElement;
  unknown: HTMLElement;
  counter: HTMLElement;
}

const SELECTION_PARAM = "items";

function readElements(): ComposerElements | null {
  const form = document.querySelector<HTMLFormElement>("[data-dossier-form]");
  const preview = document.querySelector<HTMLElement>("[data-dossier-preview]");
  const unknown = document.querySelector<HTMLElement>("[data-dossier-unknown]");
  const counter = document.querySelector<HTMLElement>("[data-dossier-counter]");
  if (!form || !preview || !unknown || !counter) return null;
  return { form, preview, unknown, counter };
}

/** The allowlist is exactly what the server rendered — nothing more. */
function allowlistedIds(form: HTMLFormElement): Set<string> {
  const ids = new Set<string>();
  for (const input of form.querySelectorAll<HTMLInputElement>(
    "[data-dossier-item]",
  )) {
    if (input.value) ids.add(input.value);
  }
  return ids;
}

function requestedSelection() {
  return parseDossierSearch(window.location.search, SELECTION_PARAM);
}

function entryTemplate(id: string): HTMLTemplateElement | null {
  return document.querySelector<HTMLTemplateElement>(
    `template[data-dossier-entry="${id.replace(/"/g, '\\"')}"]`,
  );
}

function render(elements: ComposerElements): string[] {
  const selected = [
    ...elements.form.querySelectorAll<HTMLInputElement>("[data-dossier-item]"),
  ]
    .filter((input) => input.checked)
    .map((input) => input.value);

  elements.preview.replaceChildren();
  for (const id of selected) {
    const template = entryTemplate(id);
    if (!template) continue;
    elements.preview.append(template.content.cloneNode(true));
  }
  elements.counter.textContent = String(selected.length);
  elements.preview.toggleAttribute("data-empty", selected.length === 0);
  return selected;
}

function applyUrlState(elements: ComposerElements): void {
  const allowed = allowlistedIds(elements.form);
  const requested = requestedSelection();
  const accepted: string[] = [];
  const rejected: string[] = [];

  if (requested.status === "ok") {
    for (const id of requested.ids) {
      if (allowed.has(id)) {
        accepted.push(id);
      } else {
        // Fail closed: an id outside the rendered allowlist is reported, never composed.
        rejected.push(id);
      }
    }
  }

  for (const input of elements.form.querySelectorAll<HTMLInputElement>(
    "[data-dossier-item]",
  )) {
    input.checked = accepted.includes(input.value);
  }

  elements.unknown.replaceChildren();
  if (requested.status === "rejected") {
    const item = document.createElement("li");
    item.dataset.dossierRequestRejected = requested.reason;
    item.textContent =
      elements.unknown.dataset.dossierInvalidMessage ??
      "Selection request rejected.";
    elements.unknown.append(item);
  } else {
    for (const id of rejected) {
      const item = document.createElement("li");
      item.textContent = id;
      elements.unknown.append(item);
    }
  }
  const hideUnknown = requested.status !== "rejected" && rejected.length === 0;
  elements.unknown.toggleAttribute("hidden", hideUnknown);
  // The heading lives in the wrapper; it must follow the list, never outlive it.
  elements.unknown
    .closest<HTMLElement>("[data-dossier-unknown-block]")
    ?.toggleAttribute("hidden", hideUnknown);
}

export function initDossierComposer(): void {
  const elements = readElements();
  if (!elements) return;

  applyUrlState(elements);
  render(elements);

  elements.form.addEventListener("change", () => {
    // Replace, never push: Back must leave the page, not step through ticks.
    writeSelectionToUrl(window, SELECTION_PARAM, render(elements));
  });
  elements.form.addEventListener("submit", (event) => {
    // Composition is local: the form must never navigate or transmit.
    event.preventDefault();
    render(elements);
  });
}

initDossierComposer();

export type { Language };
