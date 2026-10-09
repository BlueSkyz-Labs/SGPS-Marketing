export type PublicMailboxRole =
  "contact" | "support" | "privacy" | "security" | "founder";

const ROLE_ALIAS: Record<PublicMailboxRole, string | string[]> = {
  // Temporary (owner 2026-10-08): accept tony@ as contact until hello@ is live.
  contact: ["hello", "tony"],
  support: "support",
  privacy: "privacy",
  security: "security",
  founder: "tony",
};

/** Return a mailbox only when its exact address matches its public purpose. */
export function publicMailboxForRole(
  value: string | undefined | null,
  role: PublicMailboxRole,
): string | null {
  const normalized = value?.trim().toLowerCase();
  if (!normalized) return null;

  const match = /^([a-z0-9][a-z0-9._+-]*)@blueskyzlabs\.com$/.exec(normalized);
  const allowed = ROLE_ALIAS[role];
  const ok = Array.isArray(allowed)
    ? allowed.includes(match?.[1] ?? "")
    : match?.[1] === allowed;
  return ok ? normalized : null;
}
