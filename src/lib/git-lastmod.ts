/**
 * Sitemap `<lastmod>` from git history (v8 W8, SEO-10).
 *
 * Build-time only (imported by `sitemap.xml.ts`, never by a page). The date is
 * the committer date of the newest commit touching the route's own source
 * files. It is omitted, never guessed, whenever it cannot be accurate: a
 * shallow clone (history truncated), no git, no tracked source file, or a
 * value outside [LASTMOD_FLOOR, today]. Build time is never used.
 */
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

/** First date the site could have published; anything earlier is bogus. */
export const LASTMOD_FLOOR = "2026-08-01";

export type GitRunner = (args: string[]) => string;

const defaultRunner: GitRunner = (args) =>
  execFileSync("git", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  }).trim();

/** Source files that determine a public route's content. */
export function routeSourceFiles(
  path: string,
  exists: (file: string) => boolean = existsSync,
): string[] {
  const clean = path.replace(/^\/+|\/+$/g, "");
  const segments = clean === "" ? [] : clean.split("/");
  const candidates: string[] = [];
  const [lang, section, id, leaf] = segments;
  if (segments.length === 0) {
    candidates.push("src/pages/index.astro");
  } else if (section === "products" && id && leaf === "guide") {
    candidates.push(
      `src/pages/${lang}/products/[slug]/guide.astro`,
      `src/content/products/${id}.yaml`,
      `src/content/showcases/${id}.yaml`,
    );
  } else if (section === "products" && id && !leaf) {
    candidates.push(
      `src/pages/${lang}/products/[slug].astro`,
      `src/content/products/${id}.yaml`,
    );
  } else if ((section === "evidence" || section === "editions") && id) {
    candidates.push(`src/pages/${lang}/${section}/[id].astro`);
  } else {
    candidates.push(
      `src/pages/${clean}.astro`,
      `src/pages/${clean}/index.astro`,
    );
  }
  return candidates.filter((file) => exists(file));
}

/** `YYYY-MM-DD` or `undefined` when no accurate date exists. */
export function gitLastmod(
  files: string[],
  options: { run?: GitRunner; today?: string } = {},
): string | undefined {
  const run = options.run ?? defaultRunner;
  const today = options.today ?? new Date().toISOString().slice(0, 10);
  if (files.length === 0) return undefined;
  try {
    if (run(["rev-parse", "--is-shallow-repository"]) !== "false") {
      return undefined;
    }
    const date = run(["log", "-1", "--format=%cs", "--", ...files]);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return undefined;
    if (date < LASTMOD_FLOOR || date > today) return undefined;
    return date;
  } catch {
    return undefined;
  }
}

/** Per-URL-path lastmod resolver with a single shallow check per build. */
export function lastmodForPath(
  path: string,
  options: { run?: GitRunner; today?: string } = {},
): string | undefined {
  return gitLastmod(routeSourceFiles(path), options);
}
