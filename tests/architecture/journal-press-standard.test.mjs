import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import test from "node:test";

/**
 * Journal press standard (docs/editorial/JOURNAL_PRESS_STANDARD.md, R2–R3).
 * Every published post's hero and infographic, with their 1200 px and share
 * variants, must be a stamped render listed in src/data/journal-art.json: the
 * bytes match the recorded SHA-256 and carry the BlueSkyz Labs rights XMP.
 * Any file under public/images/journal/ that the manifest does not list fails.
 */
const MANIFEST = "src/data/journal-art.json";
const ART_ROOT = "public/images/journal";
const POSTS = "src/content/journal";
const RIGHTS = "BlueSkyz Labs";
const XMP_MARKERS = [
  'xmpRights:Marked="True"',
  `photoshop:Credit="${RIGHTS}"`,
  `<rdf:li>${RIGHTS}</rdf:li>`,
  `${RIGHTS}. All rights reserved.`,
  "xmpRights:WebStatement=",
];

/** Figure paths a published post declares, plus the variants render.mjs writes. */
export function requiredArt(postSource) {
  if (/^draft:\s*true\s*$/m.test(postSource)) return [];
  const srcs = [
    ...postSource.matchAll(/^\s+src:\s*"?(\/images\/journal\/[^"\s]+)"?\s*$/gm),
  ].map((m) => m[1]);
  return srcs.flatMap((src) => [
    src,
    src.replace(/\.webp$/, "-1200.webp"),
    ...(/\/hero\./.test(src) ? [src.replace(/\.webp$/, ".og.jpg")] : []),
  ]);
}

export function artProblems({ posts, manifest, files, readBytes }) {
  const problems = [];
  for (const [name, source] of Object.entries(posts)) {
    const required = requiredArt(source);
    const kinds = required.filter((p) =>
      /\/(hero|infographic)\.(vi|en)\.webp$/.test(p),
    );
    if (!/^draft:\s*true\s*$/m.test(source) && kinds.length !== 2)
      problems.push(
        `${name}: a published post needs a hero and an infographic`,
      );
    for (const path of required)
      if (!manifest[path])
        problems.push(`${name}: ${path} is not in the art manifest`);
  }
  for (const path of files)
    if (!manifest[path])
      problems.push(
        `${path}: unlisted journal image (render it with tools/journal-art)`,
      );
  for (const [path, meta] of Object.entries(manifest)) {
    const bytes = readBytes(path);
    if (!bytes) {
      problems.push(`${path}: listed but missing`);
      continue;
    }
    if (createHash("sha256").update(bytes).digest("hex") !== meta.sha256)
      problems.push(`${path}: bytes differ from the manifest hash`);
    if (meta.rightsHolder !== RIGHTS)
      problems.push(`${path}: rights holder is not ${RIGHTS}`);
    const text = bytes.toString("latin1");
    for (const marker of XMP_MARKERS)
      if (!text.includes(marker))
        problems.push(`${path}: rights XMP lacks ${marker}`);
  }
  return problems;
}

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((d) =>
    d.isDirectory() ? walk(`${dir}/${d.name}`) : [`${dir}/${d.name}`],
  );

const live = () => ({
  posts: Object.fromEntries(
    readdirSync(POSTS)
      .filter((f) => f.endsWith(".md"))
      .map((f) => [f, readFileSync(`${POSTS}/${f}`, "utf8")]),
  ),
  manifest: JSON.parse(readFileSync(MANIFEST, "utf8")),
  files: existsSync(ART_ROOT)
    ? walk(ART_ROOT).map((p) => p.replace(/^public/, ""))
    : [],
  readBytes: (path) =>
    existsSync(`public${path}`) ? readFileSync(`public${path}`) : null,
});

test("every published post's figures are stamped, listed and unmodified", () => {
  const state = live();
  assert.ok(Object.keys(state.manifest).length > 0, "art manifest is empty");
  assert.deepEqual(artProblems(state), []);
});

test("negative proof: tampered, stripped, unlisted or missing art is rejected", () => {
  const state = live();
  const [path] = Object.keys(state.manifest);
  const original = state.readBytes(path);

  const tampered = Buffer.from(original);
  tampered[tampered.length - 1] ^= 0xff;
  assert.ok(
    artProblems({
      ...state,
      readBytes: (p) => (p === path ? tampered : state.readBytes(p)),
    }).some((m) => m === `${path}: bytes differ from the manifest hash`),
  );

  const stripped = Buffer.from(
    original.toString("latin1").replaceAll(RIGHTS, "Someone Else"),
    "latin1",
  );
  const strippedProblems = artProblems({
    ...state,
    readBytes: (p) => (p === path ? stripped : state.readBytes(p)),
  });
  assert.ok(
    strippedProblems.some((m) => m.startsWith(`${path}: rights XMP lacks`)),
  );

  assert.ok(
    artProblems({
      ...state,
      files: [...state.files, "/images/journal/x/copied.webp"],
    }).includes(
      "/images/journal/x/copied.webp: unlisted journal image (render it with tools/journal-art)",
    ),
  );

  const withoutOne = Object.fromEntries(
    Object.entries(state.manifest).filter(([p]) => p !== path),
  );
  assert.ok(
    artProblems({ ...state, manifest: withoutOne }).includes(
      `${path}: unlisted journal image (render it with tools/journal-art)`,
    ),
  );
  assert.ok(
    artProblems({
      ...state,
      readBytes: (p) => (p === path ? null : state.readBytes(p)),
    }).includes(`${path}: listed but missing`),
  );

  const bare = { "x.vi.md": "---\nid: x\ndraft: false\n---\n" };
  assert.ok(
    artProblems({ ...state, posts: bare }).includes(
      "x.vi.md: a published post needs a hero and an infographic",
    ),
  );
  assert.deepEqual(requiredArt("---\ndraft: true\n---\n"), []);
});
