import NetInfo from '@react-native-community/netinfo';
import { onlineManager } from '@tanstack/react-query';
import { useSyncExternalStore } from 'react';
import { Platform } from 'react-native';

/**
 * Feeds the device's connectivity to TanStack Query, which pauses requests (and queued writes) while offline and
 * resumes them on reconnect. The web needs nothing: Query already listens to the browser's online/offline events.
 * `isInternetReachable` is null until the first check; that counts as online so a cold start is not blocked.
 */
export function startOnlineTracking(): void {
  if (Platform.OS !== 'web') {
    onlineManager.setEventListener((setOnline) =>
      NetInfo.addEventListener((state) => setOnline(state.isConnected !== false && state.isInternetReachable !== false)),
    );
  }
}

export function useOnline(): boolean {
  return useSyncExternalStore(
    (notify) => onlineManager.subscribe(notify),
    () => onlineManager.isOnline(),
  );
}
