import { filterByPeople, jumpTarget, peopleOf, togglePerson } from '@/features/event/messages-cache';

const user = (id: number) => ({ id, name: `U${id}`, username: `u${id}`, avatar: null });
const msg = (id: number, userId: number, at: string) => ({ id, user: user(userId), created_at: at });

describe('peopleOf', () => {
  it('groups message ids per person, most recently active first', () => {
    const people = peopleOf([
      msg(1, 1, '2026-11-07T05:00:00Z'),
      msg(2, 2, '2026-11-07T05:01:00Z'),
      msg(3, 1, '2026-11-07T05:02:00Z'),
      msg(4, 2, '2026-11-07T05:01:30Z'),
    ]);

    expect(people.map((p) => [p.user.id, p.ids])).toEqual([
      [1, [1, 3]],
      [2, [2, 4]],
    ]);
  });

  it('is empty without messages', () => {
    expect(peopleOf([])).toEqual([]);
  });
});

describe('jumpTarget', () => {
  const ids = [10, 20, 30];

  it('forward starts at the oldest, then steps and wraps', () => {
    expect(jumpTarget(ids, undefined, 1, false)).toBe(0);
    expect(jumpTarget(ids, 10, 1, false)).toBe(1);
    expect(jumpTarget(ids, 30, 1, false)).toBe(0);
  });

  it('backward starts at the newest, then steps back', () => {
    expect(jumpTarget(ids, undefined, -1, false)).toBe(2);
    expect(jumpTarget(ids, 30, -1, false)).toBe(1);
  });

  it('backward from the oldest wraps, or asks for older history when there is more', () => {
    expect(jumpTarget(ids, 10, -1, false)).toBe(2);
    expect(jumpTarget(ids, 10, -1, true)).toBe(-1);
  });
});

describe('filterByPeople', () => {
  const messages = [msg(1, 1, '2026-11-07T05:00:00Z'), msg(2, 2, '2026-11-07T05:01:00Z'), msg(3, 3, '2026-11-07T05:02:00Z')];

  it('keeps everything when nobody is chosen', () => {
    expect(filterByPeople(messages, [])).toEqual(messages);
  });

  it('keeps only the chosen people, in the original order', () => {
    expect(filterByPeople(messages, [3, 1]).map((m) => m.id)).toEqual([1, 3]);
  });

  it('is empty when the chosen people have written nothing here', () => {
    expect(filterByPeople(messages, [9])).toEqual([]);
  });
});

describe('togglePerson', () => {
  it('adds a person who is not chosen and removes one who is', () => {
    expect(togglePerson([], 1)).toEqual([1]);
    expect(togglePerson([1], 2)).toEqual([1, 2]);
    expect(togglePerson([1, 2], 1)).toEqual([2]);
  });
});
