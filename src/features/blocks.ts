import { useQuery } from '@tanstack/react-query';

import { api, unwrap } from '@/api/client';

/** The people you blocked. Shared by the settings list and the live chat (which must hide their new messages). */
export function useBlocked() {
  return useQuery({ queryKey: ['me', 'blocks'], queryFn: async () => (await unwrap(api.GET('/v1/me/blocks'))).data });
}
