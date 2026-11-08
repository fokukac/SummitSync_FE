import { useState } from 'react';

import { api } from '@/api/client';
import { useAuth } from '@/auth/auth-context';
import { Button, Screen } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { useI18n } from '@/i18n';

/** Unverified accounts only reach `me` and `auth/*` on the API, so this is all they can do until they verify. */
export default function VerifyEmailScreen() {
  const { t } = useI18n();
  const { user, refresh, signOut } = useAuth();
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function resend() {
    setBusy(true);
    const { response } = await api.POST('/v1/auth/email/verification-notification');
    setBusy(false);
    setSent(response.ok);
  }

  return (
    <Screen>
      <ThemedText type="subtitle">{t('auth.verify.title')}</ThemedText>
      <ThemedText themeColor="textSecondary">{t('auth.verify.description')}</ThemedText>
      <ThemedText type="smallBold">{user?.email}</ThemedText>
      {sent ? <ThemedText type="small">{t('auth.verify.sent')}</ThemedText> : null}
      <Button title={t('auth.verify.resend')} onPress={resend} loading={busy} />
      <Button variant="plain" title={t('common.continue')} onPress={() => void refresh()} />
      <Button variant="plain" title={t('nav.logout')} onPress={() => void signOut()} />
    </Screen>
  );
}
