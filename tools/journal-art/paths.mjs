/** Paths shared by the renderer and the guards. */
export const SITE_ORIGIN = "https://blueskyzlabs.com";
export const MANIFEST_PATH = "src/data/journal-art.json";
export function artPath(post, name, lang) {
  return `public/images/journal/${post}/${name}.${lang}.webp`;
}
