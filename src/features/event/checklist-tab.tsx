import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRef, useState } from 'react';
import { type HostInstance, TextInput, View } from 'react-native';

import { api, unwrap, unwrapVoid } from '@/api/client';
import { Button, ErrorText } from '@/components/form';
import { ConfirmDialog } from '@/components/confirm-dialog';
import { useScrollIntoView } from '@/components/page';
import { QueryState } from '@/components/query-state';
import { ChecklistRow } from '@/features/event/checklist-row';
import { ChecklistBreakdown } from '@/features/event/checklist-breakdown';
import { useMeta } from '@/features/forms/use-meta';
import { familyFor } from '@/constants/themes';
import { useShape, useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n';
import { useAppTheme } from '@/theme/theme-provider';
import { CHECKLIST_TOGGLE, checklistKey, type ChecklistItem, type ChecklistToggleVars } from '@/features/event/offline-mutations';
import { moveItem } from '@/lib/reorder';

type Item = ChecklistItem;

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
  const theme = useTheme();
  const shape = useShape();
  const { body } = useAppTheme();
  const scrollIntoView = useScrollIntoView();
  const addRow = useRef<HostInstance>(null);
  const queryClient = useQueryClient();
  const queryKey = checklistKey(eventId);
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

  // Ticks go through the keyed mutation (offline-mutations.ts): the box flips at once and, offline, the tick waits for a
  // connection. One scope per event keeps a tick followed by an untick in order.
  const toggle = useMutation<unknown, Error, ChecklistToggleVars>({ mutationKey: CHECKLIST_TOGGLE, scope: { id: `checklist-${eventId}` } });

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
      <QueryState query={checklist} empty={checklist.data?.length === 0} emptyText={t('checklist.none')} emptyIcon="list">
        {error ? <ErrorText>{t('checklist.saveFailed')}</ErrorText> : null}
        {reorder.isError ? <ErrorText>{t('checklist.reorderFailed')}</ErrorText> : null}
        <View style={{ borderTopWidth: 1, borderTopColor: theme.border }}>
          {checklist.data?.map((item, index) => (
            <ChecklistRow
              key={item.id}
              item={item}
              eventId={eventId}
              canToggle={canToggle}
              canManage={canManage}
              suggestions={counts.data?.[item.id] ?? 0}
              suggestionsOpen={suggestionsFor === item.id}
              isFirst={index === 0}
              isLast={index === (checklist.data?.length ?? 0) - 1}
              onToggle={() => {
                setError(false);
                toggle.mutate({ eventId, itemId: item.id, checked: !item.my_checked }, { onError: () => setError(true) });
              }}
              onToggleSuggestions={() => setSuggestionsFor((open) => (open === item.id ? undefined : item.id))}
              onMove={(offset) => move(index, offset)}
              onDelete={() => setDeleting(item)}
            />
          ))}
        </View>
      </QueryState>
      {canManage ? (
        <View ref={addRow} style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <TextInput
              accessibilityLabel={t('events.tabs.checklist')}
              value={label}
              onChangeText={setLabel}
              placeholder={t('checklist.addPlaceholder')}
              placeholderTextColor={theme.textSecondary}
              maxLength={150}
              onFocus={() => scrollIntoView(addRow.current)}
              onSubmitEditing={() => label.trim() && add.mutate()}
              style={{
                flex: 1,
                height: 46,
                paddingHorizontal: 14,
                fontSize: 16,
                fontFamily: familyFor(body, 500),
                color: theme.text,
                borderColor: theme.border,
                borderWidth: 1,
                borderRadius: shape.radius,
                backgroundColor: theme.backgroundElement,
              }}
            />
            <Button compact title={t('common.add')} loading={add.isPending} onPress={() => label.trim() && add.mutate()} />
          </View>
          {add.isError ? <ErrorText>{t('checklist.addFailed')}</ErrorText> : null}
        </View>
      ) : null}
      {canViewBreakdown ? (
        <>
          <Button
            compact
            variant="outline"
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
