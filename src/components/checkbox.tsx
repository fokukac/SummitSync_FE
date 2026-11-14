import { View } from 'react-native';

import { useAppTheme } from '@/theme/theme-provider';
import { Icon } from '@/components/icon';

/** A square checkbox in the theme's small radius. */
export function Checkbox({ checked }: { checked: boolean }) {
  const { colors, shape } = useAppTheme();

  return (
    <View
      style={{
        width: 26,
        height: 26,
        borderRadius: shape.radiusSmall + 1,
        borderWidth: 2,
        borderColor: checked ? colors.primary : colors.textSecondary,
        backgroundColor: checked ? colors.primary : 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {checked ? <Icon name="check" size={18} color={colors.onPrimary} /> : null}
    </View>
  );
}
