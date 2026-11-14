import { View } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

/** The round indicator of a single-choice option: a ring, with a dot inside when chosen. */
export function Radio({ selected }: { selected: boolean }) {
  const theme = useTheme();

  return (
    <View
      style={{
        width: 22,
        height: 22,
        borderRadius: 11,
        borderWidth: 2,
        borderColor: selected ? theme.primary : theme.textSecondary,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {selected ? <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: theme.primary }} /> : null}
    </View>
  );
}
