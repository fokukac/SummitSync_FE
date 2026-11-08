import { Link } from 'expo-router';
import { useState } from 'react';

import { useAuth } from '@/auth/auth-context';
import { Button, ErrorText, Screen, TextField } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { useI18n } from '@/i18n';

export default function RegisterScreen() {
  const { t } = useI18n();
  const { signUp } = useAuth();
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '', passwordConfirmation: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string>();
  const [busy, setBusy] = useState(false);

  const set = (field: keyof typeof form) => (value: string) => setForm((current) => ({ ...current, [field]: value }));

  async function submit() {
    setBusy(true);
    const result = await signUp({ ...form, email: form.email.trim(), username: form.username.trim() });
    setBusy(false);

    if (result.status === 'error') {
      setErrors(result.errors);
      setMessage(Object.keys(result.errors).length === 0 ? result.message ?? t('common.somethingWrong') : undefined);
    }
  }

  return (
    <Screen>
      <ThemedText type="subtitle">{t('auth.register.title')}</ThemedText>
      <ThemedText themeColor="textSecondary">{t('auth.register.description')}</ThemedText>
      <TextField label={t('auth.name')} value={form.name} onChangeText={set('name')} error={errors.name} autoComplete="name" placeholder={t('auth.namePlaceholder')} />
      <TextField
        label={t('auth.username')}
        value={form.username}
        onChangeText={set('username')}
        error={errors.username}
        autoCapitalize="none"
        autoComplete="username-new"
        placeholder={t('auth.usernamePlaceholder')}
      />
      <TextField
        label={t('auth.email')}
        value={form.email}
        onChangeText={set('email')}
        error={errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        autoComplete="email"
        placeholder={t('auth.emailPlaceholder')}
      />
      <TextField label={t('auth.password')} value={form.password} onChangeText={set('password')} error={errors.password} secureTextEntry autoComplete="new-password" />
      <TextField
        label={t('auth.confirmPassword')}
        value={form.passwordConfirmation}
        onChangeText={set('passwordConfirmation')}
        error={errors.password_confirmation}
        secureTextEntry
        autoComplete="new-password"
        onSubmitEditing={submit}
      />
      {message ? <ErrorText>{message}</ErrorText> : null}
      <Button title={t('auth.register.submit')} onPress={submit} loading={busy} />
      <ThemedText type="small" themeColor="textSecondary">
        {t('auth.haveAccount')}{' '}
        <Link href="/" style={{ fontWeight: '700' }}>
          {t('nav.login')}
        </Link>
      </ThemedText>
    </Screen>
  );
}
