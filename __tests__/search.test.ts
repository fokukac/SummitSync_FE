import { searchTerm } from '@/lib/search';

describe('searchTerm', () => {
  it('is not a search until there are 2 real characters', () => {
    expect(searchTerm('')).toBeUndefined();
    expect(searchTerm('a')).toBeUndefined();
    expect(searchTerm('  a  ')).toBeUndefined();
  });

  it('trims what it sends', () => {
    expect(searchTerm('  zug ')).toBe('zug');
  });
});
