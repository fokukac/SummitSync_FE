import { Pressable, View } from 'react-native';

import { Checkbox } from '@/components/checkbox';
import { Icon, type IconName } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { ChecklistSuggestions } from '@/features/event/checklist-suggestions';
import type { ChecklistItem } from '@/features/event/offline-mutations';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n';

/** A small icon button (32px) for the controls that sit in a row. */
function RowIcon({
  name,
  label,
  onPress,
  disabled = false,
  expanded,
}: {
  name: IconName;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  expanded?: boolean;
}) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled, expanded }}
      disabled={disabled}
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => ({ width: 32, height: 32, alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.3 : pressed ? 0.5 : 1 })}
    >
      <Icon name={name} size={18} color={expanded ? theme.primary : theme.textSecondary} />
    </Pressable>
  );
}

type Props = {
  item: ChecklistItem;
  eventId: number;
  canToggle: boolean;
  canManage: boolean;
  /** How many shopping suggestions this item has (0 when none, or the feature is off). */
  suggestions: number;
  suggestionsOpen: boolean;
  isFirst: boolean;
  isLast: boolean;
  onToggle: () => void;
  onToggleSuggestions: () => void;
  onMove: (offset: -1 | 1) => void;
  onDelete: () => void;
};

/**
 * One checklist item on one line, as on the website: the checkbox and label, the "2 / 6" count, the shopping bag
 * (with its count) when there are suggestions, and for organizers the move and delete controls. The suggestions open
 * underneath, indented to the label.
 */
export function ChecklistRow({
  item,
  eventId,
  canToggle,
  canManage,
  suggestions,
  suggestionsOpen,
  isFirst,
  isLast,
  onToggle,
  onToggleSuggestions,
  onMove,
  onDelete,
}: Props) {
  const { t } = useI18n();
  const theme = useTheme();

  return (
    <View style={{ borderBottomWidth: 1, borderBottomColor: theme.border }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 56, paddingVertical: 8 }}>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityLabel={t('checklist.markDone', { label: item.label })}
          accessibilityState={{ checked: item.my_checked, disabled: !canToggle }}
          disabled={!canToggle}
          onPress={onToggle}
          style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 }}
        >
          <Checkbox checked={item.my_checked} />
          <ThemedText
            themeColor={item.my_checked ? 'textSecondary' : 'text'}
            style={{ flex: 1, textDecorationLine: item.my_checked ? 'line-through' : 'none' }}
          >
            {item.label}
          </ThemedText>
        </Pressable>

        <ThemedText type="small" themeColor="textSecondary" style={{ fontVariant: ['tabular-nums'] }}>
          {item.checked_count} / {item.total_participants}
        </ThemedText>

        {suggestions > 0 ? (
          <View>
            <RowIcon
              name="bag"
              label={t('checklist.suggestions.toggleCount', { count: suggestions })}
              expanded={suggestionsOpen}
              onPress={onToggleSuggestions}
            />
            <View
              pointerEvents="none"
              style={{
                position: 'absolute',
                top: -2,
                right: -4,
                minWidth: 16,
                height: 16,
                borderRadius: 8,
                paddingHorizontal: 4,
                backgroundColor: theme.primary,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ThemedText type="smallBold" style={{ color: theme.onPrimary, fontSize: 10, lineHeight: 14 }}>
                {suggestions}
              </ThemedText>
            </View>
          </View>
        ) : null}

        {canManage ? (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <RowIcon name="up" label={t('checklist.moveUp')} disabled={isFirst} onPress={() => onMove(-1)} />
            <RowIcon name="down" label={t('checklist.moveDown')} disabled={isLast} onPress={() => onMove(1)} />
            <RowIcon name="trash" label={t('checklist.deleteItem')} onPress={onDelete} />
          </View>
        ) : null}
      </View>

      {suggestionsOpen && suggestions > 0 ? (
        <View style={{ paddingLeft: 38, paddingBottom: 4 }}>
          <ChecklistSuggestions eventId={eventId} itemId={item.id} />
        </View>
      ) : null}
    </View>
  );
}
