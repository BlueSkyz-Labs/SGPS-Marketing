import { readdirSync, readFileSync } from "node:fs";

/**
 * Expected Journal state read straight from `src/content/journal/*.md`, so
 * specs stay exact as posts are added without pinning a count or an id. It
 * parses the frontmatter independently of the site's collection code: if the
 * rendered page drops, adds or reorders a post, the spec still fails.
 */
export interface JournalSourcePost {
  id: string;
  lang: string;
  branch: string;
  datePublished: string;
  sources: string[];
}

const DIR = "src/content/journal";

function field(front: string, name: string): string {
  const m = front.match(new RegExp(`^${name}:\\s*"?([^"\\n]*)"?\\s*$`, "m"));
  if (!m) throw new Error(`journal frontmatter is missing ${name}`);
  return m[1].trim();
}

export function journalSourcePosts(): JournalSourcePost[] {
  const posts: JournalSourcePost[] = [];
  for (const file of readdirSync(DIR).filter((n) => n.endsWith(".md"))) {
    const front = readFileSync(`${DIR}/${file}`, "utf8").split(/^---$/m)[1];
    if (/^draft:\s*true\s*$/m.test(front)) continue;
    const block = front.match(/^sources:\n((?:\s+- .*\n)+)/m);
    posts.push({
      id: field(front, "id"),
      lang: field(front, "lang"),
      branch: field(front, "branch"),
      datePublished: field(front, "datePublished"),
      sources: [...(block?.[1].matchAll(/- (\S+)/g) ?? [])].map((m) => m[1]),
    });
  }
  return posts;
}

/** Published posts of one language, newest first, then by id. */
export function publishedPosts(lang: string): JournalSourcePost[] {
  return journalSourcePosts()
    .filter((post) => post.lang === lang)
    .sort(
      (a, b) =>
        b.datePublished.localeCompare(a.datePublished) ||
        a.id.localeCompare(b.id),
    );
}

/** Posts of one language that cite `/<lang>/products/<slug>/` as a source. */
export function postsCitingProduct(
  lang: string,
  slug: string,
): JournalSourcePost[] {
  const profile = `https://blueskyzlabs.com/${lang}/products/${slug}/`;
  return publishedPosts(lang).filter((post) => post.sources.includes(profile));
}
