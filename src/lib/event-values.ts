import type { Place } from '@/features/forms/place-picker';

export type EventValues = {
  title: string;
  description: string;
  /** Wall-clock `YYYY-MM-DD HH:mm` in `timezone` (the server stores UTC). */
  startsAt: string;
  endsAt: string;
  timezone: string;
  place: Place;
  status: string;
  activityIds: number[];
};

export const deviceTimezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

/** `2026-11-08T07:00` (what the API returns for forms) to the text field format. */
export const toFieldDateTime = (local: string | null | undefined) => (local ? local.replace('T', ' ').slice(0, 16) : '');

/** Text field format to the `YYYY-MM-DDTHH:mm` the API expects; null when empty. */
export const fromFieldDateTime = (text: string) => (text.trim() === '' ? null : text.trim().replace(' ', 'T'));

/** The request body both create and update send. */
export function eventBody(values: EventValues) {
  return {
    title: values.title,
    description: values.description || null,
    timezone: values.timezone,
    starts_at: fromFieldDateTime(values.startsAt) ?? '',
    ends_at: fromFieldDateTime(values.endsAt),
    location_name: values.place.name || null,
    latitude: values.place.latitude,
    longitude: values.place.longitude,
    status: values.status as 'draft' | 'published',
    activity_ids: values.activityIds,
  };
}
