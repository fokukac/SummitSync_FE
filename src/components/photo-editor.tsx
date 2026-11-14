import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useAppTheme } from '@/theme/theme-provider';
import { Avatar } from '@/components/avatar';
import { Icon, type IconName } from '@/components/icon';

/** A round badge button sitting on a corner of a picture (change, remove). */
function Badge({ icon, label, danger = false, onPress, style }: { icon: IconName; label: string; danger?: boolean; onPress: () => void; style: object }) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        {
          position: 'absolute',
          width: 34,
          height: 34,
          borderRadius: 17,
          borderWidth: 2,
          borderColor: colors.background,
          backgroundColor: danger ? colors.danger : colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.7 : 1,
        },
        style,
      ]}
    >
      <Icon name={icon} size={16} color={danger ? colors.background : colors.onPrimary} />
    </Pressable>
  );
}

/**
 * The profile photo as on the website: a big avatar with a camera badge (change) on its bottom-right corner, a bin
 * badge (remove) on the top-right when there is a photo, and the hint beside it.
 */
export function PhotoEditor({
  name,
  uri,
  busy = false,
  changeLabel,
  removeLabel,
  hint,
  error,
  onChange,
  onRemove,
}: {
  name: string;
  uri?: string | null;
  busy?: boolean;
  changeLabel: string;
  removeLabel: string;
  hint: string;
  error?: string;
  onChange: () => void;
  onRemove: () => void;
}) {
  const { colors } = useAppTheme();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
      <View style={{ width: 96, height: 96, opacity: busy ? 0.6 : 1 }}>
        <Avatar name={name} uri={uri} size={96} />
        <Badge icon="camera" label={changeLabel} onPress={() => !busy && onChange()} style={{ right: -6, bottom: -6 }} />
        {uri ? <Badge icon="trash" label={removeLabel} danger onPress={() => !busy && onRemove()} style={{ right: -6, top: -6 }} /> : null}
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <ThemedText type="small" themeColor="textSecondary">
          {hint}
        </ThemedText>
        {error ? (
          <ThemedText type="small" style={{ color: colors.danger }} accessibilityRole="alert">
            {error}
          </ThemedText>
        ) : null}
      </View>
    </View>
  );
}
