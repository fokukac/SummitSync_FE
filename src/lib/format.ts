/** Wall-clock date and time of `iso` in the event's own timezone (what organizers and participants agree on). */
export function formatEventDateTime(iso: string, timezone: string, intlLocale: string): string {
  try {
    return new Intl.DateTimeFormat(intlLocale, { dateStyle: 'full', timeStyle: 'short', timeZone: timezone }).format(new Date(iso));
  } catch {
    // Unknown timezone identifier on this runtime: fall back to the device's zone rather than crash.
    return new Intl.DateTimeFormat(intlLocale, { dateStyle: 'full', timeStyle: 'short' }).format(new Date(iso));
  }
}

export function formatShortDateTime(iso: string, timezone: string, intlLocale: string): string {
  try {
    return new Intl.DateTimeFormat(intlLocale, { dateStyle: 'medium', timeStyle: 'short', timeZone: timezone }).format(new Date(iso));
  } catch {
    return new Intl.DateTimeFormat(intlLocale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
  }
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
