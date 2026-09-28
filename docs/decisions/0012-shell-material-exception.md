# ADR 0012 — Shell material exception (translucent header)

- **Status:** Accepted — Owner decision D-1, 2026-09-27 (Experience Convergence v5).
- **Context:** Brand Kit v4 requests a frosted header; the C4 material grammar forbids blur on content surfaces for legibility and performance.
- **Decision:** `.header-glass` is the only translucent material. It is sticky only at viewports at least 768px wide and 560px tall, and uses `backdrop-filter` only inside `@supports`. Unsupported browsers, `prefers-reduced-transparency`, forced-colors and the `static-premium` fidelity tier use an opaque surface. Content surfaces remain opaque; the experience spine is not an exception. Anchor targets use `scroll-margin`, not global `scroll-padding`, so focused and deep-linked content clears the shell without changing unrelated scroll behavior.
- **Consequences:** `tests/architecture/shell-material.test.mjs` guards the header-only blur, fallbacks, dark-mode wordmark and focus offset. No new origin, script or data flow is introduced.
- **Rollback:** remove the `.header-glass` material block and restore its opaque non-sticky baseline.
