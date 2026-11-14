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

/** A product price in its own currency, or null when the shop gives none. Falls back to "12.50 EUR" for a currency code the runtime does not know. */
export function formatPrice(price: number | null, currency: string, intlLocale: string): string | null {
  if (price === null) {
    return null;
  }

  try {
    return new Intl.NumberFormat(intlLocale, { style: 'currency', currency }).format(price);
  } catch {
    return `${price.toFixed(2)} ${currency}`;
  }
}

/** Product links come from third-party feeds: only web links are ever opened. */
export function isWebUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}
