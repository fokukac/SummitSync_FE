import type { components } from '@/api/schema';

type Lookup = { status: string | null; already_member: boolean };

/** What an invitation link screen shows, from the account state and the server's answer to the lookup. */
export type InvitationView = 'signedOut' | 'unverified' | 'loading' | 'unavailable' | 'alreadyMember' | 'joinable';

export function invitationView(user: Pick<components['schemas']['UserResource'], 'email_verified'> | null, lookup: Lookup | undefined): InvitationView {
  if (user === null) {
    return 'signedOut';
  }

  if (!user.email_verified) {
    return 'unverified';
  }

  if (lookup === undefined) {
    return 'loading';
  }

  if (lookup.status !== 'valid') {
    return 'unavailable';
  }

  return lookup.already_member ? 'alreadyMember' : 'joinable';
}
