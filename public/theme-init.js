/** Apply an explicitly saved theme before first paint. No storage writes or remote access. */
try {
  const mode = localStorage.getItem("blueskyz-theme");
  if (mode === "light" || mode === "dark") {
    document.documentElement.setAttribute("data-theme", mode);
  }
} catch {
  // Storage is optional; CSS continues to follow the operating-system preference.
}
