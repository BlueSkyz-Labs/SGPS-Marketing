/**
 * W3 — theme runtime. Light/Dark/System, persisted, CSP-safe.
 *
 * The palette is applied purely through CSS:
 *   - no attribute            → follow `prefers-color-scheme` (System), via the
 *                               media rule in global.css (no-JS first paint);
 *   - data-theme="light"      → force light;
 *   - data-theme="dark"       → force dark.
 * This module only writes the attribute + persistence; it never inline-paints
 * a page (so it cannot violate `script-src 'self'`).
 */

export type ThemeMode = "system" | "light" | "dark";

const STORAGE_KEY = "blueskyz-theme";

const isMode = (value: string | null): value is ThemeMode =>
  value === "system" || value === "light" || value === "dark";

/** A previously pinned mode, or null when the visitor is on System. */
export function storedTheme(): ThemeMode | null {
  try {
    const value =
      typeof localStorage === "undefined"
        ? null
        : localStorage.getItem(STORAGE_KEY);
    return isMode(value) ? value : null;
  } catch {
    return null;
  }
}

/** Apply a mode to the document and persist it. System removes the attribute. */
export function applyTheme(mode: ThemeMode): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (mode === "dark") root.setAttribute("data-theme", "dark");
  else if (mode === "light") root.setAttribute("data-theme", "light");
  else root.removeAttribute("data-theme");
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    /* storage unavailable (private mode): the session still applies */
  }
}

/** Resolve the initial mode from storage (default System) and apply it. */
export function initTheme(): ThemeMode {
  const mode = storedTheme() ?? "system";
  applyTheme(mode);
  return mode;
}
