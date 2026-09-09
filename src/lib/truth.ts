export interface PublicTruthInput {
  siteUrl?: string;
  contactEmail?: string;
  securityEmail?: string;
}

export const CANONICAL_PUBLIC_SITE_ORIGIN = "https://blueskyzlabs.com";

/** RFC 2606 / common non-production hosts that must never pass a production truth gate. */
const RESERVED_HOST_SUFFIXES = [
  "example.com",
  "example.org",
  "example.net",
  "example",
  "invalid",
  "localhost",
  "test",
] as const;

function hostnameOf(siteUrl: string): string | null {
  try {
    return new URL(siteUrl).hostname.toLowerCase();
  } catch {
    return null;
  }
}

/** Normalize Node/browser hostname forms (`[::1]` → `::1`, trailing FQDN `.`). */
function bareHostname(hostname: string): string {
  let bare = hostname;
  if (bare.startsWith("[") && bare.endsWith("]")) {
    bare = bare.slice(1, -1);
  }
  // DNS root label: `demo.workers.dev.` is equivalent to `demo.workers.dev`.
  if (bare.endsWith(".") && bare !== ".") {
    bare = bare.slice(0, -1);
  }
  return bare;
}

function isLoopbackHost(hostname: string): boolean {
  const bare = bareHostname(hostname);
  return bare === "127.0.0.1" || bare === "::1" || bare === "localhost";
}

function isReservedDocumentationHost(hostname: string): boolean {
  if (isLoopbackHost(hostname)) return true;
  const bare = bareHostname(hostname);
  return RESERVED_HOST_SUFFIXES.some(
    (suffix) => bare === suffix || bare.endsWith(`.${suffix}`),
  );
}

/** Preview, staging, and retired temporary hosts that must never pass as production identity. */
function isPreviewOrStagingHost(hostname: string): boolean {
  const bare = bareHostname(hostname);
  return (
    bare === "workers.dev" ||
    bare.endsWith(".workers.dev") ||
    bare === "pages.dev" ||
    bare.endsWith(".pages.dev") ||
    bare === "tonydemo.com" ||
    bare.endsWith(".tonydemo.com")
  );
}

/**
 * Sites that must not be treated as indexable production identity.
 * Includes local/dev hosts, workers.dev / pages.dev previews, the retired
 * tonydemo.com zone, and RFC 2606 documentation domains.
 */
export function isNonProductionSiteUrl(siteUrl: string): boolean {
  const hostname = hostnameOf(siteUrl);
  if (!hostname) return true;
  if (isPreviewOrStagingHost(hostname)) return true;
  return isReservedDocumentationHost(hostname);
}

function isCanonicalPublicSiteUrl(value: string | undefined): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    return (
      url.protocol === "https:" &&
      bareHostname(url.hostname.toLowerCase()) === "blueskyzlabs.com" &&
      url.port === "" &&
      url.username === "" &&
      url.password === "" &&
      url.pathname === "/" &&
      url.search === "" &&
      url.hash === ""
    );
  } catch {
    return false;
  }
}

function isPlausibleEmail(value: string | undefined): boolean {
  if (!value) return false;
  // Minimal shape only — do not invent corporate addresses.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function validatePublicTruth(input: PublicTruthInput): string[] {
  const errors: string[] = [];
  if (!isCanonicalPublicSiteUrl(input.siteUrl)) {
    errors.push(
      `PUBLIC_SITE_URL must be the canonical BlueSkyz Labs origin ${CANONICAL_PUBLIC_SITE_ORIGIN}`,
    );
  }
  if (!isPlausibleEmail(input.contactEmail)) {
    errors.push("PUBLIC_CONTACT_EMAIL is required");
  }
  if (!isPlausibleEmail(input.securityEmail)) {
    errors.push("PUBLIC_SECURITY_EMAIL is required");
  }
  return errors;
}
