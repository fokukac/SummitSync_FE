import { Link, router } from 'expo-router';
import { useState } from 'react';

import { Button, ErrorText, Screen, TextField } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/auth/auth-context';
import { useI18n } from '@/i18n';

export default function LoginScreen() {
  const { t } = useI18n();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string>();
  const [busy, setBusy] = useState(false);

  async function submit() {
    setBusy(true);
    const result = await signIn(email.trim(), password);
    setBusy(false);

    if (result.status === 'two_factor') {
      router.push({ pathname: '/two-factor', params: { challenge: result.challengeToken } });
    } else if (result.status === 'error') {
      setErrors(result.errors);
      setMessage(Object.keys(result.errors).length === 0 ? result.message ?? t('common.somethingWrong') : undefined);
    }
  }

  return (
    <Screen>
      <ThemedText type="subtitle">{t('auth.login.title')}</ThemedText>
      <ThemedText themeColor="textSecondary">{t('auth.login.description')}</ThemedText>
      <TextField
        label={t('auth.email')}
        value={email}
        onChangeText={setEmail}
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        textContentType="username"
        placeholder={t('auth.emailPlaceholder')}
      />
      <TextField
        label={t('auth.password')}
        value={password}
        onChangeText={setPassword}
        error={errors.password}
        secureTextEntry
        autoComplete="current-password"
        textContentType="password"
        onSubmitEditing={submit}
      />
      {message ? <ErrorText>{message}</ErrorText> : null}
      <Button title={t('nav.login')} onPress={submit} loading={busy} />
      <ThemedText type="small" themeColor="textSecondary">
        {t('auth.noAccount')}{' '}
        <Link href="/register" style={{ fontWeight: '700' }}>
          {t('nav.signup')}
        </Link>
      </ThemedText>
    </Screen>
  );
}
