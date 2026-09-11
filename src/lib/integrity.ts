import { INTEGRITY_ENTRIES, type IntegrityEntry } from "@/data/integrity";

const ENTRIES: readonly IntegrityEntry[] = INTEGRITY_ENTRIES;

/** All integrity entries for a given surface ID (fail-closed: [] today). */
export function getIntegrityEntriesForSurface(
  surface: string,
): IntegrityEntry[] {
  return ENTRIES.filter((entry) => entry.surface === surface);
}

/** Single integrity entry by ID, or undefined when not published. */
export function getIntegrityEntry(id: string): IntegrityEntry | undefined {
  return ENTRIES.find((entry) => entry.id === id);
}
