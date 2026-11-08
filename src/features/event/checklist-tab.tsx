import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { api, unwrap, unwrapVoid } from '@/api/client';
import { Button, ErrorText, TextField } from '@/components/form';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { ThemedText } from '@/components/themed-text';
import { Card, QueryState } from '@/components/ui';
import { useI18n } from '@/i18n';

type Item = {
  id: number;
  label: string;
  sort_order: number;
  my_checked: boolean;
  checked_count: number;
  total_participants: number;
};

/** The server only ever sends the viewer's own state plus anonymous counts (privacy invariant), so that is all there is to show. */
export function ChecklistTab({ eventId, canToggle, canManage }: { eventId: number; canToggle: boolean; canManage: boolean }) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const queryKey = ['event', eventId, 'checklist'];
  const [error, setError] = useState(false);
  const [label, setLabel] = useState('');
  const [deleting, setDeleting] = useState<Item>();

  const checklist = useQuery({
    queryKey,
    queryFn: async () =>
      (
        await unwrap(
          api.GET('/v1/events/{event}/checklist', {
            params: { path: { event: eventId } },
          }),
        )
      ).data,
  });

  const toggle = useMutation({
    mutationFn: ({ item, checked }: { item: Item; checked: boolean }) =>
      unwrap(
        api.PUT('/v1/events/{event}/checklist/{checklistItem}/state', {
          params: { path: { event: eventId, checklistItem: item.id } },
          body: { is_checked: checked },
        }),
      ),

    // Optimistic: the box flips and the count follows at once; the server's answer replaces it, a failure rolls it back.
    onMutate: async ({ item, checked }) => {
      setError(false);
      await queryClient.cancelQueries({ queryKey });
      const before = queryClient.getQueryData<Item[]>(queryKey);

      queryClient.setQueryData<Item[]>(queryKey, (items) =>
        items?.map((existing) =>
          existing.id === item.id
            ? {
                ...existing,
                my_checked: checked,
                checked_count: existing.checked_count + (checked ? 1 : -1),
              }
            : existing,
        ),
      );

      return { before };
    },
    onError: (_error, _vars, context) => {
      setError(true);
      queryClient.setQueryData(queryKey, context?.before);
    },
    onSuccess: (saved) => queryClient.setQueryData<Item[]>(queryKey, (items) => items?.map((existing) => (existing.id === saved.id ? saved : existing))),
  });

  const add = useMutation({
    mutationFn: () =>
      unwrap(
        api.POST('/v1/events/{event}/checklist', {
          params: { path: { event: eventId } },
          body: { label: label.trim() },
        }),
      ),
    onSuccess: (created) => {
      queryClient.setQueryData<Item[]>(queryKey, (items) => [...(items ?? []), created]);
      setLabel('');
    },
  });

  const remove = useMutation({
    mutationFn: (item: Item) =>
      unwrapVoid(
        api.DELETE('/v1/events/{event}/checklist/{checklistItem}', {
          params: { path: { event: eventId, checklistItem: item.id } },
        }),
      ),
    onSuccess: (_result, item) => queryClient.setQueryData<Item[]>(queryKey, (items) => items?.filter((existing) => existing.id !== item.id)),
    onSettled: () => setDeleting(undefined),
  });

  return (
    <View style={{ gap: 12 }}>
      {canManage ? (
        <View style={{ gap: 8 }}>
          <TextField
            label={t('events.tabs.checklist')}
            value={label}
            onChangeText={setLabel}
            placeholder={t('checklist.addPlaceholder')}
            maxLength={150}
            onSubmitEditing={() => label.trim() && add.mutate()}
          />
          {add.isError ? <ErrorText>{t('checklist.addFailed')}</ErrorText> : null}
          <Button title={t('common.add')} onPress={() => add.mutate()} loading={add.isPending} />
        </View>
      ) : null}
      <QueryState query={checklist} empty={checklist.data?.length === 0} emptyText={t('events.tabs.checklist')}>
        {error ? <ErrorText>{t('checklist.saveFailed')}</ErrorText> : null}
        {checklist.data?.map((item) => (
          <Card key={item.id}>
            <Pressable
              accessibilityRole="checkbox"
              accessibilityLabel={t('checklist.markDone', {
                label: item.label,
              })}
              accessibilityState={{
                checked: item.my_checked,
                disabled: !canToggle,
              }}
              disabled={!canToggle}
              onPress={() => toggle.mutate({ item, checked: !item.my_checked })}
            >
              <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                <ThemedText>{item.my_checked ? '☑' : '☐'}</ThemedText>
                <ThemedText
                  style={{
                    flex: 1,
                    textDecorationLine: item.my_checked ? 'line-through' : 'none',
                  }}
                >
                  {item.label}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {item.checked_count}/{item.total_participants}
                </ThemedText>
              </View>
            </Pressable>
            {canManage ? <Button variant="plain" title={t('checklist.deleteItem')} onPress={() => setDeleting(item)} /> : null}
          </Card>
        ))}
      </QueryState>
      <ConfirmDialog
        visible={deleting !== undefined}
        title={t('checklist.deleteItem')}
        description={deleting?.label}
        confirmLabel={t('checklist.deleteItem')}
        loading={remove.isPending}
        onCancel={() => setDeleting(undefined)}
        onConfirm={() => deleting && remove.mutate(deleting)}
      />
    </View>
  );
}
