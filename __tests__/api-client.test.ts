import { session, validationErrors } from '@/api/client';
import { api } from '@/api/client';

describe('validationErrors', () => {
  it('keeps the first message per field', () => {
    expect(validationErrors({ message: 'x', errors: { email: ['Taken', 'Other'], name: ['Required'] } })).toEqual({
      email: 'Taken',
      name: 'Required',
    });
  });

  it('is empty for anything else', () => {
    expect(validationErrors(undefined)).toEqual({});
    expect(validationErrors({ message: 'Server error' })).toEqual({});
  });
});

describe('api middleware', () => {
  const fetchMock = jest.fn();
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    fetchMock.mockReset();
    globalThis.fetch = fetchMock as unknown as typeof fetch;
    session.token = null;
    session.locale = 'en';
    session.onUnauthorized = null;
  });

  afterAll(() => {
    globalThis.fetch = originalFetch;
  });

  const jsonResponse = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

  it('sends the bearer token, language and JSON accept header', async () => {
    session.token = 'secret';
    session.locale = 'hu';
    fetchMock.mockResolvedValue(jsonResponse(200, { data: {} }));

    await api.GET('/v1/me');

    const request = fetchMock.mock.calls[0][0] as Request;
    expect(request.headers.get('Authorization')).toBe('Bearer secret');
    expect(request.headers.get('Accept-Language')).toBe('hu');
    expect(request.headers.get('Accept')).toBe('application/json');
  });

  it('signs the user out when an authenticated call gets a 401', async () => {
    const onUnauthorized = jest.fn();
    session.token = 'expired';
    session.onUnauthorized = onUnauthorized;
    fetchMock.mockResolvedValue(jsonResponse(401, { message: 'Unauthenticated.' }));

    await api.GET('/v1/me');

    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it('does not treat a 401 without a token as an expired session', async () => {
    const onUnauthorized = jest.fn();
    session.onUnauthorized = onUnauthorized;
    fetchMock.mockResolvedValue(jsonResponse(401, { message: 'Unauthenticated.' }));

    await api.GET('/v1/me');

    expect(onUnauthorized).not.toHaveBeenCalled();
  });
});
