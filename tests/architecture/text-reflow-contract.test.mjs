/**
 * Text-reflow contract for the product card.
 *
 * The card is rendered inside a px-breakpoint grid (`md:grid-cols-2`), so a 200%
 * root font size halves the card's available width while every rem-based size
 * inside it doubles. A flex row that cannot wrap, or a flex child that pins its
 * min-content (`min-width: auto`), then overflows the card — found live: the
 * card header row carried `flex-wrap: nowrap` and the status badge could not
 * shrink, overflowing by 151px and pushing the whole 768px page 54px sideways.
 *
 * The e2e zoom guards measure the rendered result, but their outcome depends on
 * the runner's fallback font width, so this contract asserts the source
 * invariants that make the row shrinkable in the first place.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const CARD = "src/components/product/ProductCard.astro";

test("the product card's rows and record-driven labels can shrink at 200% text", () => {
  const card = readFileSync(CARD, "utf8");

  assert.match(
    card,
    /<header class="flex flex-wrap items-start justify-between/,
    "the card header row must wrap: the status badge cannot shrink below its min-content, so a nowrap row overflows the card at 200% text",
  );

  assert.match(
    card,
    /data-product-status=\{data\.publicLabel\}\s*\n?\s*class="[^"]*min-w-0/,
    "the status badge must carry min-w-0 so it wraps instead of pinning the row's min-content",
  );

  const links = card.match(/class="inline-flex min-h-11[^"]*"/g) ?? [];
  assert.equal(
    links.length,
    4,
    "the card declares four shrinkable links: the product-name link plus three micro-tick action links",
  );
  for (const link of links) {
    assert.match(link, /min-w-0/, `action link must shrink: ${link}`);
    assert.match(
      link,
      /\[overflow-wrap:anywhere\]/,
      `action link label must break rather than overflow: ${link}`,
    );
  }

  assert.match(
    card,
    /<span class="inline-flex max-w-full min-w-0[^"]*bg-\[var\(--surface-subtle\)\][^"]*\[overflow-wrap:anywhere\]"/,
    "platform chips must shrink and break like every other record-driven label",
  );
});
