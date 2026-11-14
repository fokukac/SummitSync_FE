import { Linking, Platform, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { useState } from 'react';

import { api, deleteBody } from '@/api/client';
import { useAuth } from '@/auth/auth-context';
import { CodeBlock } from '@/components/code-block';
import { Button, ErrorText, FormGroup, Screen, TextField } from '@/components/form';
import { SectionTitle } from '@/components/section-title';
import { ThemedText } from '@/components/themed-text';
import { useShape } from '@/hooks/use-theme';
import { useI18n } from '@/i18n';
import { useFormState } from '@/lib/use-form';

export default function SecurityScreen() {
  return (
    <Screen form>
      <FormGroup first>
        <PasswordSection />
      </FormGroup>
      <FormGroup>
        <TwoFactorSection />
      </FormGroup>
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
    <View style={{ gap: 16 }}>
      <SectionTitle title={t(user?.has_password ? 'settings.security.password.title' : 'settings.security.password.setTitle')} />
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
  const shape = useShape();
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
    <View style={{ gap: 16 }}>
      <SectionTitle title={t('twofa.enable.title')} />

      {setup ? (
        <>
          <ThemedText type="small" themeColor="textSecondary">
            {t('twofa.enable.description')}
          </ThemedText>
          <View style={{ alignItems: 'center', padding: 12, backgroundColor: '#ffffff', borderRadius: shape.radius, alignSelf: 'flex-start' }}>
            <QRCode value={setup.otpauthUrl} size={180} />
          </View>
          {Platform.OS !== 'web' ? (
            <Button compact variant="plain" title={t('twofa.enable.title')} onPress={() => void Linking.openURL(setup.otpauthUrl)} />
          ) : null}
          <ThemedText type="small" themeColor="textSecondary">
            {t('twofa.manualCode')}
          </ThemedText>
          <CodeBlock codes={[setup.secret]} />
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
          <Button compact variant="plain" title={t('common.cancel')} onPress={() => void cancelSetup()} />
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
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
            <Button compact variant="plain" title={t('twofa.recovery.regenerate')} onPress={() => void regenerate()} loading={form.busy} />
            <Button compact variant="plain" title={t('settings.security.twofa.disable')} onPress={() => void disable()} />
          </View>
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

  return <CodeBlock codes={codes} title={t('twofa.recovery.title')} hint={t('twofa.recovery.description')} />;
}
