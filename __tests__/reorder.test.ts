import { moveItem } from '@/lib/reorder';

describe('moveItem', () => {
  it('moves an item up or down', () => {
    expect(moveItem([1, 2, 3], 1, -1)).toEqual([2, 1, 3]);
    expect(moveItem([1, 2, 3], 1, 1)).toEqual([1, 3, 2]);
  });

  it('leaves the list alone at the ends', () => {
    expect(moveItem([1, 2, 3], 0, -1)).toEqual([1, 2, 3]);
    expect(moveItem([1, 2, 3], 2, 1)).toEqual([1, 2, 3]);
  });

  it('never changes the original', () => {
    const original = [1, 2, 3];
    moveItem(original, 0, 1);

    expect(original).toEqual([1, 2, 3]);
  });
});
