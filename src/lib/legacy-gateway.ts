import { resolveInitialLanguage } from "./i18n.ts";

/**
 * Unprefixed legacy routes served as a locale gateway (UX U8 / red-team C-02).
 *
 * Before: `/about`, `/contact`, ... answered a fixed 301 to `/en/...`, so a
 * Vietnamese visitor opening a shared unprefixed link landed in English.
 * Now each route is a static page that applies the SAME first-visit
 * resolution as the root gateway (SGPS-DEC-2026-019, ADR 0009):
 * saved choice -> supported browser language -> optional coarse country hint
 * -> English. There is no edge worker and no cookie; with JavaScript off the
 * page falls back to English and lists the four localized links.
 */
export const LEGACY_GATEWAY_ROUTES = [
  "/about/",
  "/contact/",
  "/privacy/",
  "/security/",
  "/support/",
  "/products/",
] as const;

export type LegacyGatewayRoute = (typeof LEGACY_GATEWAY_ROUTES)[number];

export function isLegacyGatewayRoute(
  value: string,
): value is LegacyGatewayRoute {
  return (LEGACY_GATEWAY_ROUTES as readonly string[]).includes(value);
}

export interface LegacyGatewayInput {
  route: string;
  stored: string | null;
  languages: readonly string[];
  country?: string | null;
  search?: string;
  hash?: string;
}

/** Destination for an unprefixed legacy route; unknown routes fail closed to /en/. */
export function legacyGatewayTarget(input: LegacyGatewayInput): string {
  const route = isLegacyGatewayRoute(input.route) ? input.route : "/";
  const language = resolveInitialLanguage(
    input.stored,
    input.languages,
    input.country,
  );
  const search = input.search?.startsWith("?") ? input.search : "";
  const hash = input.hash?.startsWith("#") ? input.hash : "";
  return `/${language}${route}${search}${hash}`;
}
