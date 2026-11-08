import * as Device from 'expo-device';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';

import { api, errorMessage, session, validationErrors } from '@/api/client';
import type { components } from '@/api/schema';
import { useI18n } from '@/i18n';
import { tokenStorage } from '@/lib/token-storage';

export type User = components['schemas']['UserResource'];

export type AuthResult =
  | { status: 'ok' }
  | { status: 'two_factor'; challengeToken: string }
  | { status: 'error'; message?: string; errors: Record<string, string> };

type Auth = {
  /** False until the stored token has been checked against the server. */
  ready: boolean;
  user: User | null;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (input: { name: string; username: string; email: string; password: string; passwordConfirmation: string }) => Promise<AuthResult>;
  completeTwoFactor: (challengeToken: string, input: { code?: string; recoveryCode?: string }) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  /** Re-reads the account, e.g. after the user verified their email in the browser. */
  refresh: () => Promise<void>;
  /** Replaces the cached account with a fresher copy the server just returned (profile, avatar, two-factor...). */
  setUser: (user: User) => void;
};

const AuthContext = createContext<Auth | null>(null);

const deviceName = () => `${Device.deviceName ?? Device.modelName ?? Platform.OS} (${Platform.OS})`;

export function AuthProvider({ children }: { children: ReactNode }) {
  const { locale, setLocale } = useI18n();
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const clear = useCallback(async () => {
    session.token = null;
    setUser(null);
    await tokenStorage.clear();
  }, []);

  const loadUser = useCallback(async () => {
    const { data } = await api.GET('/v1/me');

    if (data) {
      setUser(data.data);
      // The account's language is authoritative (the server localizes emails and error messages with it).
      setLocale(data.data.locale);
    }
  }, [setLocale]);

  // Declared first so the language is set before the bootstrap request below goes out.
  useEffect(() => {
    session.locale = locale;
  }, [locale]);

  useEffect(() => {
    session.onUnauthorized = () => void clear();

    void (async () => {
      const stored = await tokenStorage.get();

      if (stored !== null) {
        session.token = stored;
        await loadUser();
      }

      setReady(true);
    })();

    return () => {
      session.onUnauthorized = null;
    };
  }, [clear, loadUser]);

  const accept = useCallback(
    async (token: string): Promise<AuthResult> => {
      session.token = token;
      await tokenStorage.set(token);
      await loadUser();

      return { status: 'ok' };
    },
    [loadUser],
  );

  const value = useMemo<Auth>(
    () => ({
      ready,
      user,

      async signIn(email, password) {
        const { data, error } = await api.POST('/v1/auth/login', {
          body: { email, password, device_name: deviceName() },
        });

        if (data && 'two_factor' in data) {
          return { status: 'two_factor', challengeToken: data.challenge_token };
        }

        return data ? accept(data.data.token) : { status: 'error', message: errorMessage(error), errors: validationErrors(error) };
      },

      async signUp(input) {
        const { data, error } = await api.POST('/v1/auth/register', {
          body: {
            name: input.name,
            username: input.username,
            email: input.email,
            password: input.password,
            password_confirmation: input.passwordConfirmation,
            device_name: deviceName(),
          },
        });

        return data ? accept(data.data.token) : { status: 'error', message: errorMessage(error), errors: validationErrors(error) };
      },

      async completeTwoFactor(challengeToken, input) {
        const { data, error } = await api.POST('/v1/auth/two-factor-challenge', {
          body: { challenge_token: challengeToken, code: input.code, recovery_code: input.recoveryCode },
        });

        return data ? accept(data.data.token) : { status: 'error', message: errorMessage(error), errors: validationErrors(error) };
      },

      async signOut() {
        await api.POST('/v1/auth/logout').catch(() => undefined);
        await clear();
      },

      refresh: loadUser,
      setUser,
    }),
    [ready, user, accept, clear, loadUser, setUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): Auth {
  const context = useContext(AuthContext);

  if (context === null) {
    throw new Error('useAuth must be used inside <AuthProvider>');
  }

  return context;
}
