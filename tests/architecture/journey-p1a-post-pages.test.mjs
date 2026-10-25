import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import test from "node:test";
import { AUTHORS, AUTHOR_IDS } from "../../src/data/authors.ts";
import { JOURNAL_POST_COPY } from "../../src/data/journal-copy.ts";
import { languagesForPath, SUPPORTED_LANGUAGES } from "../../src/lib/i18n.ts";
import {
  blogPostingJsonLd,
  buildJournalRss,
  escapeXml,
  journalFileProblems,
  journalPostBreadcrumbJsonLd,
  journalPostStaticPaths,
  partitionSources,
  publishedJournalPosts,
} from "../../src/lib/journal-posts.ts";
import {
  journalEntrySchema,
  journalPairProblems,
} from "../../src/lib/journal-schema.ts";
import { hreflangLinks, organizationId } from "../../src/lib/seo.ts";
import { jsonLdProblems } from "./lib/seo-html.mjs";

/**
 * Journey P1-A (post pages, author, RSS, sitemap). Fixtures are in-memory and
 * test-only: this change publishes no post (the header navigation stays put).
 */
const SITE_URL = "https://blueskyzlabs.com";
const APPROVAL = "https://github.com/BlueSkyz-Labs/blueskyz-web/pull/999";
const BASE = {
  id: "fixture-post",
  lang: "vi",
  branch: "news",
  author: "tony-nguyen",
  title: "Fixture title",
  description:
    "A fixture description long enough to satisfy the fifty character minimum.",
  datePublished: "2026-10-03",
  sources: ["https://example.org/source", "ev-products-route"],
  ownerApproval: APPROVAL,
};
const parse = (overrides = {}) =>
  journalEntrySchema.parse({ ...BASE, ...overrides });
const wrap = (...entries) => entries.map((data) => ({ data }));
const pair = (overrides = {}) => [
  parse(overrides),
  parse({ lang: "en", ...overrides }),
];

// ---- author registry and schema ------------------------------------------

test("the author registry holds the Owner-directed copy verbatim", () => {
  assert.deepEqual(AUTHOR_IDS, ["tony-nguyen"]);
  const tony = AUTHORS["tony-nguyen"];
  assert.equal(tony.name, "Tony Nguyen");
  assert.equal(tony.role.vi, "Nhà sáng lập kiêm CEO");
  assert.equal(tony.role.en, "Founder & CEO");
  assert.equal(tony.avatarAlt.vi, "Chân dung phác họa Tony Nguyen");
  assert.equal(tony.avatarAlt.en, "Sketch portrait of Tony Nguyen");
  assert.equal(tony.aboutPath.vi, "/vi/about/");
  assert.equal(tony.aboutPath.en, "/en/about/");
  assert.equal(
    tony.bio.vi.short,
    "Người làm IT mê công nghệ, muốn góp một phần nhỏ đưa những ý tưởng thiết thực vào đời sống hằng ngày.",
  );
  assert.equal(
    tony.bio.vi.long,
    "Tony Nguyen là nhà sáng lập kiêm CEO của BlueSkyz Labs, sống và làm việc tại TP. Hồ Chí Minh. Là một người làm IT đam mê công nghệ, Tony tin rằng công nghệ tốt nhất là thứ khiến những việc thường ngày trở nên nhẹ nhàng hơn. BlueSkyz Labs ra đời từ niềm tin ấy: góp một phần nhỏ để biến những ý tưởng thiết thực thành sản phẩm giúp đời sống của mọi người dễ dàng hơn mỗi ngày.",
  );
  assert.equal(
    tony.bio.en.short,
    "An IT professional who loves technology and wants to play a small part in bringing practical ideas into everyday life.",
  );
  assert.equal(
    tony.bio.en.long,
    "Tony Nguyen is the founder and CEO of BlueSkyz Labs, based in Ho Chi Minh City. An IT professional who loves technology, Tony believes the best technology makes everyday tasks feel lighter. BlueSkyz Labs grew out of that belief: to play a small part in turning practical ideas into products that make people's daily lives a little easier.",
  );
});

