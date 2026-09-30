/**
 * Bounded URL-state parser for the public dossier composer.
 *
 * Query state is attacker-controlled presentation input. Keep it small before
 * splitting or rendering so a crafted link cannot amplify into unbounded DOM
 * work. Oversized input fails closed as a whole: no partial selection is used.
 */

export const MAX_DOSSIER_URL_VALUE_CHARS = 4096;
export const MAX_DOSSIER_URL_ITEMS = 64;

export interface DossierUrlState {
  ids: string[];
  oversized: boolean;
}

export function parseDossierUrlState(search: string): DossierUrlState {
  const raw = new URLSearchParams(search).get("items");
  if (!raw) return { ids: [], oversized: false };

  if (raw.length > MAX_DOSSIER_URL_VALUE_CHARS) {
    return { ids: [], oversized: true };
  }

  const tokens = raw.split(",");
  if (tokens.length > MAX_DOSSIER_URL_ITEMS) {
    return { ids: [], oversized: true };
  }

  const ids: string[] = [];
  const seen = new Set<string>();
  for (const token of tokens) {
    const id = token.trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    ids.push(id);
  }

  return { ids, oversized: false };
}
