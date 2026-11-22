import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type Option<T extends string> = { value: T; label: string };

/** A row of mutually exclusive choices: the app's tab strip inside a screen (underline on the active one). Too many for the width (a larger font) scroll sideways instead of wrapping onto a second row. */
export function Segmented<T extends string>({ options, value, onChange }: { options: Option<T>[]; value: T; onChange: (value: T) => void }) {
  const theme = useTheme();

  return (
    <View style={{ borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: theme.border }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.segmented}
        accessibilityRole="tablist"
      >
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  segmented: { columnGap: Spacing.four },
  segment: { minHeight: 44, justifyContent: 'center', borderBottomWidth: 2 },
});
