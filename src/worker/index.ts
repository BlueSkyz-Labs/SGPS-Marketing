/**
 * Root-only locale gateway.
 *
 * wrangler.toml `run_worker_first = ["/", "/index.html"]` means ONLY those two
 * paths ever invoke this Worker; every other request is served straight from
 * static assets with no Worker invocation. The guard below is defence in depth:
 * anything that is not GET/HEAD on exactly `/` or `/index.html` is passed to
 * the assets binding untouched, and any unexpected error fails open to the
 * static client-side chooser (`src/pages/index.astro`).
 *
 * Privacy: the visitor's country (request.cf.country / CF-IPCountry) is read
 * in-flight to choose the redirect target. Nothing is stored, and this code
 * does not log it.
 */
import { resolveLocale } from "../lib/locale-resolve.ts";
import { SECURITY_HEADERS } from "./security-headers.ts";

interface AssetsBinding {
  fetch(request: Request): Promise<Response>;
}

export interface Env {
  ASSETS: AssetsBinding;
}

export const ROOT_PATHS: readonly string[] = ["/", "/index.html"];

export function buildRootRedirect(url: URL, language: string): Response {
  const headers = new Headers();
  headers.set("Location", `/${language}/${url.search}`);
  headers.set("Cache-Control", "private, no-store");
  headers.set("Vary", "Cookie, Accept-Language");
  for (const [name, value] of SECURITY_HEADERS) headers.set(name, value);
  return new Response(null, { status: 302, headers });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url);
      const isRootRead =
        (request.method === "GET" || request.method === "HEAD") &&
        ROOT_PATHS.includes(url.pathname);
      if (isRootRead) {
        const cf = (request as Request & { cf?: { country?: unknown } }).cf;
        const cfCountry = typeof cf?.country === "string" ? cf.country : null;
        const decision = resolveLocale({
          cookieHeader: request.headers.get("Cookie"),
          country: cfCountry ?? request.headers.get("CF-IPCountry"),
          acceptLanguage: request.headers.get("Accept-Language"),
          userAgent: request.headers.get("User-Agent"),
        });
        return buildRootRedirect(url, decision.language);
      }
    } catch {
      // Fail open to the static chooser rather than break the homepage.
    }
    return env.ASSETS.fetch(request);
  },
};
