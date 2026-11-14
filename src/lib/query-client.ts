import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import type { PersistQueryClientProviderProps } from '@tanstack/react-query-persist-client';
import Constants from 'expo-constants';

import { registerOfflineMutations } from '@/features/event/offline-mutations';
import { startOnlineTracking } from '@/lib/online';

const WEEK = 7 * 24 * 60 * 60 * 1000;

startOnlineTracking();

export const queryClient = new QueryClient({
  defaultOptions: {
    // gcTime must be at least the persisted maxAge, or restored data is discarded as unused.
    queries: { retry: 1, staleTime: 30_000, gcTime: WEEK },
    // Ordinary writes still try at once and fail fast when offline; only the keyed, queued ones (offline-mutations.ts) wait.
    mutations: { networkMode: 'always' },
  },
});

registerOfflineMutations(queryClient);

const persister = createAsyncStoragePersister({ storage: AsyncStorage, key: 'summitsync.query-cache', throttleTime: 1000 });

export const persistOptions: PersistQueryClientProviderProps['persistOptions'] = {
  persister,
  maxAge: WEEK,
  // A new app version may change the shape of cached data: start clean rather than risk a crash.
  buster: Constants.expoConfig?.version ?? '1',
  dehydrateOptions: {
    // Search results are throwaway; everything else that loaded is worth having offline.
    shouldDehydrateQuery: (query) => query.state.status === 'success' && query.queryKey[0] !== 'search',
    // Only writes still waiting for a connection survive a restart.
    shouldDehydrateMutation: (mutation) => mutation.state.isPaused,
  },
};

/** Sign-out (or an expired session): nothing of the account may stay on the device. */
export async function clearOfflineData(): Promise<void> {
  queryClient.clear();
  await persister.removeClient();
}
