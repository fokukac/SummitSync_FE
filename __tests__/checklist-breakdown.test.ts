import { breakdownRows } from '@/lib/checklist-breakdown';

const items = [
  { id: 1, label: 'Helmet' },
  { id: 2, label: 'Water' },
];

const person = { name: 'Ana', username: 'ana', avatar: null };

describe('breakdownRows', () => {
  it('marks each item per person and counts what they checked', () => {
    const [row] = breakdownRows({ items, participants: [{ id: 7, ...person, checked_item_ids: [2] }] });

    expect(row.items).toEqual([
      { id: 1, label: 'Helmet', checked: false },
      { id: 2, label: 'Water', checked: true },
    ]);
    expect([row.done, row.total]).toEqual([1, 2]);
    expect(row.person).toEqual({ id: 7, ...person });
  });

  it('ignores ids that are no longer on the list', () => {
    const [row] = breakdownRows({ items, participants: [{ id: 7, ...person, checked_item_ids: [2, 99] }] });

    expect(row.done).toBe(1);
  });

  it('has no rows when nobody is attending', () => {
    expect(breakdownRows({ items, participants: [] })).toEqual([]);
  });
});
