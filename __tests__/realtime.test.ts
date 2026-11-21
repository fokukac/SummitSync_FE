import { realtimeConfig, resolvePusher } from '@/lib/realtime';

describe('resolvePusher', () => {
  class Fake {}

  it('takes the class when the module is the class (browser build)', () => {
    expect(resolvePusher(Fake)).toBe(Fake);
  });

  it('takes `Pusher` when the module is `{ Pusher }` (React Native build)', () => {
    expect(resolvePusher({ Pusher: Fake })).toBe(Fake);
  });

  it('takes `default` when the module is an ES module namespace', () => {
    expect(resolvePusher({ __esModule: true, default: Fake })).toBe(Fake);
  });

  it('fails loudly instead of a vague "not a constructor" when nothing usable is exported', () => {
    expect(() => resolvePusher({})).toThrow('pusher-js did not export a constructor');
  });
});

describe('realtimeConfig', () => {
  it('is off without an app key', () => {
    expect(realtimeConfig('http://localhost', {})).toBeNull();
  });

  it('defaults to the API host and port 8080, without TLS for http', () => {
    expect(realtimeConfig('http://localhost', { key: 'k' })).toEqual({
      key: 'k',
      host: 'localhost',
      port: 8080,
      tls: false,
      authEndpoint: 'http://localhost/api/v1/broadcasting/auth',
    });
  });

  it('uses TLS for https APIs and honours overrides', () => {
    expect(realtimeConfig('https://summit.example', { key: 'k', host: 'ws.summit.example', port: '443' })).toMatchObject({
      host: 'ws.summit.example',
      port: 443,
      tls: true,
    });
  });

  it('points channel authorization at the API with the bearer token route', () => {
    expect(realtimeConfig('http://10.0.2.2', { key: 'k' })?.authEndpoint).toBe('http://10.0.2.2/api/v1/broadcasting/auth');
  });
});
