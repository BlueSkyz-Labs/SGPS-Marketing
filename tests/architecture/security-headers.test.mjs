import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("static responses carry a safe baseline header set", () => {
  const headers = readFileSync("public/_headers", "utf8");
  assert.match(headers, /X-Content-Type-Options:\s*nosniff/);
  assert.match(headers, /X-Frame-Options:\s*DENY/);
  assert.match(headers, /Referrer-Policy:\s*strict-origin-when-cross-origin/);
  assert.match(headers, /Permissions-Policy:/);
  assert.match(headers, /payment=\(\)/);
  // interest-cohort (FLoC) was removed from the Permissions-Policy spec; the
  // Topics API successor is opted out instead.
  assert.doesNotMatch(headers, /interest-cohort/);
  assert.match(headers, /browsing-topics=\(\)/);
  assert.match(
    headers,
    /Strict-Transport-Security:\s*max-age=31536000;\s*includeSubDomains/,
  );
  assert.doesNotMatch(headers, /preload/);
  assert.match(
    headers,
    /Content-Security-Policy:\s*default-src 'self'; base-uri 'self'; object-src 'none'; frame-ancestors 'none';/,
  );
  assert.match(headers, /script-src 'self'/);
  assert.match(headers, /style-src 'self' 'unsafe-inline'/);
  assert.match(headers, /X-Robots-Tag:\s*noindex/);
  assert.match(
    headers,
    /https:\/\/blueskyz-web\.thinhnguyen-km10\.workers\.dev\/\*/,
  );
  assert.match(
    headers,
    /https:\/\/:version\.:worker\.:account\.workers\.dev\/\*/,
  );
  assert.doesNotMatch(headers, /'unsafe-eval'/);
  const cspLine =
    headers
      .split(/\r?\n/)
      .map((line) => line.trim())
      .find((line) => line.startsWith("Content-Security-Policy:")) ?? "";
  assert.doesNotMatch(cspLine, /(?:^|[\s;])\*(?:[\s;]|$)/);

  // Hardening added for go-live (negative proofs below break each invariant).
  assert.match(cspLine, /(?:^|[\s;])upgrade-insecure-requests(?:[\s;]|$)/);
  assert.match(cspLine, /media-src 'self'(?:;|$)/);
  assert.match(headers, /Cross-Origin-Opener-Policy:\s*same-origin\s*$/m);
  assert.match(headers, /Cross-Origin-Resource-Policy:\s*same-site\s*$/m);
  // RT-07: Trusted Types enforcement (guarded by tests/architecture/trusted-types-sink-ban.test.mjs).
  assert.match(
    cspLine,
    /(?:^|[\s;])require-trusted-types-for 'script'(?:[\s;]|$)/,
  );
  assert.match(
    headers,
    /^\/_astro\/\*\n\s+Cache-Control:\s*public, max-age=31536000, immutable\s*$/m,
  );
});

test("header hardening negative proofs: weakened variants are detected", () => {
  const headers = readFileSync("public/_headers", "utf8");
  const csp = (h) =>
    h
      .split(/\r?\n/)
      .find((l) => l.trim().startsWith("Content-Security-Policy:")) ?? "";
  const hasUpgrade = (h) =>
    /(?:^|[\s;])upgrade-insecure-requests(?:[\s;]|$)/.test(csp(h));
  const hasMedia = (h) => /media-src 'self'(?:;|$)/.test(csp(h));
  const hasTrustedTypes = (h) =>
    /(?:^|[\s;])require-trusted-types-for 'script'(?:[\s;]|$)/.test(csp(h));
  const hasCoop = (h) =>
    /Cross-Origin-Opener-Policy:\s*same-origin\s*$/m.test(h);
  const hasCorp = (h) =>
    /Cross-Origin-Resource-Policy:\s*same-(?:site|origin)\s*$/m.test(h);
  const hasAstroCache = (h) =>
    /^\/_astro\/\*\n\s+Cache-Control:\s*public, max-age=31536000, immutable\s*$/m.test(
      h,
    );
  assert.ok(hasUpgrade(headers) && hasMedia(headers) && hasCoop(headers));
  assert.ok(hasCorp(headers) && hasAstroCache(headers));
  assert.equal(
    hasUpgrade(headers.replace("; upgrade-insecure-requests", "")),
    false,
  );
  assert.ok(hasTrustedTypes(headers));
  assert.equal(
    hasTrustedTypes(
      headers.replace("; require-trusted-types-for 'script'", ""),
    ),
    false,
  );
  assert.equal(hasMedia(headers.replace(" media-src 'self';", "")), false);
  assert.equal(
    hasMedia(headers.replace("media-src 'self'", "media-src *")),
    false,
  );
  assert.equal(
    hasCoop(headers.replace("Cross-Origin-Opener-Policy: same-origin", "")),
    false,
  );
  assert.equal(
    hasCorp(
      headers.replace(
        "Cross-Origin-Resource-Policy: same-site",
        "Cross-Origin-Resource-Policy: cross-origin",
      ),
    ),
    false,
  );
  assert.equal(hasAstroCache(headers.replace(", immutable", "")), false);
  assert.equal(hasAstroCache(headers.replace("/_astro/*", "/assets/*")), false);
});
