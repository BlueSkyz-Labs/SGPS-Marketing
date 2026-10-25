import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";
import test from "node:test";

/**
 * Public content standard (docs/editorial/PUBLIC_CONTENT_STANDARD.md), the
 * checkable parts: C3 bans unsupported superlatives and self-praise in
 * published post text, C5 bounds title and deck length. The rest of the
 * standard is enforced by the publishing PR's review record (C8).
 */
const POSTS = "src/content/journal";

/** Phrases a post may not print about anything unless quoted from a source. */
export const BANNED = [
  /tốt nhất/i,
  /đơn giản nhất/i,
  /dễ nhất/i,
  /hàng đầu/i,
  /số\s*1\b/i,
  /đẳng cấp/i,
  /\bthe best\b/i,
  /\bthe simplest\b/i,
  /\bthe easiest\b/i,
  /\bworld[- ]class\b/i,
  /\bbest[- ]in[- ]class\b/i,
  /\bleading\b/i,
  /\btop[- ]tier\b/i,
  /\belite\b/i,
  /#1\b/,
  // Owner 2026-10-25: extended list.
  /vượt trội/i,
  /duy nhất/i,
  /toàn diện/i,
  /cách mạng/i,
  /\bunique\b/i,
  /\bseamless(?:ly)?\b/i,
  /\bpowerful\b/i,
  /\brevolutionary\b/i,
  /\bcutting[- ]edge\b/i,
];

const TITLE_MAX = 80;
const DECK_MIN = 110;
const DECK_MAX = 170;

function field(source, name) {
  return source.match(new RegExp(`^${name}:\\s*"(.*)"\\s*$`, "m"))?.[1];
}

/** Published text of a post: frontmatter strings plus body, minus quotes and URLs. */
function publishedText(source) {
  return source
    .replace(/^\s+-\s+https?:\/\/\S+\s*$/gm, "")
    .replace(/\(https?:\/\/[^)]*\)|\(\/[^)]*\)/g, "")
    .replace(/^>.*$/gm, (line) => line.replace(/"[^"]*"|“[^”]*”/g, ""))
    .replace(/"[^"]*"(?=\s*\))/g, "");
}

export function contentProblems(posts) {
  const problems = [];
  for (const [name, source] of Object.entries(posts)) {
    if (/^draft:\s*true\s*$/m.test(source)) continue;
    const title = field(source, "title") ?? "";
    const deck = field(source, "description") ?? "";
    if (!title || [...title].length > TITLE_MAX)
      problems.push(`${name}: title must be 1–${TITLE_MAX} characters`);
    const deckLen = [...deck].length;
    if (deckLen < DECK_MIN || deckLen > DECK_MAX)
      problems.push(
        `${name}: description is ${deckLen} characters, needs ${DECK_MIN}–${DECK_MAX}`,
      );
    const body = source
      .split(/^---\s*$/m)
      .slice(2)
      .join("---");
    const text = publishedText(
      [title, deck, field(source, "caption") ?? "", body].join("\n"),
    );
    for (const re of BANNED)
      if (re.test(text))
        problems.push(`${name}: unsupported superlative or self-praise ${re}`);
  }
  return problems;
}

const posts = Object.fromEntries(
  readdirSync(POSTS)
    .filter((f) => f.endsWith(".md"))
    .map((f) => [f, readFileSync(`${POSTS}/${f}`, "utf8")]),
);

test("published posts meet the public content standard (C3, C5)", () => {
  assert.ok(Object.keys(posts).length > 0);
  assert.deepEqual(contentProblems(posts), []);
});

test("negative proof: a superlative, a long title or a short deck is caught", () => {
  const [name, source] = Object.entries(posts).find(
    ([, s]) => !/^draft:\s*true\s*$/m.test(s),
  );
  const superlative = source.replace(
    /\n## /,
    "\nĐây là cách đơn giản nhất.\n\n## ",
  );
  assert.notEqual(superlative, source);
  assert.equal(contentProblems({ [name]: superlative }).length, 1);
  const english = source.replace(/\n## /, "\nThe best rent book.\n\n## ");
  assert.equal(contentProblems({ [name]: english }).length, 1);
  for (const phrase of ["Giải pháp vượt trội.", "A seamless, powerful app."]) {
    const extended = source.replace(/\n## /, `\n${phrase}\n\n## `);
    assert.ok(contentProblems({ [name]: extended }).length >= 1, phrase);
  }
  const longTitle = source.replace(
    /^title: "(.*)"$/m,
    `title: "${"x".repeat(TITLE_MAX + 1)}"`,
  );
  assert.equal(contentProblems({ [name]: longTitle }).length, 1);
  const shortDeck = source.replace(
    /^description: "(.*)"$/m,
    'description: "Too short."',
  );
  assert.equal(contentProblems({ [name]: shortDeck }).length, 1);
});

test("negative proof: a draft is not checked, a source URL is not text", () => {
  const draft =
    '---\ntitle: "Tốt nhất"\ndescription: "x"\ndraft: true\n---\nTốt nhất.';
  assert.deepEqual(contentProblems({ "d.md": draft }), []);
  const [name, source] = Object.entries(posts)[0];
  const withUrl = source.replace(
    /^sources:\n/m,
    "sources:\n  - https://example.com/the-best-guide\n",
  );
  assert.notEqual(withUrl, source);
  assert.deepEqual(contentProblems({ [name]: withUrl }), []);
});
