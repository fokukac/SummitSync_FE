import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Clipboard from 'expo-clipboard';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Platform, Share, View } from 'react-native';

import { api, unwrap, unwrapVoid } from '@/api/client';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Button, ErrorText, Screen, TextField } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { Card, QueryState } from '@/components/ui';
import { fromFieldDateTime } from '@/lib/event-values';
import { useI18n } from '@/i18n';
import { formatShortDateTime } from '@/lib/format';
import { useFormState } from '@/lib/use-form';

export default function InvitationsScreen() {
  const { t, intlLocale } = useI18n();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const queryClient = useQueryClient();
  const queryKey = ['group', slug, 'invitations'];
  const [revoking, setRevoking] = useState<string>();
  const [copied, setCopied] = useState<string>();

  const invitations = useQuery({
    queryKey,
    queryFn: async () => (await unwrap(api.GET('/v1/groups/{group}/invitations', { params: { path: { group: slug } } }))).data,
  });

  const revoke = useMutation({
    mutationFn: (token: string) =>
      unwrapVoid(api.DELETE('/v1/groups/{group}/invitations/{invitation}', { params: { path: { group: slug, invitation: token } } })),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey }),
    onSettled: () => setRevoking(undefined),
  });

  async function share(url: string) {
    if (Platform.OS === 'web') {
      await Clipboard.setStringAsync(url);
      setCopied(url);
    } else {
      await Share.share({ message: url });
    }
  }

  return (
    <Screen>
      <Stack.Screen options={{ title: t('invitations.section.title') }} />
      <CreateInvitation slug={slug} onCreated={() => void queryClient.invalidateQueries({ queryKey })} />
      <QueryState query={invitations} empty={invitations.data?.length === 0} emptyText={t('invitations.section.none')}>
        {invitations.data?.map((invitation) => (
          <Card key={invitation.token}>
            <ThemedText type="small" selectable numberOfLines={2}>
              {invitation.url}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary">
              {[
                invitation.max_uses === null
                  ? t('invitations.used', { count: invitation.used_count })
                  : t('invitations.usedOf', { count: invitation.used_count, max: invitation.max_uses }),
                invitation.email ? t('invitations.forEmail', { email: invitation.email }) : null,
                invitation.expires_at
                  ? t('invitations.expires', { date: formatShortDateTime(invitation.expires_at, Intl.DateTimeFormat().resolvedOptions().timeZone, intlLocale) })
                  : null,
              ]
                .filter(Boolean)
                .join(' · ')}
            </ThemedText>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button
                variant="plain"
                title={copied === invitation.url ? t('invitations.copied') : t('common.copy')}
                onPress={() => void share(invitation.url)}
              />
              <Button variant="plain" title={t('invitations.revoke')} onPress={() => setRevoking(invitation.token)} />
            </View>
          </Card>
        ))}
      </QueryState>
      <ConfirmDialog
        visible={revoking !== undefined}
        title={t('invitations.revoke.title')}
        description={t('invitations.revoke.description')}
        confirmLabel={t('invitations.revoke.confirm')}
        loading={revoke.isPending}
        onCancel={() => setRevoking(undefined)}
        onConfirm={() => revoking && revoke.mutate(revoking)}
      />
    </Screen>
  );
}

function CreateInvitation({ slug, onCreated }: { slug: string; onCreated: () => void }) {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [maxUses, setMaxUses] = useState('');
  const [expires, setExpires] = useState('');
  const form = useFormState();

  async function create() {
    const result = await form.run(
      api.POST('/v1/groups/{group}/invitations', {
        params: { path: { group: slug } },
        body: { email: email.trim() || null, max_uses: maxUses.trim() ? Number(maxUses) : null, expires_at: fromFieldDateTime(expires) },
      }),
    );

    if (result) {
      setEmail('');
      setMaxUses('');
      setExpires('');
      onCreated();
    }
  }

  return (
    <View style={{ gap: 12 }}>
      <ThemedText type="smallBold">{t('invitations.create.title')}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {t('invitations.create.description')}
      </ThemedText>
      <TextField
        label={t('invitations.create.email')}
        value={email}
        onChangeText={setEmail}
        error={form.errors.email}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholder={t('invitations.create.emailPlaceholder')}
      />
      <TextField
        label={t('invitations.create.maxUses')}
        value={maxUses}
        onChangeText={setMaxUses}
        error={form.errors.max_uses}
        keyboardType="number-pad"
        placeholder={t('invitations.create.unlimited')}
      />
      <TextField
        label={t('invitations.create.expires')}
        value={expires}
        onChangeText={setExpires}
        error={form.errors.expires_at}
        placeholder="2026-12-31 18:00"
        autoCapitalize="none"
      />
      {form.message !== undefined ? <ErrorText>{form.message || t('common.somethingWrong')}</ErrorText> : null}
      <Button title={t('invitations.create.submit')} onPress={() => void create()} loading={form.busy} />
    </View>
  );
}
