import { View } from 'react-native';

import { ActivityIcon } from '@/components/activity-icon';
import { ThemedText } from '@/components/themed-text';
import { useAppTheme } from '@/theme/theme-provider';

/** Activities in the accent colour, each with its icon, wrapping over as many lines as needed. */
export function ActivityTags({ activities }: { activities: { id: number; name: string; icon: string }[] }) {
  const { shape, colors } = useAppTheme();

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 14, rowGap: 4 }}>
      {activities.map((activity) => (
        <View key={activity.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <ActivityIcon icon={activity.icon} size={15} color={colors.primary} />
          <ThemedText
            type="small"
            style={{ color: colors.primary, textTransform: shape.uppercaseHeadings ? 'uppercase' : 'none', letterSpacing: shape.uppercaseHeadings ? 0.6 : 0 }}
          >
            {activity.name}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}
