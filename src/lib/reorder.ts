/** A copy of `items` with the one at `index` moved by `offset` places; unchanged when that would leave the list. */
export function moveItem<T>(items: readonly T[], index: number, offset: -1 | 1): T[] {
  const target = index + offset;

  if (index < 0 || index >= items.length || target < 0 || target >= items.length) {
    return [...items];
  }

  const moved = [...items];
  [moved[index], moved[target]] = [moved[target], moved[index]];

  return moved;
}
