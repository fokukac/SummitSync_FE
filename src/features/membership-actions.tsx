import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { api, errorMessage, unwrap, unwrapVoid } from '@/api/client';
import { Button, ErrorText } from '@/components/form';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { useI18n } from '@/i18n';

type Props = { can: { join: boolean; leave: boolean } };

/** Join/leave for a group. What is offered comes from the server's `can`; the server enforces it again. */
export function GroupMembershipActions({ slug, can }: Props & { slug: string }) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState(false);

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ['group', slug] });
    void queryClient.invalidateQueries({ queryKey: ['me', 'groups'] });
    void queryClient.invalidateQueries({ queryKey: ['groups'] });
  };

  const join = useMutation({ mutationFn: () => unwrap(api.POST('/v1/groups/{group}/join', { params: { path: { group: slug } } })), onSuccess: refresh });
  const leave = useMutation({
    mutationFn: () => unwrapVoid(api.DELETE('/v1/groups/{group}/leave', { params: { path: { group: slug } } })),
    onSuccess: refresh,
    onSettled: () => setConfirming(false),
  });
  const error = join.error ?? leave.error;

  return (
    <>
      {can.join ? <Button title={t('groups.join')} loading={join.isPending} onPress={() => join.mutate()} /> : null}
      {can.leave ? <Button variant="plain" title={t('groups.leave')} onPress={() => setConfirming(true)} /> : null}
      {error ? <ErrorText>{errorMessage((error as { body?: unknown }).body) ?? t('common.somethingWrong')}</ErrorText> : null}
      <ConfirmDialog
        visible={confirming}
        title={t('groups.leave.title')}
        description={t('groups.leave.description')}
        confirmLabel={t('groups.leave')}
        onCancel={() => setConfirming(false)}
        onConfirm={() => leave.mutate()}
      />
    </>
  );
}

/** Join/leave for an event; the answer is the refreshed event, so the page updates without a second request. */
export function EventMembershipActions({ eventId, can }: Props & { eventId: number }) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [confirming, setConfirming] = useState(false);

  const done = (result: { data: unknown }) => {
    queryClient.setQueryData(['event', eventId], result.data);
    void queryClient.invalidateQueries({ queryKey: ['event', eventId] });
    void queryClient.invalidateQueries({ queryKey: ['group'] });
  };

  const join = useMutation({ mutationFn: () => unwrap(api.POST('/v1/events/{event}/join', { params: { path: { event: eventId } } })), onSuccess: done });
  const leave = useMutation({
    mutationFn: () => unwrap(api.DELETE('/v1/events/{event}/leave', { params: { path: { event: eventId } } })),
    onSuccess: done,
    onSettled: () => setConfirming(false),
  });
  const error = join.error ?? leave.error;

  return (
    <>
      {can.join ? <Button title={t('events.join')} loading={join.isPending} onPress={() => join.mutate()} /> : null}
      {can.leave ? <Button variant="plain" title={t('events.leave')} onPress={() => setConfirming(true)} /> : null}
      {error ? <ErrorText>{errorMessage((error as { body?: unknown }).body) ?? t('common.somethingWrong')}</ErrorText> : null}
      <ConfirmDialog
        visible={confirming}
        title={t('events.leave.title')}
        description={t('events.leave.description')}
        confirmLabel={t('events.leave')}
        onCancel={() => setConfirming(false)}
        onConfirm={() => leave.mutate()}
      />
    </>
  );
}
