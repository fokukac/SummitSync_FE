import { Pressable, View } from 'react-native';

import { ActivityIcon } from '@/components/activity-icon';
import { FieldLabel } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { useShape, useTheme } from '@/hooks/use-theme';
import { useMeta } from '@/features/forms/use-meta';
import { useI18n } from '@/i18n';

const MAX = 30;

/** Pick up to 30 curated activities (the server enforces the same limit). */
export function ActivityPicker({ value, onChange, error }: { value: number[]; onChange: (ids: number[]) => void; error?: string }) {
  const { t } = useI18n();
  const theme = useTheme();
  const shape = useShape();
  const meta = useMeta();

  function toggle(id: number) {
    onChange(value.includes(id) ? value.filter((existing) => existing !== id) : value.length < MAX ? [...value, id] : value);
  }

  return (
    <View style={{ gap: 6 }}>
      <FieldLabel>{t('activities.label')}</FieldLabel>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {meta.data?.activities.map((activity) => {
          const selected = value.includes(activity.id);

          return (
            <Pressable
              key={activity.id}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected }}
              onPress={() => toggle(activity.id)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: shape.radiusSmall,
                backgroundColor: selected ? theme.primary : theme.backgroundSelected,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <ActivityIcon icon={activity.icon} size={16} color={selected ? theme.onPrimary : theme.text} />
              <ThemedText type="small" style={{ color: selected ? theme.onPrimary : theme.text }}>
                {activity.name}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
      <ThemedText type="small" themeColor="textSecondary">
        {t(value.length >= MAX ? 'activities.limitReached' : 'activities.hint', { max: MAX })}
      </ThemedText>
      {error ? (
        <ThemedText type="small" style={{ color: theme.danger }}>
          {error}
        </ThemedText>
      ) : null}
    </View>
  );
}
