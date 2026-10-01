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
 * Order matters: the display face (hero H1, the LCP element) is requested
 * first so the 74 KB Inter Latin transfer cannot queue ahead of it.
 */
try {
  const ua = navigator.userAgent ?? "";
  const sharesFontPreloadCache =
    !/AppleWebKit/.test(ua) || /Chrome|Chromium|CriOS|Edg|OPR/.test(ua);
  if (sharesFontPreloadCache) {
    const lang = document.documentElement.lang || "en";
    const subsets = lang === "vi" ? ["latin", "vietnamese"] : ["latin"];
    const preload = (href) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "font";
      link.type = "font/woff2";
      link.crossOrigin = "anonymous";
      link.href = href;
      document.head.appendChild(link);
    };
    for (const subset of subsets) {
      preload(`/fonts/plus-jakarta-sans-${subset}-700-v5.3.0.woff2`);
    }
    for (const subset of subsets) {
      preload(`/fonts/inter-${subset}-opsz-v5.3.0.woff2`);
    }
  }
} catch {
  // Presentation-only enhancement; the @font-face discovery still loads the font.
}
