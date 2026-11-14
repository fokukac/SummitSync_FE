const pad = (value: number) => String(value).padStart(2, '0');

/**
 * `YYYY-MM-DD HH:mm` (a form's wall-clock text, in the event's own timezone) to a `Date` whose *local* fields hold
 * those same numbers. The pickers only read and write fields, so the timezone never changes what is shown; null when
 * the text is empty or not a real date.
 */
export function fieldToDate(text: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})$/.exec(text.trim());

  if (match === null) {
    return null;
  }

  const [year, month, day, hour, minute] = match.slice(1).map(Number);
  const date = new Date(year, month - 1, day, hour, minute);

  // `new Date(2026, 1, 31)` rolls over to March: that is not the date that was typed.
  const same = date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day && date.getHours() === hour;

  return same ? date : null;
}

/** The reverse: the local fields of `date` as `YYYY-MM-DD HH:mm`. */
export function dateToField(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/** The day from `day` with the time of day from `time` (a date dialog followed by a time dialog). */
export function combineDayAndTime(day: Date, time: Date): Date {
  return new Date(day.getFullYear(), day.getMonth(), day.getDate(), time.getHours(), time.getMinutes());
}

/** Where a picker opens when nothing is set: the next full hour, or the suggested value (an end time opens at the start). */
export function pickerStart(suggest: string, now: Date = new Date()): Date {
  const suggested = fieldToDate(suggest);

  if (suggested !== null) {
    return suggested;
  }

  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0);
}
