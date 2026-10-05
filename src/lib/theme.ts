/**
 * W3 — theme runtime. Light/Dark/System, persisted, CSP-safe.
 *
 * One-icon control (SGPS-DEC-2026-037 HC-7): `toggleTheme` flips the RESOLVED
 * theme; when the new theme equals the OS preference it returns to System
 * (stored choice cleared), so automatic behaviour needs no third option.
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

/**
 * Apply a mode to the document and persist it. System removes the attribute
 * and the stored choice (no stored key means "follow the OS").
 */
export function applyTheme(mode: ThemeMode, persist = true): void {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (mode === "dark") root.setAttribute("data-theme", "dark");
  else if (mode === "light") root.setAttribute("data-theme", "light");
  else root.removeAttribute("data-theme");
  if (persist) {
    try {
      if (mode === "system") localStorage.removeItem(STORAGE_KEY);
      else localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      /* storage unavailable (private mode): the session still applies */
    }
  }
}

/** The theme actually painted: the pinned mode, else the OS preference. */
export function resolvedTheme(
  mode: ThemeMode,
  osDark: boolean,
): "light" | "dark" {
  if (mode === "light" || mode === "dark") return mode;
  return osDark ? "dark" : "light";
}

/**
 * The mode one press of the icon leads to: the opposite of the resolved
 * theme, or System when that opposite is what the OS already prefers.
 */
export function nextTheme(mode: ThemeMode, osDark: boolean): ThemeMode {
  const target = resolvedTheme(mode, osDark) === "dark" ? "light" : "dark";
  const os = osDark ? "dark" : "light";
  return target === os ? "system" : target;
}

/** Resolve the initial mode from storage (default System) and apply it. */
export function initTheme(): ThemeMode {
  const mode = storedTheme() ?? "system";
  applyTheme(mode, false);
  return mode;
}
