/**
 * Public application destinations are an authority boundary, not a generic
 * HTTPS link. Keep this helper independent of the content loader so negative
 * cases can be exercised without a provider, browser or customer data.
 *
 * Passing this check proves URL shape/host only. It does NOT prove that the
 * destination is deployed, belongs to a verified merchant/developer account,
 * accepts real users, or has been approved for publication by the Owner.
 */
export type MobileAppPlatform = "android" | "ios";

function parsePublicDestination(value: string): URL | null {
  if (value !== value.trim()) return null;
  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      url.username !== "" ||
      url.password !== "" ||
      url.port !== "" ||
      url.hash !== ""
    ) {
      return null;
    }
    return url;
  } catch {
    return null;
  }
}

/** Sign-in links cannot silently cross from a product to another authority. */
export function isCanonicalAppSignInUrl(
  productSlug: string,
  value: string,
): boolean {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(productSlug)) return false;
  const url = parsePublicDestination(value);
  return (
    url !== null &&
    url.hostname === `${productSlug}.blueskyzlabs.com` &&
    url.pathname !== "/" &&
    url.search === ""
  );
}

/** A store-labelled link must resolve to that platform's official store. */
export function isOfficialMobileStoreUrl(
  platform: MobileAppPlatform,
  value: string,
): boolean {
  const url = parsePublicDestination(value);
  if (!url) return false;
  if (platform === "android") {
    return (
      url.hostname === "play.google.com" &&
      url.pathname === "/store/apps/details" &&
      Boolean(url.searchParams.get("id"))
    );
  }
  if (platform === "ios") {
    return (
      url.hostname === "apps.apple.com" &&
      /^\/(?:[a-z]{2}(?:-[a-z]{2})?\/)?app\/(?:[^/]+\/)?id[0-9]+\/?$/.test(
        url.pathname,
      )
    );
  }
  return false;
}
