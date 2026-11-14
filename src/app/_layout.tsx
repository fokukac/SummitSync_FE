import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, type ReactNode } from 'react';

import { AuthProvider, useAuth } from '@/auth/auth-context';
import { I18nProvider } from '@/i18n';
import { AppThemeProvider, useAppTheme } from '@/theme/theme-provider';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({ defaultOptions: { queries: { retry: 1, staleTime: 30_000 } } });

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <NavigationTheme>
        <I18nProvider>
          <AuthProvider>
            <QueryClientProvider client={queryClient}>
              <Routes />
            </QueryClientProvider>
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
