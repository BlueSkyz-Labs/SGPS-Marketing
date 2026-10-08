export type PublicMailboxRole =
  "contact" | "support" | "privacy" | "security" | "founder";

const ROLE_ALIAS: Record<PublicMailboxRole, string> = {
  contact: "hello",
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
  return match?.[1] === ROLE_ALIAS[role] ? normalized : null;
}
