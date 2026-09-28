import { CANONICAL_PUBLIC_SITE_ORIGIN } from "./truth.ts";

/**
 * Marketing product records may use their own EN profile as the card's
 * preview destination. That destination is useful while browsing a product
 * list but is a redundant/self-loop CTA once the visitor is on its detail
 * page (including localized VI/ZH variants).
 *
 * This detects only the canonical first-party profile, not actual product
 * sign-in URLs or unrelated approved proof/action destinations. It does not
 * turn source/URL shape into evidence that an app is deployed.
 */
export function isRedundantProductProfileLink(
  href: string,
  slug: string,
): boolean {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return false;
  try {
    const url = new URL(href);
    return (
      url.origin === CANONICAL_PUBLIC_SITE_ORIGIN &&
      url.username === "" &&
      url.password === "" &&
      url.search === "" &&
      url.hash === "" &&
      new RegExp(`^/(?:en|vi|zh)/products/${slug}/?$`).test(url.pathname)
    );
  } catch {
    return false;
  }
}
