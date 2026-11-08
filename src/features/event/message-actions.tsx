import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { api, unwrapVoid } from '@/api/client';
import type { components } from '@/api/schema';
import { ActionMenu, type MenuAction } from '@/components/action-menu';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { Button, ErrorText } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { removeMessage, type Message } from '@/features/event/messages-cache';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n';

type Reason = components['schemas']['MessageReportReason'];
const REASONS: Reason[] = ['spam', 'harassment', 'inappropriate', 'other'];

type Props = {
  eventId: number;
  message: Message;
  own: boolean;
  canModerate: boolean;
};

/**
 * The "..." menu of a chat message: report and block (anyone, on other people's messages - an app store
 * requirement for user-generated content) and delete (chat moderators).
 */
export function MessageActions({ eventId, message, own, canModerate }: Props) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const [menu, setMenu] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [blocking, setBlocking] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const block = useMutation({
    mutationFn: () =>
      unwrapVoid(
        api.POST('/v1/users/{user}/block', {
          params: { path: { user: message.user.id } },
        }),
      ),
    onSuccess: () => {
      // The server now leaves this person's messages out of history; refetch so they disappear.
      void queryClient.invalidateQueries({ queryKey: ['event'] });
      void queryClient.invalidateQueries({ queryKey: ['me', 'blocks'] });
    },
    onSettled: () => setBlocking(false),
  });

  const remove = useMutation({
    mutationFn: () =>
      unwrapVoid(
        api.DELETE('/v1/events/{event}/messages/{message}', {
          params: { path: { event: eventId, message: message.id } },
        }),
      ),
    onSuccess: () => queryClient.setQueryData(['event', eventId, 'messages'], (data: Parameters<typeof removeMessage>[0]) => removeMessage(data, message.id)),
    onSettled: () => setDeleting(false),
  });

  const actions: MenuAction[] = [
    ...(own
      ? []
      : [
          { label: t('chat.report'), onPress: () => setReporting(true) },
          {
            label: t('chat.block', { name: message.user.name }),
            onPress: () => setBlocking(true),
            destructive: true,
          },
        ]),
    ...(canModerate
      ? [
          {
            label: t('chat.deleteMessage'),
            onPress: () => setDeleting(true),
            destructive: true,
          },
        ]
      : []),
  ];

  if (actions.length === 0) {
    return null;
  }

  return (
    <>
      <Pressable accessibilityRole="button" accessibilityLabel={t('chat.actions')} hitSlop={12} onPress={() => setMenu(true)}>
        <ThemedText themeColor="textSecondary">⋯</ThemedText>
      </Pressable>
      <ActionMenu visible={menu} actions={actions} onClose={() => setMenu(false)} />
      <ReportDialog visible={reporting} eventId={eventId} messageId={message.id} onClose={() => setReporting(false)} />
      <ConfirmDialog
        visible={blocking}
        title={t('chat.block.title')}
        description={t('chat.block.description')}
        confirmLabel={t('chat.block', { name: message.user.name })}
        loading={block.isPending}
        onCancel={() => setBlocking(false)}
        onConfirm={() => block.mutate()}
      >
        {block.isError ? <ErrorText>{t('chat.block.failed')}</ErrorText> : null}
      </ConfirmDialog>
      <ConfirmDialog
        visible={deleting}
        title={t('chat.delete.title')}
        description={t('chat.delete.description')}
        confirmLabel={t('chat.deleteMessage')}
        loading={remove.isPending}
        onCancel={() => setDeleting(false)}
        onConfirm={() => remove.mutate()}
      >
        {remove.isError ? <ErrorText>{t('chat.deleteFailed')}</ErrorText> : null}
      </ConfirmDialog>
    </>
  );
}

function ReportDialog({ visible, eventId, messageId, onClose }: { visible: boolean; eventId: number; messageId: number; onClose: () => void }) {
  const { t } = useI18n();
  const theme = useTheme();
  const [reason, setReason] = useState<Reason>('spam');
  const [details, setDetails] = useState('');

  const report = useMutation({
    mutationFn: () =>
      unwrapVoid(
        api.POST('/v1/events/{event}/messages/{message}/report', {
          params: { path: { event: eventId, message: messageId } },
          body: { reason, details: details.trim() || null },
        }),
      ),
  });

  function close() {
    report.reset();
    setDetails('');
    setReason('spam');
    onClose();
  }

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={close}>
      <Pressable style={styles.backdrop} onPress={close} accessibilityLabel={t('common.cancel')}>
        <Pressable accessibilityRole="alert">
          <ThemedView style={styles.dialog}>
            <ThemedText type="smallBold">{t('chat.report.title')}</ThemedText>
            {report.isSuccess ? (
              <>
                <ThemedText type="small">{t('chat.report.sent')}</ThemedText>
                <Button title={t('common.close')} onPress={close} />
              </>
            ) : (
              <>
                <ThemedText type="small" themeColor="textSecondary">
                  {t('chat.report.description')}
                </ThemedText>
                {REASONS.map((option) => (
                  <Pressable key={option} accessibilityRole="radio" accessibilityState={{ selected: reason === option }} onPress={() => setReason(option)}>
                    <ThemedText type={reason === option ? 'smallBold' : 'small'}>
                      {reason === option ? '◉ ' : '○ '}
                      {t(`chat.report.reason.${option}`)}
                    </ThemedText>
                  </Pressable>
                ))}
                <TextInput
                  value={details}
                  onChangeText={setDetails}
                  placeholder={t('chat.report.details')}
                  placeholderTextColor={theme.textSecondary}
                  accessibilityLabel={t('chat.report.details')}
                  maxLength={500}
                  multiline
                  style={{
                    color: theme.text,
                    borderColor: theme.border,
                    backgroundColor: theme.backgroundElement,
                    borderWidth: 1,
                    borderRadius: 8,
                    padding: 12,
                    minHeight: 64,
                    fontSize: 16,
                  }}
                />
                {report.isError ? <ErrorText>{t('chat.report.failed')}</ErrorText> : null}
                <View style={styles.actions}>
                  <Button variant="plain" title={t('common.cancel')} onPress={close} />
                  <Button title={t('chat.report.submit')} onPress={() => report.mutate()} loading={report.isPending} />
                </View>
              </>
            )}
          </ThemedView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  dialog: {
    width: '100%',
    maxWidth: 420,
    padding: Spacing.four,
    borderRadius: Spacing.three,
    gap: Spacing.three,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.two,
  },
});
