import { formatEventDateTime, initials } from '@/lib/format';

describe('formatEventDateTime', () => {
  it('shows the wall-clock time of the event timezone, not the device zone', () => {
    const iso = '2026-11-08T06:00:00Z';

    expect(formatEventDateTime(iso, 'Europe/Bratislava', 'en-GB')).toContain('07:00');
    expect(formatEventDateTime(iso, 'Europe/Bucharest', 'en-GB')).toContain('08:00');
  });

  it('does not crash on an unknown timezone', () => {
    expect(() => formatEventDateTime('2026-11-08T06:00:00Z', 'Not/AZone', 'en-GB')).not.toThrow();
  });
});

describe('initials', () => {
  it('takes the first letters of the first two words', () => {
    expect(initials('Alice Admin')).toBe('AA');
    expect(initials('  low   tatras hikers ')).toBe('LT');
    expect(initials('Madonna')).toBe('M');
    expect(initials('')).toBe('');
  });
});
