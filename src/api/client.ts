import createClient, { type Middleware } from 'openapi-fetch';
import { Platform } from 'react-native';

import type { paths } from '@/api/schema';

/**
 * The Android emulator reaches the host machine as 10.0.2.2; everything else uses localhost.
 * Set `EXPO_PUBLIC_API_URL` (e.g. https://summitsync.example) for real builds.
 */
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? (Platform.OS === 'android' ? 'http://10.0.2.2' : 'http://localhost');

type Session = {
  token: string | null;
  locale: string;
  onUnauthorized: (() => void) | null;
};

/** Mutable on purpose: the auth and i18n providers keep it in sync, the middleware reads it per request. */
export const session: Session = { token: null, locale: 'en', onUnauthorized: null };

const middleware: Middleware = {
  onRequest({ request }) {
    request.headers.set('Accept', 'application/json');
    request.headers.set('Accept-Language', session.locale);

    if (session.token !== null) {
      request.headers.set('Authorization', `Bearer ${session.token}`);
    }

    return request;
  },

  onResponse({ response, request }) {
    // 401 on an authenticated call means the token expired or was revoked. (A failed login is a 422.)
    if (response.status === 401 && request.headers.has('Authorization')) {
      session.onUnauthorized?.();
    }
  },
};

export const api = createClient<paths>({
  baseUrl: `${API_URL}/api`,
  // Looked up per call (not captured at import time) so tests and polyfills can replace global fetch.
  fetch: (request) => globalThis.fetch(request),
});
api.use(middleware);

/** Laravel validation errors: `{ message, errors: { field: [messages] } }`. */
export function validationErrors(error: unknown): Record<string, string> {
  const errors = (error as { errors?: Record<string, string[]> } | undefined)?.errors ?? {};

  return Object.fromEntries(Object.entries(errors).map(([field, messages]) => [field, messages[0] ?? '']));
}

export function errorMessage(error: unknown): string | undefined {
  return (error as { message?: string } | undefined)?.message;
}

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: unknown,
  ) {
    super(errorMessage(body) ?? `Request failed (${status})`);
  }
}

type Result<T> = { data?: T; error?: unknown; response: Response };

/** Turns an openapi-fetch result into its data, or throws `ApiError`: what TanStack Query expects of a `queryFn`. */
export async function unwrap<T>(request: PromiseLike<Result<T>>): Promise<T> {
  const { data, error, response } = await request;

  if (data === undefined) {
    throw new ApiError(response.status, error);
  }

  return data;
}

/** For endpoints that answer 204 No Content: success means "no error", there is no body to return. */
export async function unwrapVoid(request: PromiseLike<{ error?: unknown; response: Response }>): Promise<void> {
  const { error, response } = await request;

  if (!response.ok) {
    throw new ApiError(response.status, error);
  }
}
