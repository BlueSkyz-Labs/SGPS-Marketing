import type { Language } from "../data/site.ts";
import { isCanonicalAppSignInUrl } from "./app-access-url.ts";
import { lifecycleCtaVerbLabel } from "./lifecycle-cta.ts";

/**
 * Owner 2026-10-24 (O-03): the product page offers a way into the live app
 * only when the record says new visitors may sign up (`appAccess.publicSignup`,
 * default false). Owner decision #575 stands: no public sign-in link, so with
 * the flag false (Sổ Trọ today) this returns null and the page is unchanged.
 * When true, the action points at the origin of the record's canonical
 * `signInUrl` (never the sign-in path) and reuses the existing `try` label.
 * Presentation only: it creates no availability or access truth.
 */
export interface AppOpenAction {
  href: string;
  label: string;
}

export function appOpenAction(
  slug: string,
  appAccess:
    { publicSignup?: boolean; signInUrl?: string | undefined } | undefined,
  lang: Language,
): AppOpenAction | null {
  if (appAccess?.publicSignup !== true) return null;
  const signInUrl = appAccess.signInUrl;
  if (!signInUrl || !isCanonicalAppSignInUrl(slug, signInUrl)) return null;
  return {
    href: `${new URL(signInUrl).origin}/`,
    label: lifecycleCtaVerbLabel("try", lang),
  };
}
