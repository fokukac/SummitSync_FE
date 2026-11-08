import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Platform, View } from 'react-native';

import { api } from '@/api/client';
import { useAuth } from '@/auth/auth-context';
import { Button, ErrorText, Screen, TextField } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { Avatar } from '@/components/ui';
import { useI18n } from '@/i18n';
import { useFormState } from '@/lib/use-form';

export default function ProfileScreen() {
  const { user } = useAuth();

  return (
    <Screen>
      <PhotoSection />
      <DetailsSection key={user?.id} />
      <EmailSection />
    </Screen>
  );
}

function PhotoSection() {
  const { t } = useI18n();
  const { user, setUser } = useAuth();
  const photo = useFormState();

  async function pick() {
    const picked = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.9 });
    const asset = picked.canceled ? undefined : picked.assets[0];

    if (!asset) {
      return;
    }

    const form = new FormData();

    if (Platform.OS === 'web') {
      form.append('avatar', await (await fetch(asset.uri)).blob(), asset.fileName ?? 'photo.jpg');
    } else {
      // React Native's FormData takes a { uri, name, type } descriptor instead of a Blob.
      form.append('avatar', { uri: asset.uri, name: asset.fileName ?? 'photo.jpg', type: asset.mimeType ?? 'image/jpeg' } as unknown as Blob);
    }

    const result = await photo.run(api.POST('/v1/me/avatar', { body: { avatar: '' }, bodySerializer: () => form }));

    if (result?.data) {
      setUser(result.data.data);
    }
  }

  async function remove() {
    const result = await photo.run(api.DELETE('/v1/me/avatar'));

    if (result?.data) {
      setUser(result.data.data);
    }
  }

  return (
    <View style={{ gap: 12, alignItems: 'flex-start' }}>
      <Avatar name={user?.name ?? ''} uri={user?.avatar} size={88} />
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Button title={t(user?.avatar ? 'settings.profile.photo.change' : 'settings.profile.photo.upload')} onPress={() => void pick()} loading={photo.busy} />
        {user?.avatar ? <Button variant="plain" title={t('settings.profile.photo.remove')} onPress={() => void remove()} /> : null}
      </View>
      <ThemedText type="small" themeColor="textSecondary">
        {t('settings.profile.photo.hint')}
      </ThemedText>
      {photo.errors.avatar ? <ErrorText>{photo.errors.avatar}</ErrorText> : null}
      {photo.message !== undefined ? <ErrorText>{photo.message || t('common.somethingWrong')}</ErrorText> : null}
    </View>
  );
}

function DetailsSection() {
  const { t } = useI18n();
  const { user, setUser } = useAuth();
  const [name, setName] = useState(user?.name ?? '');
  const [username, setUsername] = useState(user?.username ?? '');
  const form = useFormState();
  const [saved, setSaved] = useState(false);

  async function save() {
    setSaved(false);
    const result = await form.run(api.PATCH('/v1/me', { body: { name, username, locale: (user?.locale ?? 'en') as 'en' | 'hu' | 'ro' } }));

    if (result?.data) {
      setUser(result.data.data);
      setSaved(true);
    }
  }

  return (
    <View style={{ gap: 12 }}>
      <ThemedText type="smallBold">{t('settings.profile.title')}</ThemedText>
      <TextField label={t('auth.name')} value={name} onChangeText={setName} error={form.errors.name} autoComplete="name" />
      <TextField label={t('auth.username')} value={username} onChangeText={setUsername} error={form.errors.username} autoCapitalize="none" />
      {form.message !== undefined ? <ErrorText>{form.message || t('common.somethingWrong')}</ErrorText> : null}
      <Button title={t('common.save')} onPress={() => void save()} loading={form.busy} />
      {saved ? (
        <ThemedText type="small" themeColor="textSecondary">
          {t('common.saveChanges')} ✓
        </ThemedText>
      ) : null}
    </View>
  );
}

function EmailSection() {
  const { t } = useI18n();
  const { user, setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const form = useFormState();

  async function request() {
    const result = await form.run(api.POST('/v1/me/email', { body: { email, current_password: password } }));

    if (result?.data) {
      setUser(result.data.data);
      setEmail('');
      setPassword('');
    }
  }

  async function cancel() {
    const result = await form.run(api.DELETE('/v1/me/email'));

    if (result?.data) {
      setUser(result.data.data);
    }
  }

  return (
    <View style={{ gap: 12 }}>
      <ThemedText type="smallBold">{t('settings.email.change.title')}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {user?.email}
      </ThemedText>
      {!user?.can_change_email ? (
        <ThemedText type="small" themeColor="textSecondary">
          {t('settings.email.locked')}
        </ThemedText>
      ) : user.pending_email ? (
        <>
          <ThemedText type="small">{t('settings.email.pending', { email: user.pending_email })}</ThemedText>
          <Button variant="plain" title={t('settings.email.cancel')} onPress={() => void cancel()} loading={form.busy} />
        </>
      ) : (
        <>
          <TextField
            label={t('settings.email.new')}
            value={email}
            onChangeText={setEmail}
            error={form.errors.email}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextField
            label={t('settings.email.password')}
            value={password}
            onChangeText={setPassword}
            error={form.errors.current_password}
            secureTextEntry
            autoComplete="current-password"
          />
          {form.message !== undefined ? <ErrorText>{form.message || t('common.somethingWrong')}</ErrorText> : null}
          <Button title={t('settings.email.send')} onPress={() => void request()} loading={form.busy} />
        </>
      )}
    </View>
  );
}
