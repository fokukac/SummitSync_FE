import { View } from 'react-native';

import { Button } from '@/components/form';
import { Icon, type IconName } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { useShape, useTheme } from '@/hooks/use-theme';

type Props = {
  icon: IconName;
  /** What is missing, in a sentence. */
  text: string;
  /** What to do about it, when there is something. */
  action?: { title: string; onPress: () => void; loading?: boolean };
  /** Smaller, for a panel inside a page rather than a whole screen. */
  compact?: boolean;
};

/** Nothing here yet (or nothing could be loaded): an icon on a soft tile, one sentence, and the next step if there is one. */
export function EmptyState({ icon, text, action, compact = false }: Props) {
  const theme = useTheme();
  const shape = useShape();
  const tile = compact ? 40 : 56;

  return (
    <View style={{ alignItems: 'center', gap: compact ? 8 : 12, paddingVertical: compact ? 16 : 40, paddingHorizontal: 24 }}>
      <View
        style={{
          width: tile,
          height: tile,
          borderRadius: shape.avatar === 'round' ? tile / 2 : shape.radius,
          backgroundColor: theme.backgroundSelected,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={icon} size={compact ? 20 : 26} color={theme.textSecondary} />
      </View>
      <ThemedText themeColor="textSecondary" style={{ textAlign: 'center', maxWidth: 320 }}>
        {text}
      </ThemedText>
      {action ? <Button compact title={action.title} onPress={action.onPress} loading={action.loading} /> : null}
    </View>
  );
}
