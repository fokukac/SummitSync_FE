import { realtimeConfig } from '@/lib/realtime';

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
