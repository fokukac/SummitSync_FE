import { Pressable, ScrollView } from 'react-native';

import { ActivityIcon } from '@/components/activity-icon';
import { ThemedText } from '@/components/themed-text';
import { useShape, useTheme } from '@/hooks/use-theme';
import { useMeta } from '@/features/forms/use-meta';
import { useI18n } from '@/i18n';
import { MAX_ACTIVITY_FILTER, toggleActivityKey } from '@/lib/activity-filter';

/** The curated activities as toggle chips in one row that scrolls sideways (wrapped, thirty of them filled a third of the screen); selected ones are highlighted, tapping again unselects. */
export function ActivityFilter({ selected, onChange }: { selected: string[]; onChange: (keys: string[]) => void }) {
  const { t } = useI18n();
  const theme = useTheme();
  const shape = useShape();
  const meta = useMeta();

  const activities = meta.data?.activities ?? [];

  if (activities.length === 0) {
    return null;
  }

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      accessibilityRole="toolbar"
      accessibilityLabel={t('activities.filter')}
      style={{ flexGrow: 0 }}
      contentContainerStyle={{ gap: 8 }}
    >
      {activities.map((activity) => {
        const active = selected.includes(activity.key);
        const blocked = !active && selected.length >= MAX_ACTIVITY_FILTER;

        return (
          <Pressable
            key={activity.id}
            accessibilityRole="button"
            accessibilityState={{ selected: active, disabled: blocked }}
            disabled={blocked}
            onPress={() => onChange(toggleActivityKey(selected, activity.key))}
            style={{
              paddingHorizontal: 12,
              minHeight: 36,
              justifyContent: 'center',
              borderRadius: shape.radiusSmall,
              backgroundColor: active ? theme.primary : theme.backgroundSelected,
              opacity: blocked ? 0.5 : 1,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <ActivityIcon icon={activity.icon} size={16} color={active ? theme.onPrimary : theme.text} />
            <ThemedText type="small" style={{ color: active ? theme.onPrimary : theme.text }}>
              {activity.name}
            </ThemedText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
