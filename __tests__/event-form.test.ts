import { eventBody, fromFieldDateTime, toFieldDateTime } from '@/lib/event-values';

describe('date fields', () => {
  it('shows the API wall-clock value as "YYYY-MM-DD HH:mm"', () => {
    expect(toFieldDateTime('2026-11-08T07:00')).toBe('2026-11-08 07:00');
    expect(toFieldDateTime('2026-11-08T07:00:00')).toBe('2026-11-08 07:00');
    expect(toFieldDateTime(null)).toBe('');
  });

  it('sends the typed value back as "YYYY-MM-DDTHH:mm", and null when empty', () => {
    expect(fromFieldDateTime(' 2026-11-08 07:00 ')).toBe('2026-11-08T07:00');
    expect(fromFieldDateTime('')).toBeNull();
    expect(fromFieldDateTime('   ')).toBeNull();
  });
});

describe('eventBody', () => {
  const values = {
    title: 'Ride',
    description: '',
    startsAt: '2026-11-08 07:00',
    endsAt: '',
    timezone: 'Europe/Bratislava',
    place: { name: '', latitude: null, longitude: null },
    status: 'draft',
    activityIds: [1, 2],
  };

  it('turns empty optional fields into nulls', () => {
    expect(eventBody(values)).toEqual({
      title: 'Ride',
      description: null,
      timezone: 'Europe/Bratislava',
      starts_at: '2026-11-08T07:00',
      ends_at: null,
      location_name: null,
      latitude: null,
      longitude: null,
      status: 'draft',
      activity_ids: [1, 2],
    });
  });

  it('keeps a pinned place', () => {
    expect(eventBody({ ...values, place: { name: 'Parking', latitude: 49.1, longitude: 20.2 } })).toMatchObject({
      location_name: 'Parking',
      latitude: 49.1,
      longitude: 20.2,
    });
  });
});
