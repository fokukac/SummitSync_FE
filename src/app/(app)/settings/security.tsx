import * as Clipboard from 'expo-clipboard';
import { Linking, Platform, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useState } from 'react';

import { api, deleteBody } from '@/api/client';
import { useAuth } from '@/auth/auth-context';
import { Button, ErrorText, Screen, TextField } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui';
import { useI18n } from '@/i18n';
import { useFormState } from '@/lib/use-form';

export default function SecurityScreen() {
  return (
    <Screen>
      <PasswordSection />
      <TwoFactorSection />
    </Screen>
  );
}

function PasswordSection() {
  const { t } = useI18n();
  const { user } = useAuth();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [saved, setSaved] = useState(false);
  const form = useFormState();

  async function save() {
    setSaved(false);
    const result = await form.run(
      api.PUT('/v1/me/password', { body: { current_password: user?.has_password ? current : undefined, password: next, password_confirmation: confirmation } }),
    );

    if (result) {
      setCurrent('');
      setNext('');
      setConfirmation('');
      setSaved(true);
    }
  }

  return (
    <View style={{ gap: 12 }}>
      <ThemedText type="smallBold">{t(user?.has_password ? 'settings.security.password.title' : 'settings.security.password.setTitle')}</ThemedText>
      {user?.has_password ? (
        <TextField
          label={t('settings.security.currentPassword')}
          value={current}
          onChangeText={setCurrent}
          error={form.errors.current_password}
          secureTextEntry
          autoComplete="current-password"
        />
      ) : null}
      <TextField
        label={t('settings.security.newPassword')}
        value={next}
        onChangeText={setNext}
        error={form.errors.password}
        secureTextEntry
        autoComplete="new-password"
      />
      <TextField
        label={t('auth.confirmPassword')}
        value={confirmation}
        onChangeText={setConfirmation}
        error={form.errors.password_confirmation}
        secureTextEntry
        autoComplete="new-password"
      />
      {form.message !== undefined ? <ErrorText>{form.message || t('common.somethingWrong')}</ErrorText> : null}
      <Button title={t('settings.security.save')} onPress={() => void save()} loading={form.busy} />
      {saved ? (
        <ThemedText type="small" themeColor="textSecondary">
          {t('common.saveChanges')} ✓
        </ThemedText>
      ) : null}
    </View>
  );
}

type Setup = { secret: string; otpauthUrl: string; recoveryCodes: string[]; password: string };

function TwoFactorSection() {
  const { t } = useI18n();
  const { user, refresh } = useAuth();
  const [password, setPassword] = useState('');
  const [setup, setSetup] = useState<Setup>();
  const [code, setCode] = useState('');
  const [codes, setCodes] = useState<string[]>();
  const form = useFormState();

  if (!user) {
    return null;
  }

  async function start() {
    const result = await form.run(api.POST('/v1/me/two-factor', { body: { current_password: password } }));

    if (result?.data) {
      const { secret, otpauth_url, recovery_codes } = result.data.data;
      setSetup({ secret, otpauthUrl: otpauth_url, recoveryCodes: recovery_codes, password });
      setPassword('');
    }
  }

  async function confirm() {
    const result = await form.run(api.POST('/v1/me/two-factor/confirm', { body: { code: code.trim() } }));

    if (result) {
      setCodes(setup?.recoveryCodes);
      setSetup(undefined);
      setCode('');
      await refresh();
    }
  }

  async function cancelSetup() {
    await form.run(api.DELETE('/v1/me/two-factor', deleteBody({ current_password: setup?.password ?? '' })));
    setSetup(undefined);
    setCode('');
  }

  async function disable() {
    const result = await form.run(api.DELETE('/v1/me/two-factor', deleteBody({ current_password: password })));

    if (result) {
      setPassword('');
      setCodes(undefined);
      await refresh();
    }
  }

  async function regenerate() {
    const result = await form.run(api.POST('/v1/me/two-factor/recovery-codes', { body: { current_password: password } }));

    if (result?.data) {
      setCodes(result.data.data.recovery_codes);
      setPassword('');
    }
  }

  const failure = form.errors.current_password ?? form.errors.code ?? (form.message !== undefined ? form.message || t('common.somethingWrong') : undefined);

  return (
    <View style={{ gap: 12 }}>
      <ThemedText type="smallBold">{t('twofa.enable.title')}</ThemedText>

      {setup ? (
        <>
          <ThemedText type="small" themeColor="textSecondary">
            {t('twofa.enable.description')}
          </ThemedText>
          <View style={{ alignItems: 'center', padding: 12, backgroundColor: '#ffffff', borderRadius: 8, alignSelf: 'flex-start' }}>
            <QRCode value={setup.otpauthUrl} size={180} />
          </View>
          {Platform.OS !== 'web' ? <Button variant="plain" title={t('twofa.enable.title')} onPress={() => void Linking.openURL(setup.otpauthUrl)} /> : null}
          <ThemedText type="small" themeColor="textSecondary">
            {t('twofa.manualCode')}
          </ThemedText>
          <Card onPress={() => void Clipboard.setStringAsync(setup.secret)}>
            <ThemedText type="code" selectable>
              {setup.secret}
            </ThemedText>
          </Card>
          <RecoveryCodes codes={setup.recoveryCodes} />
          <TextField
            label={t('twofa.verify.title')}
            value={code}
            onChangeText={setCode}
            keyboardType="number-pad"
            autoComplete="one-time-code"
            placeholder="123456"
          />
          {failure ? <ErrorText>{failure}</ErrorText> : null}
          <Button title={t('common.confirm')} onPress={() => void confirm()} loading={form.busy} />
          <Button variant="plain" title={t('common.cancel')} onPress={() => void cancelSetup()} />
        </>
      ) : user.two_factor_enabled ? (
        <>
          <ThemedText type="small" themeColor="textSecondary">
            {t('settings.security.twofa.on')}
          </ThemedText>
          {codes ? <RecoveryCodes codes={codes} /> : null}
          <TextField
            label={t('settings.security.currentPassword')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="current-password"
          />
          {failure ? <ErrorText>{failure}</ErrorText> : null}
          <Button variant="plain" title={t('twofa.recovery.regenerate')} onPress={() => void regenerate()} loading={form.busy} />
          <Button variant="plain" title={t('settings.security.twofa.disable')} onPress={() => void disable()} />
        </>
      ) : !user.has_password ? (
        <ThemedText type="small" themeColor="textSecondary">
          {t('settings.security.twofa.needsPassword')}
        </ThemedText>
      ) : (
        <>
          <ThemedText type="small" themeColor="textSecondary">
            {t('settings.security.twofa.off')}
          </ThemedText>
          <TextField
            label={t('settings.security.currentPassword')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="current-password"
          />
          {failure ? <ErrorText>{failure}</ErrorText> : null}
          <Button title={t('settings.security.twofa.enable')} onPress={() => void start()} loading={form.busy} />
        </>
      )}
    </View>
  );
}

/** Shown right after they are created: the server never shows them again, so the person must save them now. */
function RecoveryCodes({ codes }: { codes: string[] }) {
  const { t } = useI18n();

  return (
    <Card onPress={() => void Clipboard.setStringAsync(codes.join('\n'))}>
      <ThemedText type="smallBold">{t('twofa.recovery.title')}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {t('twofa.recovery.description')}
      </ThemedText>
      {codes.map((recovery) => (
        <ThemedText key={recovery} type="code" selectable>
          {recovery}
        </ThemedText>
      ))}
    </Card>
  );
}
