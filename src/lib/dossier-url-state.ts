/**
 * Bounded parser for the dossier composer's URL-carried selection state.
 *
 * This is a client-availability boundary, not an authorization boundary:
 * the composer still intersects parsed ids with the server-rendered allowlist.
 */
export const DOSSIER_QUERY_MAX_LENGTH = 4096;
export const DOSSIER_ITEMS_MAX_RAW_LENGTH = 2048;
export const DOSSIER_ITEMS_MAX_COUNT = 64;
export const DOSSIER_ITEM_MAX_LENGTH = 128;

export type DossierSelectionRejectReason =
  "query-too-long" | "items-too-long" | "too-many-items" | "item-too-long";

export type DossierSelectionParseResult =
  | { status: "ok"; ids: string[]; reason: null }
  | { status: "rejected"; ids: []; reason: DossierSelectionRejectReason };

export function parseDossierSelection(
  raw: string | null,
): DossierSelectionParseResult {
  if (raw === null || raw.trim() === "") {
    return { status: "ok", ids: [], reason: null };
  }

  if (raw.length > DOSSIER_ITEMS_MAX_RAW_LENGTH) {
    return { status: "rejected", ids: [], reason: "items-too-long" };
  }

  const tokens = raw.split(",");
  if (tokens.length > DOSSIER_ITEMS_MAX_COUNT) {
    return { status: "rejected", ids: [], reason: "too-many-items" };
  }

  const ids: string[] = [];
  const seen = new Set<string>();

  for (const token of tokens) {
    const id = token.trim();
    if (id.length === 0) continue;
    if (id.length > DOSSIER_ITEM_MAX_LENGTH) {
      return { status: "rejected", ids: [], reason: "item-too-long" };
    }
    if (seen.has(id)) continue;
    seen.add(id);
    ids.push(id);
  }

  return { status: "ok", ids, reason: null };
}

export function parseDossierSearch(
  search: string,
  selectionParam = "items",
): DossierSelectionParseResult {
  if (search.length > DOSSIER_QUERY_MAX_LENGTH) {
    return { status: "rejected", ids: [], reason: "query-too-long" };
  }
  const raw = new URLSearchParams(search).get(selectionParam);
  return parseDossierSelection(raw);
}
