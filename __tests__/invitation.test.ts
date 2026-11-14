import { invitationView } from '@/lib/invitation';

const verified = { email_verified: true };

describe('invitationView', () => {
  it('asks signed-out visitors to log in, without needing a lookup', () => {
    expect(invitationView(null, undefined)).toBe('signedOut');
  });

  it('sends unverified accounts to email verification (the API refuses them)', () => {
    expect(invitationView({ email_verified: false }, undefined)).toBe('unverified');
  });

  it('waits for the lookup', () => {
    expect(invitationView(verified, undefined)).toBe('loading');
  });

  it.each(['revoked', 'expired', 'exhausted', 'email_mismatch', null])('treats status %s as unavailable', (status) => {
    expect(invitationView(verified, { status, already_member: false })).toBe('unavailable');
  });

  it('offers to join a valid invitation, or open the group for an existing member', () => {
    expect(invitationView(verified, { status: 'valid', already_member: false })).toBe('joinable');
    expect(invitationView(verified, { status: 'valid', already_member: true })).toBe('alreadyMember');
  });
});
