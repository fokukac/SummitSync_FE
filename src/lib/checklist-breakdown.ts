type Person = { id: number; name: string; username: string; avatar: string | null; checked_item_ids: number[] };
type Breakdown = { items: { id: number; label: string }[]; participants: Person[] };

export type BreakdownRow = {
  person: Omit<Person, 'checked_item_ids'>;
  done: number;
  total: number;
  items: { id: number; label: string; checked: boolean }[];
};

/** One row per person: every checklist item with whether they checked it, plus how many they did. */
export function breakdownRows(breakdown: Breakdown): BreakdownRow[] {
  return breakdown.participants.map(({ checked_item_ids, ...person }) => {
    const checked = new Set(checked_item_ids);
    const items = breakdown.items.map((item) => ({ ...item, checked: checked.has(item.id) }));

    return { person, done: items.filter((item) => item.checked).length, total: items.length, items };
  });
}
