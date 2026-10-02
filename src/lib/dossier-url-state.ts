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

/**
 * Serialize a selection back into a query string, round-trip safe.
 *
 * The result is accepted only if the bounded parser above reads it back as
 * exactly the same ids; anything the parser would reject (or alter) yields
 * `null`, so a written URL can never be one the reader refuses. Other query
 * parameters are preserved untouched.
 */
export function buildSelectionSearch(
  currentSearch: string,
  selectionParam: string,
  ids: readonly string[],
): string | null {
  if (currentSearch.length > DOSSIER_QUERY_MAX_LENGTH) return null;
  const params = new URLSearchParams(currentSearch);
  const unique = [...new Set(ids)];
  if (unique.length === 0) {
    params.delete(selectionParam);
  } else {
    params.set(selectionParam, unique.join(","));
  }
  const text = params.toString();
  const search = text === "" ? "" : `?${text}`;
  const check = parseDossierSearch(search, selectionParam);
  if (
    check.status !== "ok" ||
    check.ids.length !== unique.length ||
    check.ids.some((id, index) => id !== unique[index])
  ) {
    return null;
  }
  return search;
}

/**
 * Write a selection into the address bar with `history.replaceState` only:
 * same document, no new history entry, no navigation, no storage.
 * Returns whether the URL was updated.
 */
export function writeSelectionToUrl(
  win: Pick<Window, "location" | "history">,
  selectionParam: string,
  ids: readonly string[],
): boolean {
  const search = buildSelectionSearch(win.location.search, selectionParam, ids);
  if (search === null) return false;
  const { pathname, hash } = win.location;
  try {
    win.history.replaceState(
      win.history.state,
      "",
      `${pathname}${search}${hash}`,
    );
    return true;
  } catch {
    return false;
  }
}
