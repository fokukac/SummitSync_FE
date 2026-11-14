import { router } from 'expo-router';
import { useEffect } from 'react';

import AppTabs from '@/components/app-tabs';
import { pendingInvitation } from '@/lib/pending-invitation';

export default function AppLayout() {
  // An invite link opened while signed out (or unverified) is picked up here, once the account can use it. It lives
  // in this layout (not the root one) so the navigator has already switched to the app screens when it navigates.
  useEffect(() => {
    const token = pendingInvitation.take();

    if (token !== null) {
      router.push({ pathname: '/invitations/[token]', params: { token } });
    }
  }, []);

  return <AppTabs />;
}
