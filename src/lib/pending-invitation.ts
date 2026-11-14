/**
 * The invite link a visitor opened before they could use it (signed out, or email not verified yet). Kept in memory
 * only: it has to survive the login/registration/verification screens, not an app restart.
 */
let pending: string | null = null;

export const pendingInvitation = {
  set(token: string): void {
    pending = token;
  },

  /** Returns the remembered token once and forgets it. */
  take(): string | null {
    const token = pending;
    pending = null;

    return token;
  },
};
