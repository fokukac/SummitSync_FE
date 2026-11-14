import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type Option<T extends string> = { value: T; label: string };

/** A row of mutually exclusive choices: the app's tab strip inside a screen (underline on the active one). */
export function Segmented<T extends string>({ options, value, onChange }: { options: Option<T>[]; value: T; onChange: (value: T) => void }) {
  const theme = useTheme();

  return (
    <View style={[styles.segmented, { borderBottomColor: theme.border }]} accessibilityRole="tablist">
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[styles.segment, { borderBottomColor: selected ? theme.primary : 'transparent' }]}
          >
            <ThemedText type={selected ? 'smallBold' : 'small'} themeColor={selected ? 'text' : 'textSecondary'}>
              {option.label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  segmented: { flexDirection: 'row', flexWrap: 'wrap', columnGap: Spacing.four, borderBottomWidth: StyleSheet.hairlineWidth },
  segment: { minHeight: 44, justifyContent: 'center', borderBottomWidth: 2, marginBottom: -StyleSheet.hairlineWidth },
});
