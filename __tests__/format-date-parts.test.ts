import { formatDateParts } from '@/lib/format';

describe('formatDateParts', () => {
  it('splits an event start into the parts of a calendar tile, in the event timezone', () => {
    // 05:00 UTC is 07:00 in Bucharest (EET, UTC+2) in November.
    expect(formatDateParts('2026-11-07T05:00:00Z', 'Europe/Bucharest', 'en-GB')).toEqual({ day: '7', month: 'Nov', time: '07:00' });
  });

  it('falls back to the device zone for an unknown timezone instead of throwing', () => {
    expect(() => formatDateParts('2026-11-07T05:00:00Z', 'Not/AZone', 'en-GB')).not.toThrow();
  });
});
