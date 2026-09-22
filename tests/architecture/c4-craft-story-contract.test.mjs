import assert from "node:assert/strict";
import test from "node:test";
import { EVIDENCE_INDEX } from "../../src/data/claims.ts";
import {
  renderCraftStory,
  validateCraftStory,
} from "../../src/lib/craft-stories.ts";

const REAL = [...EVIDENCE_INDEX.keys()][0];
const LIMITATIONS = {
  en: "Runs only on the static surface.",
  vi: "Chỉ chạy trên bề mặt tĩnh.",
};

function draft(overrides = {}) {
  return {
    id: "craft-test",
    sections: {
      problem: {
        en: "The house had no stated craft story.",
        vi: "Ngôi nhà chưa có câu chuyện nghề.",
      },
      designChoice: {
        en: "Sections map to authored fields.",
        vi: "Các mục ánh xạ tới trường đã viết.",
      },
      limitations: LIMITATIONS,
    },
    evidenceRefs: [REAL],
    ...overrides,
  };
}

test("C4-B craft story: a source-backed draft is valid and renderable", () => {
  assert.ok(REAL, "canonical evidence index must not be empty");
  const validation = validateCraftStory(draft());
  assert.deepEqual(validation.violations, []);
  assert.equal(validation.ok, true);
  const view = renderCraftStory(draft(), "vi");
  assert.ok(view, "a valid draft renders");
  assert.equal(view.sections.at(-1).section, "limitations");
  assert.ok(view.evidence[0].href.length > 0);
});

test("C4-B craft story: unknown evidence is rejected", () => {
  const validation = validateCraftStory(
    draft({ evidenceRefs: ["ev-not-real"] }),
  );
  assert.equal(validation.ok, false);
  assert.ok(validation.violations.includes("unknown-evidence"));
  assert.equal(
    renderCraftStory(draft({ evidenceRefs: ["ev-not-real"] }), "en"),
    null,
  );
});

test("C4-B craft story: a story that cites only itself is rejected", () => {
  const validation = validateCraftStory(draft({ evidenceRefs: [] }));
  assert.equal(validation.ok, false);
  assert.deepEqual(validation.violations, ["cites-only-itself"]);
});

test("C4-B craft story: hiding limitations is rejected", () => {
  const sections = { ...draft().sections };
  delete sections.limitations;
  const validation = validateCraftStory(draft({ sections }));
  assert.equal(validation.ok, false);
  assert.ok(validation.violations.includes("hides-limitations"));
});

test("C4-B craft story: invented customer outcomes are rejected", () => {
  for (const prose of [
    "Customers saw a 40% increase in task completion.",
    "Khách hàng đã đạt 40% increase về tốc độ.",
    "A guaranteed improvement for every visitor.",
  ]) {
    const sections = {
      ...draft().sections,
      implementation: { en: prose, vi: prose },
    };
    const validation = validateCraftStory(draft({ sections }));
    assert.equal(validation.ok, false, `must reject: ${prose}`);
    assert.ok(validation.violations.includes("invented-outcome"));
  }
});

test("C4-B craft story: unsupported assurance is rejected", () => {
  for (const prose of [
    "We are ISO 27001 certified.",
    "The system is SOC 2 audited.",
  ]) {
    const sections = {
      ...draft().sections,
      implementation: { en: prose, vi: prose },
    };
    const validation = validateCraftStory(draft({ sections }));
    assert.equal(validation.ok, false, `must reject: ${prose}`);
    assert.ok(validation.violations.includes("unsupported-assurance"));
  }
});