test("the author's name and role match the about page record", () => {
  for (const lang of ["vi", "en"]) {
    const about = readFileSync(`src/content/pages/${lang}/about.yaml`, "utf8");
    assert.match(about, /founder_name: Tony Nguyen/);
  }
  const en = readFileSync("src/content/pages/en/about.yaml", "utf8");
  assert.match(en, /founder_title: Founder & CEO/);
});

test("the avatar is a committed, EXIF-free WebP pair with honest provenance", () => {
  const tony = AUTHORS["tony-nguyen"];
  assert.equal(tony.avatar, "/images/authors/tony-nguyen-256.webp");
  assert.equal(tony.avatarLarge, "/images/authors/tony-nguyen-512.webp");
  for (const path of [tony.avatar, tony.avatarLarge]) {
    const bytes = readFileSync(`public${path}`);
    assert.equal(bytes.subarray(0, 4).toString("latin1"), "RIFF", path);
    assert.equal(bytes.subarray(8, 12).toString("latin1"), "WEBP", path);
    // No metadata chunks: a portrait must not leak camera, GPS or edit data.
    for (const chunk of ["EXIF", "XMP ", "ICCP"]) {
      assert.equal(bytes.includes(Buffer.from(chunk, "latin1")), false, path);
    }
  }
  assert.ok(
    readFileSync(`public${tony.avatar}`).length <
      readFileSync(`public${tony.avatarLarge}`).length,
  );
  assert.equal(
    tony.avatarProvenance,
    "Pencil-sketch illustration derived from a portrait photograph supplied by the Owner, made at the Owner's request (2026-10-23) by deterministic local image processing (no generative model); background replaced with a brand tint, circular crop.",
  );
});

test("schema: author is required and must be a registered key; aiAssisted defaults to false", () => {
  assert.equal(parse().aiAssisted, false);
  assert.equal(parse({ aiAssisted: true }).aiAssisted, true);
  assert.equal(parse().author, "tony-nguyen");
});

test("negative proofs: unknown, missing or malformed author and aiAssisted are rejected", () => {
  const withoutAuthor = { ...BASE, author: undefined };
  for (const input of [
    { ...BASE, author: "somebody-else" },
    { ...BASE, author: "" },
    withoutAuthor,
    { ...BASE, aiAssisted: "yes" },
    { ...BASE, aiAssisted: null },
  ]) {
    assert.equal(
      journalEntrySchema.safeParse(input).success,
      false,
      JSON.stringify(input),
    );
  }
});

test("pairing: author or aiAssisted differing between vi and en is flagged", () => {
  assert.deepEqual(journalPairProblems(pair({ aiAssisted: true })), []);
  const [vi] = pair();
  const aiMismatch = [vi, parse({ lang: "en", aiAssisted: true })];
  assert.match(journalPairProblems(aiMismatch)[0], /aiAssisted differs/);
  // A second registered author would be the only way to differ on `author`;
  // prove the comparison itself by pairing against a shape-compatible copy.
  const authorMismatch = [vi, { ...parse({ lang: "en" }), author: "other" }];
  assert.match(journalPairProblems(authorMismatch)[0], /author differs/);
});

test("file naming contract: <id>.<lang>.md", () => {
  assert.deepEqual(journalFileProblems("fixture-post.vi.md", parse()), []);
  assert.equal(journalFileProblems("fixture-post.md", parse()).length, 1);
  assert.equal(journalFileProblems("fixture-post.en.md", parse()).length, 1);
});

// ---- post paths ------------------------------------------------------------

test("post paths cover published entries of the language only", () => {
  const entries = wrap(
    ...pair(),
    ...pair({ id: "draft-post", draft: true }),
    ...pair({ id: "newer-post", datePublished: "2026-10-04" }),
  );
  const vi = journalPostStaticPaths(entries, "vi");
  assert.deepEqual(
    vi.map((path) => path.params.slug),
    ["newer-post", "fixture-post"],
  );
  assert.ok(vi.every((path) => path.props.entry.data.lang === "vi"));
  assert.deepEqual(
    journalPostStaticPaths(entries, "en").map((path) => path.params.slug),
    ["newer-post", "fixture-post"],
  );
});

