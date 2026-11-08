import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { useAuth } from '@/auth/auth-context';
import { Button, ErrorText, Screen, TextField } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { useI18n } from '@/i18n';

/** Second step of a sign-in for accounts with two-factor authentication (`challenge` comes from the login call). */
export default function TwoFactorScreen() {
  const { t } = useI18n();
  const { completeTwoFactor } = useAuth();
  const { challenge } = useLocalSearchParams<{ challenge: string }>();
  const [useRecovery, setUseRecovery] = useState(false);
  const [value, setValue] = useState('');
  const [error, setError] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    const result = await completeTwoFactor(challenge, useRecovery ? { recoveryCode: value.trim() } : { code: value.trim() });
    setBusy(false);

    if (result.status === 'error') {
      setError(result.errors.code ?? result.errors.recovery_code ?? result.errors.challenge_token ?? result.message ?? t('common.somethingWrong'));
    }
  }

  return (
    <Screen>
      <ThemedText type="subtitle">{t(useRecovery ? 'auth.twofa.recovery.title' : 'auth.twofa.code.title')}</ThemedText>
      <ThemedText themeColor="textSecondary">{t(useRecovery ? 'auth.twofa.recovery.description' : 'auth.twofa.code.description')}</ThemedText>
      <TextField
        label={t(useRecovery ? 'auth.twofa.recovery.title' : 'auth.twofa.code.title')}
        value={value}
        onChangeText={setValue}
        keyboardType={useRecovery ? 'default' : 'number-pad'}
        autoCapitalize="none"
        autoComplete="one-time-code"
        placeholder={useRecovery ? t('auth.twofa.recovery.placeholder') : '123456'}
        onSubmitEditing={submit}
      />
      {error ? <ErrorText>{error}</ErrorText> : null}
      <Button title={t('common.continue')} onPress={submit} loading={busy} />
      <Button
        variant="plain"
        title={t(useRecovery ? 'auth.twofa.recovery.toggle' : 'auth.twofa.code.toggle')}
        onPress={() => {
          setUseRecovery((current) => !current);
          setValue('');
          setError(undefined);
        }}
      />
    </Screen>
  );
}
