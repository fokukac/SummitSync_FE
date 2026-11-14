import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { api, unwrap, unwrapVoid } from '@/api/client';
import { Button, ErrorText, TextField } from '@/components/form';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { IconButton } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { Card, Checkbox, ProgressBar, QueryState } from '@/components/ui';
import { ChecklistBreakdown } from '@/features/event/checklist-breakdown';
import { ChecklistSuggestions } from '@/features/event/checklist-suggestions';
import { useMeta } from '@/features/forms/use-meta';
import { useI18n } from '@/i18n';
import { moveItem } from '@/lib/reorder';

type Item = {
  id: number;
  label: string;
  sort_order: number;
  my_checked: boolean;
  checked_count: number;
  total_participants: number;
};

/** The server only ever sends the viewer's own state plus anonymous counts (privacy invariant), so that is all there is to show. */
export function ChecklistTab({
  eventId,
  canToggle,
  canManage,
  canViewBreakdown,
}: {
  eventId: number;
  canToggle: boolean;
  canManage: boolean;
  canViewBreakdown: boolean;
}) {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const queryKey = ['event', eventId, 'checklist'];
  const [error, setError] = useState(false);
  const [label, setLabel] = useState('');
  const [deleting, setDeleting] = useState<Item>();
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [suggestionsFor, setSuggestionsFor] = useState<number>();

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

  // Shopping suggestions are a bonus behind a feature flag: without the flag or the counts there is simply no shopping button.
  const meta = useMeta();
  const countsKey = [...queryKey, 'suggestion-counts'];
  const counts = useQuery({
    queryKey: countsKey,
    enabled: meta.data?.features['shopping-suggestions'] === true,
    retry: false,
    queryFn: async () => (await unwrap(api.GET('/v1/events/{event}/checklist/suggestions', { params: { path: { event: eventId } } }))).data,
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
      void queryClient.invalidateQueries({ queryKey: countsKey });
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
    onSuccess: (_result, item) => {
      queryClient.setQueryData<Item[]>(queryKey, (items) => items?.filter((existing) => existing.id !== item.id));
      void queryClient.invalidateQueries({ queryKey: countsKey });
    },
    onSettled: () => setDeleting(undefined),
  });

  /** The whole new order goes to the server (it must list every item); the list moves at once and rolls back on a failure. */
  const reorder = useMutation({
    mutationFn: (ordered: Item[]) =>
      unwrapVoid(api.PUT('/v1/events/{event}/checklist/order', { params: { path: { event: eventId } }, body: { ids: ordered.map((item) => item.id) } })),
    onMutate: async (ordered) => {
      await queryClient.cancelQueries({ queryKey });
      const before = queryClient.getQueryData<Item[]>(queryKey);
      queryClient.setQueryData<Item[]>(queryKey, ordered);

      return { before };
    },
    onError: (_error, _ordered, context) => queryClient.setQueryData(queryKey, context?.before),
  });

  const move = (index: number, offset: -1 | 1) => {
    const items = checklist.data;

    if (items && !reorder.isPending) {
      reorder.mutate(moveItem(items, index, offset));
    }
  };

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
        {(checklist.data?.length ?? 0) > 0 ? (
          <View style={{ gap: 6 }}>
            <ThemedText type="smallBold">
              {checklist.data?.filter((item) => item.my_checked).length}/{checklist.data?.length}
            </ThemedText>
            <ProgressBar value={(checklist.data?.filter((item) => item.my_checked).length ?? 0) / (checklist.data?.length ?? 1)} />
          </View>
        ) : null}
        {error ? <ErrorText>{t('checklist.saveFailed')}</ErrorText> : null}
        {reorder.isError ? <ErrorText>{t('checklist.reorderFailed')}</ErrorText> : null}
        {checklist.data?.map((item, index) => (
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
                <Checkbox checked={item.my_checked} />
                <ThemedText
                  style={{
                    flex: 1,
                    textDecorationLine: item.my_checked ? 'line-through' : 'none',
                  }}
                >
                  {item.label}
                </ThemedText>
                <ThemedText type="smallBold" themeColor="textSecondary">
                  {item.checked_count}/{item.total_participants}
                </ThemedText>
              </View>
            </Pressable>
            {(counts.data?.[item.id] ?? 0) > 0 ? (
              <>
                <Button
                  variant="plain"
                  title={t('checklist.suggestions.toggleCount', { count: counts.data?.[item.id] ?? 0 })}
                  onPress={() => setSuggestionsFor((open) => (open === item.id ? undefined : item.id))}
                />
                {suggestionsFor === item.id ? <ChecklistSuggestions eventId={eventId} itemId={item.id} /> : null}
              </>
            ) : null}
            {canManage ? (
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <View style={{ opacity: index === 0 ? 0.3 : 1 }}>
                  <IconButton name="up" label={t('checklist.moveUp')} onPress={() => index > 0 && move(index, -1)} />
                </View>
                <View style={{ opacity: index === (checklist.data?.length ?? 0) - 1 ? 0.3 : 1 }}>
                  <IconButton name="down" label={t('checklist.moveDown')} onPress={() => index < (checklist.data?.length ?? 0) - 1 && move(index, 1)} />
                </View>
                <Button variant="plain" title={t('checklist.deleteItem')} onPress={() => setDeleting(item)} />
              </View>
            ) : null}
          </Card>
        ))}
      </QueryState>
      {canViewBreakdown ? (
        <>
          <Button
            variant="plain"
            title={t(showBreakdown ? 'checklist.hideBreakdown' : 'checklist.showBreakdown')}
            onPress={() => setShowBreakdown((shown) => !shown)}
          />
          {showBreakdown ? <ChecklistBreakdown eventId={eventId} /> : null}
        </>
      ) : null}
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
