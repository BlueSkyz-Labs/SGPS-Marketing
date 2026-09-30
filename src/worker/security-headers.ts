/**
 * Security headers for Worker-generated responses (the root redirect).
 *
 * Workers Static Assets applies `public/_headers` ONLY to asset responses, so a
 * response the Worker builds itself must carry its own copy. This is a mirror
 * of the `/*` block in `public/_headers`; tests/architecture/root-locale-worker
 * fails if the two drift apart. `public/_headers` stays the source of truth.
 */
export const SECURITY_HEADERS: readonly (readonly [string, string])[] = [
  ["X-Content-Type-Options", "nosniff"],
  ["X-Frame-Options", "DENY"],
  ["Referrer-Policy", "strict-origin-when-cross-origin"],
  [
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
  ],
  ["Strict-Transport-Security", "max-age=31536000; includeSubDomains"],
  [
    "Content-Security-Policy",
    "default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none'; img-src 'self' data:; font-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self'; form-action 'self'",
  ],
];
