/**
 * S+ analytics bridge (Task 12B / issue #100).
 * Converts first-party interaction signals into validated taxonomy events.
 * Best-effort only: emission must never affect navigation or interaction.
 */
import { emitAnalyticsEvent } from "@/lib/analytics";

export function initAnalyticsBridge(): void {
  if (document.documentElement.hasAttribute("data-analytics-bridge")) {
    return;
  }
  document.documentElement.setAttribute("data-analytics-bridge", "");

  // The intent/navigator enhancers dispatch their semantic hooks on `window`
  // (non-bubbling CustomEvents), so the bridge listens there.
  window.addEventListener("blueskyz:intent", (event) => {
    const detail = (event as CustomEvent<{ intent?: string }>).detail;
    emitAnalyticsEvent("intent_selected", { intent: detail?.intent });
  });

  window.addEventListener("blueskyz:navigator", (event) => {
    const detail = (event as CustomEvent<{ action?: string; kind?: string }>)
      .detail;
    if (detail?.action === "open") {
      emitAnalyticsEvent("command_navigator_opened", {});
    } else if (detail?.action === "result") {
      emitAnalyticsEvent("command_result_opened", { kind: detail.kind });
    }
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    const trustLink = target.closest("[data-trust-ledger] a");
    if (trustLink) {
      const row = trustLink.closest("[data-trust-surface]");
      emitAnalyticsEvent("trust_route_opened", {
        surface: row?.getAttribute("data-trust-surface") ?? undefined,
      });
    }

    const journeyLink = target.closest("[data-journey-bar] a");
    if (journeyLink) {
      const href = journeyLink.getAttribute("href") ?? "";
      const destination = href.split("/").filter(Boolean).pop() ?? "";
      emitAnalyticsEvent("journey_action_opened", {
        kind: "route",
        destination,
      });
    }

    const atlasLink = target.closest("[data-atlas-node] a");
    if (atlasLink) {
      const row = atlasLink.closest("[data-atlas-node]");
      emitAnalyticsEvent("atlas_node_opened", {
        kind: row?.getAttribute("data-atlas-kind") ?? undefined,
      });
    }
  });
}