test("negative proofs: drafts and zh locales get no post route; an unpaired post fails the build", () => {
  const drafts = wrap(...pair({ draft: true }));
  assert.deepEqual(journalPostStaticPaths(drafts, "vi"), []);
  assert.deepEqual(journalPostStaticPaths(drafts, "en"), []);
  const published = wrap(...pair());
  for (const lang of ["zh", "zh-hant", "fr", ""]) {
    assert.deepEqual(journalPostStaticPaths(published, lang), [], lang);
    assert.deepEqual(publishedJournalPosts(published, lang), [], lang);
  }
  assert.throws(
    () => journalPostStaticPaths(wrap(parse()), "vi"),
    /exactly one vi and one en/,
  );
  assert.throws(
    () =>
      journalPostStaticPaths(
        wrap(parse(), parse({ lang: "en", aiAssisted: true })),
        "vi",
      ),
    /aiAssisted differs/,
  );
});

// ---- RSS ---------------------------------------------------------------------

const feed = (entries, lang = "vi") =>
  buildJournalRss({
    siteUrl: SITE_URL,
    lang,
    title: "Hành trình | BlueSkyz Labs",
    description: "Mô tả",
    entries,
  });

test("RSS is valid 2.0 with absolute links, guid and the author; an empty feed is valid", () => {
  const xml = feed(wrap(...pair()));
  assert.match(xml, /^<\?xml version="1.0" encoding="UTF-8"\?>/);
  assert.match(xml, /<rss version="2.0"/);
  assert.match(
    xml,
    /<link>https:\/\/blueskyzlabs.com\/vi\/journal\/fixture-post\/<\/link>/,
  );
  assert.match(xml, /<guid isPermaLink="true">https:\/\/blueskyzlabs.com\//);
  assert.match(xml, /<pubDate>Sat, 03 Oct 2026 00:00:00 GMT<\/pubDate>/);
  assert.match(xml, /<dc:creator>Tony Nguyen<\/dc:creator>/);
  assert.equal((xml.match(/<item>/g) ?? []).length, 1);
  const empty = feed([]);
  assert.match(empty, /<channel>[\s\S]*<\/channel>/);
  assert.doesNotMatch(empty, /<item>|lastBuildDate/);
  assert.equal(feed(wrap(...pair())), xml, "deterministic");
});

test("RSS escapes < & \" ' in every text field and attribute", () => {
  const nasty = `<b> & "q" 'a' </b>`;
  const xml = feed(
    wrap(...pair({ title: nasty, description: `${nasty} ${"x".repeat(60)}` })),
  );
  assert.doesNotMatch(xml, /<b>|<\/b>/);
  assert.match(xml, /&lt;b&gt; &amp; &quot;q&quot; &apos;a&apos; &lt;\/b&gt;/);
  assert.equal(escapeXml(`<&"'>`), "&lt;&amp;&quot;&apos;&gt;");
  assert.equal(escapeXml("a\u0000b\u000Bc"), "abc");
  // The channel text is escaped too.
  const channel = buildJournalRss({
    siteUrl: SITE_URL,
    lang: "en",
    title: `T & "C"`,
    description: "<d>",
    entries: [],
  });
  assert.match(channel, /<title>T &amp; &quot;C&quot;<\/title>/);
  assert.match(channel, /<description>&lt;d&gt;<\/description>/);
});

test("negative proofs: the feed never lists a draft or the other language", () => {
  const entries = wrap(
    ...pair({ id: "live-post" }),
    ...pair({ id: "draft-post", draft: true, title: "SECRET DRAFT" }),
  );
  const vi = feed(entries, "vi");
  assert.doesNotMatch(vi, /draft-post|SECRET DRAFT/);
  assert.match(vi, /live-post/);
  assert.doesNotMatch(
    vi,
    /\/en\/journal\//.source ? /\/en\/journal\/live/ : /x/,
  );
  assert.equal(feed(wrap(...pair({ draft: true }))).includes("<item>"), false);
});

// ---- JSON-LD, hreflang, links ------------------------------------------------

test("BlogPosting JSON-LD reuses the Organization node and cites only https sources", () => {
  const entry = parse({
    dateModified: "2026-10-05",
    updateNote: "Corrected a date.",
  });
  const node = blogPostingJsonLd(entry, SITE_URL);
  assert.equal(node["@type"], "BlogPosting");
  assert.equal(node.headline, "Fixture title");
  assert.equal(node.datePublished, "2026-10-03");
  assert.equal(node.dateModified, "2026-10-05");
  assert.equal(node.inLanguage, "vi");
  assert.equal(
    node.mainEntityOfPage["@id"],
    "https://blueskyzlabs.com/vi/journal/fixture-post/",
  );
  assert.equal(node.publisher["@id"], organizationId(SITE_URL));
  assert.deepEqual(node.author, {
    "@type": "Person",
    name: "Tony Nguyen",
    url: "https://blueskyzlabs.com/vi/about/",
    image: "https://blueskyzlabs.com/images/authors/tony-nguyen-512.webp",
  });
  assert.deepEqual(node.citation, ["https://example.org/source"]);
  assert.equal("image" in node, false, "the avatar is not the article image");
  // dateModified falls back to datePublished.
  assert.equal(blogPostingJsonLd(parse(), SITE_URL).dateModified, "2026-10-03");
  // Safe to embed: the layout's serializer escapes `<`.
  assert.doesNotMatch(JSON.stringify(node).replace(/</g, "\\u003c"), /</);
});

test("breadcrumb JSON-LD is Home > Journal > post with the section's own label", () => {
  const node = journalPostBreadcrumbJsonLd({
    lang: "en",
    id: "fixture-post",
    title: "Fixture title",
    journalLabel: "Journal",
    siteUrl: SITE_URL,
  });
  assert.deepEqual(
    node.itemListElement.map((item) => [item.position, item.name, item.item]),
    [
      [1, "Home", "https://blueskyzlabs.com/en/"],
      [2, "Journal", "https://blueskyzlabs.com/en/journal/"],
      [3, "Fixture title", "https://blueskyzlabs.com/en/journal/fixture-post/"],
    ],
  );
});

test("hreflang alternates for a post are vi and en only; other routes keep all four", () => {
  const post = hreflangLinks("/vi/journal/fixture-post/", SITE_URL);
  assert.deepEqual(
    post.map((link) => [link.hreflang, link.href]),
    [
      ["en", "https://blueskyzlabs.com/en/journal/fixture-post/"],
      ["vi", "https://blueskyzlabs.com/vi/journal/fixture-post/"],
    ],
  );
  assert.equal(hreflangLinks("/en/journal/", SITE_URL).length, 4);
  assert.equal(hreflangLinks("/en/products/", SITE_URL).length, 4);
  assert.deepEqual(languagesForPath("/en/journal/x/"), ["en", "vi"]);
  assert.deepEqual(languagesForPath("/zh/journal/"), SUPPORTED_LANGUAGES);
  assert.deepEqual(languagesForPath("/en/about/"), SUPPORTED_LANGUAGES);
});

test("sources: https become links, evidence ids stay text; nothing else is linkable", () => {
  assert.deepEqual(partitionSources(BASE.sources), {
    links: ["https://example.org/source"],
    evidenceIds: ["ev-products-route"],
  });
  assert.deepEqual(partitionSources(["javascript:alert(1)", "http://x.y"]), {
    links: [],
    evidenceIds: ["javascript:alert(1)", "http://x.y"],
  });
});

test("UI copy exists for vi and en only", () => {
  assert.deepEqual(Object.keys(JOURNAL_POST_COPY).sort(), ["en", "vi"]);
  assert.equal(JOURNAL_POST_COPY.vi.published, "Đăng ngày");
  assert.equal(JOURNAL_POST_COPY.en.aboutAuthor, "About the author");
  assert.equal(
    JOURNAL_POST_COPY.en.aiDisclosure,
    "Drafted with AI assistance; reviewed and approved by the author.",
  );
});

// ---- route and wiring invariants (source level, with negative proofs) ---------

const read = (path) => (existsSync(path) ? readFileSync(path, "utf8") : "");

/** Route files: post + feed in vi/en only; the post page is gated and static. */
export function postRouteProblems(readFile, langs = ["vi", "en"]) {
  const problems = [];
  for (const lang of langs) {
    const page = readFile(`src/pages/${lang}/journal/[slug].astro`);
    if (!page) problems.push(`${lang}: post route missing`);
    else {
      if (!/journalPostStaticPaths\(/.test(page))
        problems.push(`${lang}: post paths are not gated to published pairs`);
      if (!/blogPostingJsonLd\(/.test(page))
        problems.push(`${lang}: no BlogPosting JSON-LD`);
      if (!/feed=\{/.test(page)) problems.push(`${lang}: no RSS alternate`);
    }
    const rss = readFile(`src/pages/${lang}/journal/rss.xml.ts`);
    if (!rss) problems.push(`${lang}: rss endpoint missing`);
    else if (!/prerender = true/.test(rss))
      problems.push(`${lang}: rss endpoint is not prerendered`);
  }
  return problems;
}

test("vi and en have a gated post route and a prerendered feed", () => {
  assert.deepEqual(postRouteProblems(read), []);
});

test("negative proof: an ungated, feed-less or missing route is rejected", () => {
  const ungated = (p) =>
    read(p).replace("journalPostStaticPaths(", "getCollection(");
  assert.ok(postRouteProblems(ungated).some((m) => /not gated/.test(m)));
  const dynamic = (p) =>
    read(p).replace("prerender = true", "prerender = false");
  assert.ok(postRouteProblems(dynamic).some((m) => /not prerendered/.test(m)));
  assert.deepEqual(
    postRouteProblems(() => "", ["vi"]),
    ["vi: post route missing", "vi: rss endpoint missing"],
  );
});

test("zh and zh-Hant have no post route and no feed", () => {
  for (const lang of ["zh", "zh-hant"]) {
    const files = readdirSync(`src/pages/${lang}/journal`);
    assert.deepEqual(files, ["index.astro"], lang);
  }
});

test("index items link to their post page; the post page shows the required parts", () => {
  const index = read("src/components/journal/JournalIndex.astro");
  assert.match(index, /journalPostPath\(entry\.lang, entry\.id\)/);
  const post = read("src/components/journal/JournalPost.astro");
  for (const marker of [
    "<PageHeader",
    "data-journal-published",
    "data-journal-updated",
    "data-journal-ai-disclosure",
    "data-journal-sources",
    'rel="noopener"',
    "data-journal-author",
    'width="64"',
    "author.avatarAlt[lang]",
    "post.aboutAuthor",
  ]) {
    assert.ok(post.includes(marker), marker);
  }
  assert.match(post, /entry\.aiAssisted \?/);
  assert.doesNotMatch(post, /<script/);
});

test("the built-page JSON-LD shape accepts the BlogPosting node and rejects broken ones", () => {
  const good = blogPostingJsonLd(parse(), SITE_URL);
  assert.deepEqual(jsonLdProblems(good), []);
  const noAuthor = { ...good, author: undefined };
  const broken = [
    noAuthor,
    { ...good, author: { ...good.author, "@type": "Organization" } },
    { ...good, datePublished: "yesterday" },
    { ...good, publisher: { "@type": "Organization", name: "X" } },
    { ...good, aggregateRating: { ratingValue: 5 } },
  ];
  for (const node of broken) {
    assert.notDeepEqual(jsonLdProblems(node), [], JSON.stringify(node));
  }
});

test("the founder-literal guard exempts only the author registry", () => {
  const guard = readFileSync(
    "tests/architecture/exp-s8-empty-states.test.mjs",
    "utf8",
  );
  assert.match(guard, /p !== "src\/data\/authors\.ts"/);
  const exempt = (guard.match(/p !== "[^"]+"/g) ?? []).length;
  assert.equal(exempt, 1, "no other file may be exempted from the guard");
});
