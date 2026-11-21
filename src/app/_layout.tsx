import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, type ReactNode } from 'react';

import { AuthProvider, useAuth } from '@/auth/auth-context';
import { I18nProvider } from '@/i18n';
import { persistOptions, queryClient } from '@/lib/query-client';
import { AppThemeProvider, useAppTheme } from '@/theme/theme-provider';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <NavigationTheme>
        <I18nProvider>
          <AuthProvider>
            <PersistQueryClientProvider client={queryClient} persistOptions={persistOptions} onSuccess={() => void queryClient.resumePausedMutations()}>
              <Routes />
            </PersistQueryClientProvider>
          </AuthProvider>
        </I18nProvider>
      </NavigationTheme>
    </AppThemeProvider>
  );
}

/** Feeds the chosen theme's colours to React Navigation (headers, screen backgrounds, transitions). */
function NavigationTheme({ children }: { children: ReactNode }) {
  const { scheme, colors } = useAppTheme();
  const base = scheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <ThemeProvider
      value={{
        ...base,
        colors: { ...base.colors, primary: colors.primary, background: colors.background, card: colors.background, text: colors.text, border: colors.border },
      }}
    >
      {/* Light icons on a dark page and the other way round (the system default follows the phone, not the chosen theme). */}
      <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
      {children}
    </ThemeProvider>
  );
}

/** Three states, three route groups: signed out, signed in but unverified, signed in and verified. */
function Routes() {
  const { ready: authReady, user } = useAuth();
  const { ready: themeReady } = useAppTheme();
  const ready = authReady && themeReady;

  useEffect(() => {
    if (ready) {
      void SplashScreen.hideAsync();
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={user === null}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>
      <Stack.Protected guard={user !== null && !user.email_verified}>
        <Stack.Screen name="verify-email" />
      </Stack.Protected>
      <Stack.Protected guard={user !== null && user.email_verified}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  );
}
