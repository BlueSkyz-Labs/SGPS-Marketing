import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";

/**
 * C4-C Task 4 — Boardroom Presentation Mode contract.
 *
 * The presentation view is contained view state over already-compiled public
 * dossier content. This contract holds the three things a reviewer cannot see
 * at runtime: that the enhancement and its markup cannot drift apart, that the
 * mode never turns into navigation or a transport, and that visible focus is
 * declared rather than assumed.
 */
const ROOT = path.join(import.meta.dirname, "../..");
const read = (relative) => readFileSync(path.join(ROOT, relative), "utf8");

const SCRIPT = read("src/scripts/boardroom-mode.ts");
const COMPONENT = read("src/components/dossier/BoardroomDeck.astro");
const STYLE = read("src/styles/c4-quiet-authority.css");

const ACTIVE_CLASS = "c4-boardroom__screen--active";
const HEADING_CLASS = "c4-boardroom__screen-heading";

test("every presentation selector the script queries exists in the markup", () => {
  const selectors = [...new Set(SCRIPT.match(/data-boardroom-[a-z-]+/g) ?? [])];
  assert.ok(
    selectors.length >= 5,
    `expected the script to query the deck contract, saw ${selectors.length}`,
  );
  for (const selector of selectors) {
    assert.ok(
      COMPONENT.includes(selector),
      `${selector} is queried by the enhancement but never rendered`,
    );
  }
});

test("the active-screen state is one shared name, not a second vocabulary", () => {
  assert.ok(
    SCRIPT.includes(ACTIVE_CLASS),
    "the enhancement must toggle the shared active-screen class",
  );
  assert.ok(
    STYLE.includes(`.${ACTIVE_CLASS}`),
    "the shared active-screen class must be styled, or the mode is invisible",
  );
  // A second, invented state name is how this feature silently stops working.
  assert.doesNotMatch(SCRIPT, /data-boardroom-screen--active/);
});

test("presentation mode is contained view state, never navigation or transport", () => {
  for (const forbidden of [
    "history.pushState",
    "history.replaceState",
    "location.assign",
    "location.href",
    "location.hash",
    "fetch(",
    "XMLHttpRequest",
    "localStorage",
    "sessionStorage",
    "window.open",
  ]) {
    assert.ok(
      !SCRIPT.includes(forbidden),
      `presentation mode must not use ${forbidden}`,
    );
  }
});

test("keyboard handling is scoped to the deck and never hijacks the document", () => {
  assert.doesNotMatch(
    SCRIPT,
    /document\.addEventListener\(\s*["']keydown/,
    "a document-level keydown listener would steal keys from the whole page",
  );
  assert.ok(
    SCRIPT.includes('el.deck.addEventListener("keydown"'),
    "keys must be handled on the deck itself",
  );
  assert.ok(
    SCRIPT.includes("Escape"),
    "Escape must remain an exit path out of the mode",
  );
});

test("visible focus is declared for the controls and the active heading", () => {
  for (const selector of [".c4-boardroom__btn", `.${HEADING_CLASS}`]) {
    const rule = STYLE.indexOf(`${selector}:focus-visible`);
    assert.ok(rule > -1, `${selector} must declare a visible focus state`);
    const declarations = STYLE.slice(rule, STYLE.indexOf("}", rule));
    assert.match(
      declarations,
      /outline:/,
      `${selector}:focus-visible must declare an outline`,
    );
  }
  assert.ok(
    COMPONENT.includes(`class="${HEADING_CLASS}" tabindex="-1"`),
    "the active heading must be programmatically focusable",
  );
});

test("reduced motion removes the transition instead of removing the content", () => {
  const blocks = [
    ...STYLE.matchAll(
      /@media \(prefers-reduced-motion: reduce\) \{([\s\S]*?)\n\}/g,
    ),
  ].map((match) => match[1]);
  assert.ok(
    blocks.some(
      (block) =>
        block.includes(".c4-boardroom__screen") &&
        /transition:\s*none/.test(block),
    ),
    "reduced motion must drop the screen transition",
  );
  assert.ok(
    COMPONENT.includes("data-boardroom-screen"),
    "screens must render server-side so reduced motion and no-JS still read",
  );
});
