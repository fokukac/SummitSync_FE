import { useQuery } from '@tanstack/react-query';

import { api, unwrap } from '@/api/client';

/** Reference data (activities, languages, feature flags): public and rarely changing, so cached for an hour. */
export function useMeta() {
  return useQuery({ queryKey: ['meta'], staleTime: 60 * 60 * 1000, queryFn: () => unwrap(api.GET('/v1/meta')) });
}

/** False only when an admin closed sign-ups; while the flags are still loading (or unreachable) the link stays visible. */
export function useRegistrationOpen(): boolean {
  const { data } = useMeta();

  return data?.features['open-registration'] !== false;
}

/** False only when an admin switched Google sign-in off; while the flags are still loading the button stays available. */
export function useGoogleLoginOpen(): boolean {
  const { data } = useMeta();

  return data?.features['google-login'] !== false;
}
