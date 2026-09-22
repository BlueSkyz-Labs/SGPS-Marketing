import assert from "node:assert/strict";
import test from "node:test";
import { EVIDENCE_INDEX } from "../../src/data/claims.ts";
import { CRAFT_STORIES, getCraftStory } from "../../src/data/craft-stories.ts";
import {
  renderCraftStory,
  validateCraftStory,
} from "../../src/lib/craft-stories.ts";

const LANGS = ["en", "vi", "zh"];
const SUBSTANTIVE = ["problem", "designChoice", "constraint", "implementation"];

test("C4-B craft story data: every authored story passes the contract", () => {
  assert.ok(
    CRAFT_STORIES.length > 0,
    "at least one system has enough source truth",
  );
  for (const story of CRAFT_STORIES) {
    const validation = validateCraftStory(story);
    assert.deepEqual(
      validation.violations,
      [],
      `${story.id} must satisfy the contract`,
    );
  }
});

test("C4-B craft story data: every referenced evidence id resolves publicly", () => {
  for (const story of CRAFT_STORIES) {
    assert.ok(
      story.evidenceRefs.length > 0,
      `${story.id} must cite canonical evidence`,
    );
    for (const id of story.evidenceRefs) {
      assert.ok(
        EVIDENCE_INDEX.has(id),
        `${story.id} cites unknown evidence ${id}`,
      );
    }
  }
});

test("C4-B craft story data: limitations are stated, never omitted", () => {
  for (const story of CRAFT_STORIES) {
    assert.ok(
      story.sections.limitations,
      `${story.id} must state its limitations`,
    );
  }
});

test("C4-B craft story data: sections are authored in every language", () => {
  for (const story of CRAFT_STORIES) {
    for (const section of [...SUBSTANTIVE, "limitations"]) {
      const text = story.sections[section];
      assert.ok(text, `${story.id} needs ${section}`);
      for (const lang of LANGS) {
        assert.ok(
          (text[lang] ?? "").trim().length > 0,
          `${story.id}.${section}.${lang} must be authored`,
        );
      }
    }
  }
});

test("C4-B craft story data: a story renders with evidence and limitation paths", () => {
  for (const story of CRAFT_STORIES) {
    for (const lang of LANGS) {
      const view = renderCraftStory(story, lang);
      assert.ok(view, `${story.id} (${lang}) must render`);
      assert.equal(
        view.sections.at(-1).section,
        "limitations",
        "limits render last",
      );
      assert.equal(view.evidence.length, story.evidenceRefs.length);
      for (const entry of view.evidence) {
        assert.ok(
          entry.href.length > 0,
          `${story.id} evidence needs a destination`,
        );
      }
    }
  }
});

test("C4-B craft story data: lookup works and unknown ids are absent", () => {
  for (const story of CRAFT_STORIES) {
    assert.equal(getCraftStory(story.id)?.id, story.id);
  }
  assert.equal(getCraftStory("no-such-story"), undefined);
});
