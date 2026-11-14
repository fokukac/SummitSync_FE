import { combineDayAndTime, dateToField, fieldToDate, pickerStart } from '@/lib/date-field';

describe('fieldToDate / dateToField', () => {
  it('round-trips the wall-clock text', () => {
    expect(dateToField(fieldToDate('2026-11-08 07:05')!)).toBe('2026-11-08 07:05');
  });

  it('accepts the API T separator and surrounding space', () => {
    expect(dateToField(fieldToDate(' 2026-11-08T07:00 ')!)).toBe('2026-11-08 07:00');
  });

  it('is null for empty, malformed or impossible dates', () => {
    expect(fieldToDate('')).toBeNull();
    expect(fieldToDate('08.11.2026 07:00')).toBeNull();
    expect(fieldToDate('2026-02-31 07:00')).toBeNull();
    expect(fieldToDate('2026-11-08 25:00')).toBeNull();
  });
});

describe('combineDayAndTime', () => {
  it('takes the day from one date and the time from the other', () => {
    expect(dateToField(combineDayAndTime(new Date(2026, 10, 8, 3, 3), new Date(2030, 0, 1, 18, 45)))).toBe('2026-11-08 18:45');
  });
});

describe('pickerStart', () => {
  it('opens at the suggestion when there is one', () => {
    expect(dateToField(pickerStart('2026-11-08 07:00', new Date(2026, 0, 1)))).toBe('2026-11-08 07:00');
  });

  it('otherwise at the next full hour', () => {
    expect(dateToField(pickerStart('', new Date(2026, 5, 3, 9, 41)))).toBe('2026-06-03 10:00');
  });
});
