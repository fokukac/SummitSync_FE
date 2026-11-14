import { startsBlock } from '@/features/event/messages-cache';

const message = (userId: number, at: string) => ({ user: { id: userId, name: 'x', username: 'x', avatar: null }, created_at: at });

describe('startsBlock', () => {
  it('starts a block for the first message', () => {
    expect(startsBlock(message(1, '2026-11-07T05:00:00Z'), undefined)).toBe(true);
  });

  it('continues a block for the same sender within five minutes', () => {
    expect(startsBlock(message(1, '2026-11-07T05:03:00Z'), message(1, '2026-11-07T05:00:00Z'))).toBe(false);
  });

  it('starts a new block for another sender or after a long pause', () => {
    expect(startsBlock(message(2, '2026-11-07T05:01:00Z'), message(1, '2026-11-07T05:00:00Z'))).toBe(true);
    expect(startsBlock(message(1, '2026-11-07T05:06:00Z'), message(1, '2026-11-07T05:00:00Z'))).toBe(true);
  });
});
