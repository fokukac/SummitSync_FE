import { formatPrice, isWebUrl } from '@/lib/format';

describe('formatPrice', () => {
  it('has no price when the shop gives none', () => {
    expect(formatPrice(null, 'RON', 'en')).toBeNull();
  });

  it('formats in the product currency', () => {
    expect(formatPrice(12.5, 'EUR', 'en')).toContain('12.50');
    expect(formatPrice(12.5, 'EUR', 'en')).toContain('€');
  });

  it('falls back to a plain amount for an unknown currency code', () => {
    expect(formatPrice(12.5, 'not-a-currency', 'en')).toBe('12.50 not-a-currency');
  });
});

describe('isWebUrl', () => {
  it('accepts only http(s) links', () => {
    expect(isWebUrl('https://shop.example/p/1')).toBe(true);
    expect(isWebUrl('http://shop.example/p/1')).toBe(true);
    expect(isWebUrl('javascript:alert(1)')).toBe(false);
    expect(isWebUrl('intent://x')).toBe(false);
  });
});
