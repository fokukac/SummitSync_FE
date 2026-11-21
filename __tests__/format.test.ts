import { formatEventDateTime, initials, formatEventRange } from '@/lib/format';

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

describe('formatEventRange', () => {
  const tz = 'Europe/Bucharest';

  it('is only the start without an end', () => {
    expect(formatEventRange('2026-11-22T07:00:00Z', null, tz, 'en')).toBe(formatEventDateTime('2026-11-22T07:00:00Z', tz, 'en'));
  });

  it('adds only the end time when it is the same day', () => {
    const text = formatEventRange('2026-11-22T07:00:00Z', '2026-11-22T15:00:00Z', tz, 'en');

    expect(text).toContain('November 22, 2026');
    expect(text).toMatch(/ – 5:00\s?PM$/);
  });

  it('gives the end in full when it is another day', () => {
    const text = formatEventRange('2026-11-22T07:00:00Z', '2026-11-24T15:00:00Z', tz, 'en');

    expect(text).toContain('November 24, 2026');
  });

  it('compares days in the event timezone, not the device one', () => {
    // 22:30Z is already the 23rd in Bucharest (UTC+2), so this crosses midnight there.
    const text = formatEventRange('2026-11-22T20:00:00Z', '2026-11-22T22:30:00Z', tz, 'en');

    expect(text).toContain('November 23, 2026');
  });
});
