import Pusher from 'pusher-js';

import { API_URL, session } from '@/api/client';

export type RealtimeConfig = { key: string; host: string; port: number; tls: boolean; authEndpoint: string };

/**
 * Where the Reverb server is. The key is public (the website ships it to every browser). The host defaults to the
 * API's host and the port to 8080; `https` APIs mean TLS (wss) on the same port unless overridden.
 */
export function realtimeConfig(apiUrl: string, env: { key?: string; host?: string; port?: string } = {}): RealtimeConfig | null {
  if (!env.key) {
    return null;
  }

  const url = new URL(apiUrl);

  return {
    key: env.key,
    host: env.host || url.hostname,
    port: Number(env.port || 8080),
    tls: url.protocol === 'https:',
    authEndpoint: `${apiUrl}/api/v1/broadcasting/auth`,
  };
}

let pusher: Pusher | null = null;

/** One shared connection for the whole app, created on first use. Null when realtime is not configured. */
export function getPusher(): Pusher | null {
  if (pusher) {
    return pusher;
  }

  const config = realtimeConfig(API_URL, {
    key: process.env.EXPO_PUBLIC_REVERB_KEY,
    host: process.env.EXPO_PUBLIC_REVERB_HOST,
    port: process.env.EXPO_PUBLIC_REVERB_PORT,
  });

  if (!config) {
    return null;
  }

  pusher = new Pusher(config.key, {
    cluster: 'mt1', // required by the client, unused by Reverb
    wsHost: config.host,
    wsPort: config.port,
    wssPort: config.port,
    forceTLS: config.tls,
    enabledTransports: ['ws', 'wss'],
    disableStats: true,
    // Private channels are authorized by the API with the bearer token (not a session cookie).
    channelAuthorization: {
      endpoint: config.authEndpoint,
      transport: 'ajax',
      headersProvider: () => ({ Authorization: `Bearer ${session.token}`, Accept: 'application/json' }),
    },
  });

  return pusher;
}

/** Closes the connection (sign-out): the next sign-in must authorize its channels with its own token. */
export function disconnectRealtime(): void {
  pusher?.disconnect();
  pusher = null;
}
