/** Apply an explicitly saved theme before first paint. */
try {
  const mode = localStorage.getItem("blueskyz-theme");
  if (mode === "light" || mode === "dark") {
    document.documentElement.setAttribute("data-theme", mode);
  }
} catch {
  // Storage is optional; CSS continues to follow the operating-system preference.
}

/**
 * Engine-aware font preload. No storage writes and no remote access.
 */
try {
  const ua = navigator.userAgent ?? "";
  const sharesFontPreloadCache =
    !/AppleWebKit/.test(ua) || /Chrome|Chromium|CriOS|Edg|OPR/.test(ua);
  if (sharesFontPreloadCache) {
    const lang = document.documentElement.lang || "en";
    const subsets = lang === "vi" ? ["latin", "vietnamese"] : ["latin"];
    for (const subset of subsets) {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "font";
      link.type = "font/woff2";
      link.crossOrigin = "anonymous";
      link.href = `/fonts/inter-${subset}-opsz-v5.3.0.woff2`;
      document.head.appendChild(link);
    }
  }
} catch {
  // Presentation-only enhancement; the @font-face discovery still loads the font.
}
