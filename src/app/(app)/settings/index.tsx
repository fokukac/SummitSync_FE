import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { api, deleteBody } from '@/api/client';
import { useAuth } from '@/auth/auth-context';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Button, ErrorText, TextField } from '@/components/form';
import { Page } from '@/components/page';
import { ThemedText } from '@/components/themed-text';
import { Avatar, Card } from '@/components/ui';
import { supportedLocales, useI18n } from '@/i18n';
import { useFormState } from '@/lib/use-form';

export default function SettingsScreen() {
  const { t, locale, setLocale } = useI18n();
  const { user, signOut, setUser } = useAuth();
  const [deleting, setDeleting] = useState(false);
  const [password, setPassword] = useState('');
  const form = useFormState();

  async function chooseLocale(code: string) {
    setLocale(code);
    // Saved on the account too, so the server uses it for emails and when this person signs in elsewhere.
    const result = await api.PUT('/v1/me/locale', { body: { locale: code as 'en' | 'hu' | 'ro' } });

    if (result.data) {
      setUser(result.data.data);
    }
  }

  async function deleteAccount() {
    // `password` is what the server expects (ignored when the account has none).
    const result = await form.run(api.DELETE('/v1/me', deleteBody({ password })));

    if (result) {
      setDeleting(false);
      await signOut();
    }
  }

  return (
    <Page>
      <ThemedText type="subtitle">{t('settings.title')}</ThemedText>
      <Card>
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <Avatar name={user?.name ?? ''} uri={user?.avatar} size={48} />
          <View style={{ flex: 1 }}>
            <ThemedText type="smallBold">{user?.name}</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {user?.email}
            </ThemedText>
          </View>
        </View>
      </Card>

      <Card onPress={() => router.push('/settings/profile')}>
        <ThemedText type="smallBold">{t('nav.profile')}</ThemedText>
      </Card>
      <Card onPress={() => router.push('/settings/security')}>
        <ThemedText type="smallBold">{t('nav.security')}</ThemedText>
      </Card>

      <Card onPress={() => router.push('/settings/blocked')}>
        <ThemedText type="smallBold">{t('settings.blocked.title')}</ThemedText>
      </Card>

      <ThemedText type="smallBold">{t('nav.language')}</ThemedText>
      <View style={{ flexDirection: 'row', gap: 16 }}>
        {Object.entries(supportedLocales).map(([code, name]) => (
          <Pressable key={code} accessibilityRole="button" accessibilityState={{ selected: locale === code }} onPress={() => void chooseLocale(code)}>
            <ThemedText type={locale === code ? 'smallBold' : 'small'} themeColor={locale === code ? 'text' : 'textSecondary'}>
              {name}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      <Button variant="plain" title={t('nav.logout')} onPress={() => void signOut()} />
      <Button variant="plain" title={t('settings.delete.title')} onPress={() => setDeleting(true)} />

      <ConfirmDialog
        visible={deleting}
        title={t('settings.delete.confirmTitle')}
        description={t('settings.delete.confirmDescription')}
        confirmLabel={t('settings.delete.title')}
        loading={form.busy}
        onCancel={() => {
          setDeleting(false);
          setPassword('');
          form.reset();
        }}
        onConfirm={() => void deleteAccount()}
      >
        {user?.has_password ? (
          <TextField
            label={t('settings.security.currentPassword')}
            value={password}
            onChangeText={setPassword}
            error={form.errors.password}
            secureTextEntry
            autoComplete="current-password"
          />
        ) : null}
        {form.message !== undefined ? <ErrorText>{form.message || t('common.somethingWrong')}</ErrorText> : null}
      </ConfirmDialog>
    </Page>
  );
}
