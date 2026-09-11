/**
 * S+ conversion instrumentation taxonomy (Task 12B / issue #100).
 *
 * Transmission is intentionally DISABLED: no analytics provider or privacy
 * approval exists yet, so this module only validates, deduplicates, and
 * exposes typed events as DOM CustomEvents (blueskyz:telemetry). No network
 * calls, no storage, no cookies, no free text, no personal data. Callers
 * never depend on analytics success.
 */
export const ANALYTICS_EVENTS = [
  "intent_selected",
  "trust_route_opened",
  "journey_action_opened",
  "command_navigator_opened",
  "command_result_opened",
  "atlas_node_opened",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[number];

export interface AnalyticsEvent {
  name: AnalyticsEventName;
  properties: Record<string, string>;
}

const ALLOWED_PROPERTIES: Record<AnalyticsEventName, readonly string[]> = {
  intent_selected: ["intent"],
  trust_route_opened: ["surface"],
  journey_action_opened: ["kind", "destination"],
  command_navigator_opened: [],
  command_result_opened: ["kind"],
  atlas_node_opened: ["kind"],
};

const DEDUPE_WINDOW_MS = 1000;
const MAX_VALUE_LENGTH = 64;
const lastEmittedAt = new Map<string, number>();

function isEventName(value: string): value is AnalyticsEventName {
  return (ANALYTICS_EVENTS as readonly string[]).includes(value);
}

export function sanitizeAnalyticsEvent(
  name: string,
  properties: Record<string, unknown> = {},
): AnalyticsEvent | null {
  if (!isEventName(name)) {
    return null;
  }
  const safe: Record<string, string> = {};
  for (const key of ALLOWED_PROPERTIES[name]) {
    const raw = properties[key];
    if (
      typeof raw === "string" &&
      raw.length > 0 &&
      raw.length <= MAX_VALUE_LENGTH
    ) {
      safe[key] = raw;
    }
  }
  return { name, properties: safe };
}

export function emitAnalyticsEvent(
  name: string,
  properties: Record<string, unknown> = {},
  now: number = Date.now(),
): boolean {
  try {
    const event = sanitizeAnalyticsEvent(name, properties);
    if (!event) {
      return false;
    }
    const key = `${event.name}:${JSON.stringify(event.properties)}`;
    const previous = lastEmittedAt.get(key);
    if (previous !== undefined && now - previous < DEDUPE_WINDOW_MS) {
      return false;
    }
    lastEmittedAt.set(key, now);
    document.dispatchEvent(
      new CustomEvent("blueskyz:telemetry", { detail: event }),
    );
    return true;
  } catch {
    return false;
  }
}
