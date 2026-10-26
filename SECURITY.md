# Security Policy

## Supported versions

Security fixes apply to the latest `main` deployment of BlueSkyz Labs Web (C1.1 product house).
Historical preview deployments (including workers.dev previews) are not independently supported.

## Transport security

Workers Static Assets ship `Strict-Transport-Security: max-age=31536000; includeSubDomains` via `public/_headers` so HTTPS responses advertise HSTS. The `preload` directive is deferred until a canonical corporate domain is ready for HSTS preload submission.

## Content Security Policy

Static assets ship a strict CSP via `public/_headers` (Workers Static Assets):

- `default-src 'self'`
- `script-src 'self'` (no third-party scripts)
- `style-src 'self' 'unsafe-inline'` — required for Astro/Tailwind inline critical CSS in the static HTML output
- no `'unsafe-eval'` and no wildcard origins

Widen a directive only when an approved source is introduced, and document the exact reason here.

## Reporting a vulnerability

Do not file a public GitHub issue or discussion for a security report.

Use GitHub private vulnerability reporting:

1. Open the **Security** tab on this repository.
2. Click **Report a vulnerability**.
3. Describe the affected surface, impact, and how to reproduce.

Direct form:
https://github.com/BlueSkyz-Labs/blueskyz-web/security/advisories/new

GitHub's reporter guide:
https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing/privately-reporting-a-security-vulnerability

Please wait for acknowledgement and a coordinated fix before any public
disclosure.
