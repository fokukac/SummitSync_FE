import { useState } from 'react';
import { View } from 'react-native';

import { useAuth } from '@/auth/auth-context';
import { googleSignInAvailable } from '@/auth/google-sign-in';
import { Button, ErrorText } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { useI18n } from '@/i18n';

/** "Or continue with Google" under the sign-in and register forms. Renders nothing where native Google sign-in is unavailable. */
export function GoogleSignInButton() {
  const { t } = useI18n();
  const { signInWithGoogle } = useAuth();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string>();

  if (!googleSignInAvailable) {
    return null;
  }

  async function submit() {
    setBusy(true);
    setMessage(undefined);
    const result = await signInWithGoogle();
    setBusy(false);

    if (result.status === 'error') {
      setMessage(result.errors.email ?? result.message ?? t('common.somethingWrong'));
    }
  }

  return (
    <View style={{ gap: 12 }}>
      <ThemedText type="small" themeColor="textSecondary" style={{ textAlign: 'center' }}>
        {t('common.orContinueWith')}
      </ThemedText>
      {message ? <ErrorText>{message}</ErrorText> : null}
      <Button title="Google" variant="outline" onPress={submit} loading={busy} />
    </View>
  );
}
