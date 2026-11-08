import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const KEY = 'summitsync.token';

/**
 * The API token lives in the platform keystore on Android/iOS. SecureStore does not exist on the web, where
 * localStorage is the only option (readable by any script on the page - hence the strict CSP on the site).
 */
export const tokenStorage = {
  async get(): Promise<string | null> {
    return Platform.OS === 'web' ? globalThis.localStorage?.getItem(KEY) ?? null : SecureStore.getItemAsync(KEY);
  },

  async set(token: string): Promise<void> {
    if (Platform.OS === 'web') {
      globalThis.localStorage?.setItem(KEY, token);
    } else {
      await SecureStore.setItemAsync(KEY, token);
    }
  },

  async clear(): Promise<void> {
    if (Platform.OS === 'web') {
      globalThis.localStorage?.removeItem(KEY);
    } else {
      await SecureStore.deleteItemAsync(KEY);
    }
  },
};
