import { View } from 'react-native';

import { ActivityIcon } from '@/components/activity-icon';
import { ThemedText } from '@/components/themed-text';
import { useAppTheme } from '@/theme/theme-provider';

/** A label sitting on the hero image (status, activity). */
export function Pill({ label, accent = false, icon }: { label: string; accent?: boolean; icon?: string }) {
  const { colors, shape, definition } = useAppTheme();
  // On the orange hero of Social Sport an orange pill would vanish, so the accent pill is ink there.
  const accentBg = definition.id === 'social' ? colors.text : colors.primary;
  const accentFg = definition.id === 'social' ? colors.background : colors.onPrimary;

  return (
    <View
      style={{
        backgroundColor: accent ? accentBg : colors.backgroundElement,
        borderRadius: shape.radiusSmall,
        paddingHorizontal: 10,
        paddingVertical: 4,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
      }}
    >
      {icon ? <ActivityIcon icon={icon} size={14} color={accent ? accentFg : colors.text} /> : null}
      <ThemedText type="smallBold" style={{ fontSize: 12.5, lineHeight: 18, color: accent ? accentFg : colors.text }}>
        {label}
      </ThemedText>
    </View>
  );
}
