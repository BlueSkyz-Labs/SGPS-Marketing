import type { ConciergeCorpusRecord } from "./concierge-corpus.ts";

/**
 * C3-E Task 3 — retrieval and citation policy (fail-closed, deterministic).
 *
 * The policy decides, without any model, what a visitor question maps to in the
 * public corpus. It exists BEFORE any runtime adapter so that model integration
 * can never weaken the boundary: an answer object missing source ids, or citing
 * anything outside the corpus, is rejected outright.
 *
 * States:
 * - supported   exactly one best-supported record (the citation);
 * - ambiguous   several distinct records share the top score and specificity —
 *               candidates are surfaced, never a silent pick;
 * - unknown     no corpus support — explicit out-of-scope plus navigation;
 * - adversarial instruction-shaped input — refused, never forwarded, never
 *               echoed into a citation.
 *
 * No model, no network, no clock, no randomness: the same query and corpus
 * produce the same classification.
 */

export type ConciergeQueryState =
  "supported" | "ambiguous" | "unknown" | "adversarial";

export interface ConciergeClassification {
  state: ConciergeQueryState;
  /** supported: the winner; ambiguous: the candidates; otherwise empty. */
  matches: ConciergeCorpusRecord[];
  /** Route records for deterministic navigation fallback. */
  navigation: ConciergeCorpusRecord[];
  /** Short machine reason; never user-facing prose. */
  reason: string;
}

export interface ConciergeAnswerCandidate {
  text: string;
  sourceIds?: readonly string[] | undefined;
}

export interface ConciergeAnswerVerdict {
  ok: boolean;
  rejected: string[];
}

const MAX_QUERY_CHARS = 512;
const MAX_TOKENS = 64;
/** A single incidental word never earns a citation. */
const MIN_MATCH = 2;

/** More specific kinds win a tie: a route composing a claim never fabricates ambiguity. */
const KIND_RANK: Record<string, number> = { claim: 0, product: 1, route: 2 };

/** Instruction-shaped input, in the locales this site publishes. */
const ADVERSARIAL_PATTERNS: readonly RegExp[] = [
  /ignore\s+(all\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|rules?)/i,
  /disregard\s+(all\s+|any\s+)?(previous|prior|above|earlier|the)\s*(instructions?|rules?|prompts?)?/i,
  /system\s+prompt/i,
  /you\s+are\s+now\b/i,
  /\bjailbreak\b/i,
  /reveal\s+(your\s+)?(system|hidden|internal)\s*(prompt|context|instructions)/i,
  /bỏ\s+qua.{0,40}(hướng\s+dẫn|chỉ\s+dẫn|quy\s+tắc)/i,
  /tiết\s+lộ.{0,40}(prompt|hệ\s+thống|nội\s+bộ)/i,
  /忽略.{0,20}(指令|提示|规则)/,
  /系统提示/,
  /无视.{0,20}规则/,
  /输出.{0,20}(系统|隐藏)/,
];

/** Conservative stopword set; meaning-bearing short words (no, not) stay. */
const STOPWORDS = new Set([
  "the",
  "and",
  "for",
  "are",
  "was",
  "were",
  "is",
  "of",
  "an",
  "how",
  "what",
  "when",
  "where",
  "who",
  "why",
  "does",
  "do",
  "did",
  "to",
  "in",
  "on",
  "at",
  "by",
  "it",
  "its",
  "this",
  "that",
  "these",
  "those",
  "with",
  "you",
  "your",
  "our",
  "we",
  "they",
  "them",
  "be",
  "been",
  "being",
  "has",
  "have",
  "had",
  "will",
  "would",
  "can",
  "could",
  "should",
  "may",
  "might",
  "must",
  "or",
  "if",
  "then",
  "than",
  "so",
  "but",
  "about",
  "into",
  "over",
  "under",
  "from",
  "as",
]);

function tokenize(text: string): string[] {
  const bounded = text.slice(0, MAX_QUERY_CHARS);
  const normalized = bounded
    .normalize("NFKD")
    .replace(/\p{M}+/gu, "")
    .toLowerCase();
  return normalized
    .split(/[^\p{L}\p{N}]+/u)
    .filter((token) => token.length >= 2)
    .slice(0, MAX_TOKENS);
}

function byId(a: ConciergeCorpusRecord, b: ConciergeCorpusRecord): number {
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

function navigationOf(
  records: readonly ConciergeCorpusRecord[],
): ConciergeCorpusRecord[] {
  return records.filter((record) => record.kind === "route").sort(byId);
}

function classify(
  state: ConciergeQueryState,
  matches: ConciergeCorpusRecord[],
  navigation: ConciergeCorpusRecord[],
  reason: string,
): ConciergeClassification {
  return { state, matches, navigation, reason };
}

export function classifyConciergeQuery(
  query: unknown,
  corpus: readonly ConciergeCorpusRecord[],
): ConciergeClassification {
  const records = Array.isArray(corpus) ? corpus : [];
  const navigation = navigationOf(records);
  const text = typeof query === "string" ? query : "";

  if (
    ADVERSARIAL_PATTERNS.some((pattern) =>
      pattern.test(text.slice(0, MAX_QUERY_CHARS)),
    )
  ) {
    return classify(
      "adversarial",
      [],
      navigation,
      "instruction-shaped input refused",
    );
  }

  const tokens = [
    ...new Set(tokenize(text).filter((token) => !STOPWORDS.has(token))),
  ];
  if (tokens.length === 0) {
    return classify("unknown", [], navigation, "empty query");
  }

  const scored = records
    .map((record) => {
      const recordTokens = new Set(tokenize(`${record.title} ${record.text}`));
      let score = 0;
      for (const token of tokens) {
        if (recordTokens.has(token)) score += 1;
      }
      return { record, score };
    })
    .filter((entry) => entry.score >= MIN_MATCH);

  if (scored.length === 0) {
    return classify("unknown", [], navigation, "no corpus support");
  }

  const topScore = Math.max(...scored.map((entry) => entry.score));
  const top = scored
    .filter((entry) => entry.score === topScore)
    .map((entry) => entry.record);
  const bestRank = Math.min(
    ...top.map((record) => KIND_RANK[record.kind] ?? 9),
  );
  const winners = top
    .filter((record) => (KIND_RANK[record.kind] ?? 9) === bestRank)
    .sort(byId);

  if (winners.length > 1) {
    return classify(
      "ambiguous",
      winners,
      navigation,
      "multiple equally supported records",
    );
  }

  return classify("supported", winners, navigation, "single best record");
}

export function validateConciergeAnswer(
  answer: ConciergeAnswerCandidate | null | undefined,
  corpus: readonly ConciergeCorpusRecord[],
): ConciergeAnswerVerdict {
  const records = Array.isArray(corpus) ? corpus : [];
  const allowed = new Set<string>();
  for (const record of records) {
    allowed.add(record.id);
    for (const sourceId of record.sourceIds ?? []) allowed.add(sourceId);
  }

  const ids = Array.isArray(answer?.sourceIds) ? answer.sourceIds : [];
  if (ids.length === 0) {
    return { ok: false, rejected: ["<missing source ids>"] };
  }

  const rejected = ids.filter(
    (id) => typeof id !== "string" || !allowed.has(id),
  );
  return { ok: rejected.length === 0, rejected };
}
