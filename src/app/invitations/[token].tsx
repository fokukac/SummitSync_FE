import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';

import { api, ApiError, errorMessage, unwrap } from '@/api/client';
import { useAuth } from '@/auth/auth-context';
import { Button, ErrorText, Screen } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { Card, QueryState } from '@/components/ui';
import { useI18n } from '@/i18n';
import { invitationView } from '@/lib/invitation';
import { pendingInvitation } from '@/lib/pending-invitation';

/**
 * Opened from an invite link (`summitsync://invitations/{token}` or the website URL on web). Reachable signed out on
 * purpose: the visitor logs in from here, and this screen is still underneath afterwards to finish the join.
 */
export default function InvitationScreen() {
  const { t } = useI18n();
  const { token } = useLocalSearchParams<{ token: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const verified = user !== null && user.email_verified;

  const lookup = useQuery({
    queryKey: ['invitation', token],
    queryFn: async () => unwrap(api.GET('/v1/invitations/{invitation}', { params: { path: { invitation: token } } })),
    enabled: verified,
    retry: false,
  });

  const accept = useMutation({
    mutationFn: () => unwrap(api.POST('/v1/invitations/{invitation}', { params: { path: { invitation: token } } })),
    onSuccess: ({ data }) => {
      void queryClient.invalidateQueries({ queryKey: ['me', 'groups'] });
      void queryClient.invalidateQueries({ queryKey: ['groups'] });
      void queryClient.invalidateQueries({ queryKey: ['group', data.slug] });
      router.replace({ pathname: '/groups/[slug]', params: { slug: data.slug } });
    },
  });

  /** A token that does not exist (mistyped or deleted link) answers 404: the same dead end as a revoked one, not a retryable error. */
  const notFound = lookup.error instanceof ApiError && lookup.error.status === 404;
  useEffect(() => {
    if (!verified) {
      pendingInvitation.set(token);
    }
  }, [verified, token]);

  const view = invitationView(user, lookup.data);
  const valid = lookup.data?.status === 'valid' ? lookup.data : undefined;
  const unusableMessage = lookup.data?.status !== 'valid' ? lookup.data?.message : undefined;
  const openGroup = (slug: string) => router.replace({ pathname: '/groups/[slug]', params: { slug } });

  return (
    <Screen>
      <ThemedText type="title">{t('invitations.head')}</ThemedText>

      {view === 'signedOut' ? (
        <Card>
          <ThemedText>{t('invitations.loginPrompt')}</ThemedText>
          <Button title={t('nav.login')} onPress={() => router.push('/')} />
          <Button variant="plain" title={t('nav.signup')} onPress={() => router.push('/register')} />
        </Card>
      ) : null}

      {view === 'unverified' ? <Button title={t('auth.verify.title')} onPress={() => router.push('/verify-email')} /> : null}

      {verified && notFound ? (
        <Card>
          <ThemedText type="subtitle">{t('invitations.unavailable')}</ThemedText>
          <Button variant="plain" title={t('landing.browse')} onPress={() => router.replace('/')} />
        </Card>
      ) : null}

      {verified && !notFound ? (
        <QueryState query={lookup}>
          {view === 'unavailable' ? (
            <Card>
              <ThemedText type="subtitle">{t('invitations.unavailable')}</ThemedText>
              <ThemedText themeColor="textSecondary">{unusableMessage}</ThemedText>
              <Button variant="plain" title={t('landing.browse')} onPress={() => router.replace('/')} />
            </Card>
          ) : null}

          {(view === 'alreadyMember' || view === 'joinable') && valid ? (
            <Card>
              <ThemedText themeColor="textSecondary">{t('invitations.invitedYou', { name: valid.invited_by })}</ThemedText>
              <ThemedText type="subtitle">{valid.group.name}</ThemedText>
              {valid.group.description ? <ThemedText>{valid.group.description}</ThemedText> : null}
              <ThemedText type="small" themeColor="textSecondary">
                {t('groups.membersCount', { count: valid.group.members_count })}
              </ThemedText>
              {view === 'alreadyMember' ? (
                <>
                  <ThemedText>{t('invitations.alreadyMember')}</ThemedText>
                  <Button title={t('invitations.openGroup')} onPress={() => openGroup(valid.group.slug)} />
                </>
              ) : (
                <>
                  <Button title={t('groups.join')} loading={accept.isPending} onPress={() => accept.mutate()} />
                  {accept.error ? <ErrorText>{errorMessage((accept.error as { body?: unknown }).body) ?? t('common.somethingWrong')}</ErrorText> : null}
                </>
              )}
            </Card>
          ) : null}
        </QueryState>
      ) : null}
    </Screen>
  );
}
