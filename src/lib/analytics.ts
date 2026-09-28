/**
 * S+ conversion instrumentation taxonomy (Task 12B / issue #100).
 *
 * Transmission is intentionally DISABLED: no analytics provider or privacy
 * approval exists yet, so this module only validates, deduplicates, and
 * exposes typed events as DOM CustomEvents (blueskyz:telemetry). No network
 * calls, no storage, no cookies, no free text, no personal data. Callers
 * never depend on analytics success.
 */
import { EXPERIENCE_INTENTS } from "./experience-intent.ts";

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

/**
 * The property *names* are not a privacy guarantee: a free-form destination,
 * surface or kind could itself carry email, search or referral parameters.
 * Keep semantic dimensions closed over the first-party event vocabulary.
 * No visitor-provided text, raw URLs, query strings or identifiers.
 */
const ALLOWED_CATEGORY_VALUES: Partial<
  Record<AnalyticsEventName, Readonly<Record<string, readonly string[]>>>
> = {
  trust_route_opened: {
    surface: ["privacy", "security", "support"],
  },
  journey_action_opened: {
    kind: ["route"],
    destination: [
      "products",
      "decision-room",
      "about",
      "security",
      "contact",
      "support",
      "privacy",
    ],
  },
  command_result_opened: {
    kind: ["route", "trust", "product", "evidence"],
  },
  atlas_node_opened: {
    kind: ["brand", "principle", "trust", "claim", "evidence", "product"],
  },
};

const DEDUPE_WINDOW_MS = 1000;
const MAX_VALUE_LENGTH = 64;
const lastEmittedAt = new Map<string, number>();

function isEventName(value: string): value is AnalyticsEventName {
  return (ANALYTICS_EVENTS as readonly string[]).includes(value);
}

function isExperienceIntent(value: unknown): boolean {
  return (
    typeof value === "string" &&
    (EXPERIENCE_INTENTS as readonly string[]).includes(value)
  );
}

export function sanitizeAnalyticsEvent(
  name: string,
  properties: Record<string, unknown> = {},
): AnalyticsEvent | null {
  if (!isEventName(name)) {
    return null;
  }
  if (name === "intent_selected" && !isExperienceIntent(properties.intent)) {
    return null;
  }
  const safe: Record<string, string> = {};
  for (const key of ALLOWED_PROPERTIES[name]) {
    const raw = properties[key];
    if (raw === undefined) continue;
    if (
      typeof raw !== "string" ||
      raw.length === 0 ||
      raw.length > MAX_VALUE_LENGTH
    ) {
      return null;
    }
    const vocabulary = ALLOWED_CATEGORY_VALUES[name]?.[key];
    if (vocabulary && !vocabulary.includes(raw)) return null;
    safe[key] = raw;
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
