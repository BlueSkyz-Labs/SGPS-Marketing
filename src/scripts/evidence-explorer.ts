/**
 * Elite Wave 3 — Interactive Evidence Explorer client.
 *
 * Progressive enhancement for [data-evidence-explorer]: turns the static
 * passport into an interactive verification chain (claim → sources → state
 * → boundary). ~8KB raw, zero dependencies.
 *
 * Contract:
 * - Fail closed: malformed JSON or missing nodes = static HTML stays.
 * - Keyboard: arrow keys move between steps, Enter/Space toggles.
 * - aria-expanded synced on step buttons (same pattern as language switcher).
 * - prefers-reduced-motion respected via CSS (no JS animation).
 * - i18n via data-msg-* attributes (4 locales, zero JS i18n lib).
 * - All state in-memory; no network, no storage.
 */

interface EvidenceRef {
  id: string;
  label: string;
  href: string;
}

interface EvidenceGraph {
  id: string;
  claim: string;
  state: string;
  reviewedOn: string | null;
  evidence: EvidenceRef[];
  hasBoundary: boolean;
}

export function initEvidenceExplorer(): void {
  if (typeof document === "undefined") return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    // Still enhance (keyboard/ARIA), CSS handles motion-off.
  }

  for (const root of document.querySelectorAll<HTMLElement>(
    "[data-evidence-explorer]",
  )) {
    if (root.hasAttribute("data-explorer-active")) continue;
    try {
      enhance(root);
    } catch {
      // Fail closed: static passport remains.
    }
  }
}

function enhance(root: HTMLElement): void {
  const graphEl = root.querySelector<HTMLScriptElement>(
    "[data-evidence-graph]",
  );
  const chain = root.querySelector<HTMLElement>("[data-evidence-chain]");
  const stepsOl = root.querySelector<HTMLOListElement>("[data-evidence-steps]");
  if (!graphEl || !chain || !stepsOl) return;

  let graph: EvidenceGraph;
  try {
    graph = JSON.parse(graphEl.textContent ?? "") as EvidenceGraph;
  } catch {
    return;
  }
  if (!graph || !graph.claim || !Array.isArray(graph.evidence)) return;

  const msgExpand = root.dataset.msgExpand ?? "Show details";
  const msgCollapse = root.dataset.msgCollapse ?? "Hide details";

  // Build steps: claim → sources → state → boundary (if present)
  const steps: { key: string; title: string; body: HTMLElement }[] = [];

  // Step 1: claim (already visible as heading; step links to it)
  const claimStep = document.createElement("div");
  claimStep.textContent = graph.claim;
  steps.push({ key: "claim", title: "1", body: claimStep });

  // Step 2: sources
  const sourcesDiv = document.createElement("div");
  const sourcesUl = document.createElement("ul");
  for (const ref of graph.evidence) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = ref.href;
    a.textContent = ref.label;
    if (/^https?:\/\//i.test(ref.href)) a.rel = "noopener noreferrer";
    li.appendChild(a);
    sourcesUl.appendChild(li);
  }
  sourcesDiv.appendChild(sourcesUl);
  steps.push({ key: "sources", title: "2", body: sourcesDiv });

  // Step 3: state
  const stateDiv = document.createElement("div");
  stateDiv.textContent = graph.state;
  if (graph.reviewedOn) {
    const t = document.createElement("time");
    t.dateTime = graph.reviewedOn;
    t.textContent = ` — ${graph.reviewedOn}`;
    stateDiv.appendChild(t);
  }
  steps.push({ key: "state", title: "3", body: stateDiv });

  // Step 4: boundary (if present)
  if (graph.hasBoundary) {
    const bDiv = document.createElement("div");
    const staticBoundary = root.querySelector("[data-evidence-static-boundary]");
    if (staticBoundary) {
      bDiv.appendChild(staticBoundary.cloneNode(true));
    }
    steps.push({ key: "boundary", title: "4", body: bDiv });
  }

  // Render stepper
  stepsOl.innerHTML = "";
  const buttons: HTMLButtonElement[] = [];
  steps.forEach((step, i) => {
    const li = document.createElement("li");
    li.className = "evidence-explorer__step";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "evidence-explorer__step-btn";
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-controls", `ee-panel-${graph.id}-${i}`);

    const num = document.createElement("span");
    num.className = "evidence-explorer__step-num";
    num.textContent = step.title;
    num.setAttribute("aria-hidden", "true");

    const label = document.createElement("span");
    label.className = "evidence-explorer__step-label";
    label.textContent = step.key;

    const chev = document.createElement("span");
    chev.className = "evidence-explorer__step-chev";
    chev.setAttribute("aria-hidden", "true");
    chev.textContent = "▾";

    btn.append(num, label, chev);

    const panel = document.createElement("div");
    panel.id = `ee-panel-${graph.id}-${i}`;
    panel.className = "evidence-explorer__step-panel";
    panel.hidden = true;
    panel.appendChild(step.body);

    btn.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") === "true";
      // Accordion: close others
      for (const b of buttons) {
        b.setAttribute("aria-expanded", "false");
        b.setAttribute("aria-label", msgExpand);
        const p = document.getElementById(
          b.getAttribute("aria-controls") ?? "",
        );
        if (p) p.hidden = true;
      }
      if (!open) {
        btn.setAttribute("aria-expanded", "true");
        btn.setAttribute("aria-label", msgCollapse);
        panel.hidden = false;
      }
    });

    // Keyboard: arrows move between steps
    btn.addEventListener("keydown", (e: KeyboardEvent) => {
      const idx = buttons.indexOf(btn);
      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        e.preventDefault();
        buttons[(idx + 1) % buttons.length]?.focus();
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        e.preventDefault();
        buttons[(idx - 1 + buttons.length) % buttons.length]?.focus();
      }
    });

    li.append(btn, panel);
    stepsOl.appendChild(li);
    buttons.push(btn);
  });

  // Activate: show chain (CSS hides static sections when active)
  chain.hidden = false;
  root.setAttribute("data-explorer-active", "true");
}
