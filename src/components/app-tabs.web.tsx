import { TabList, TabSlot, Tabs, TabTrigger, type TabTriggerSlotProps } from 'expo-router/ui';
import { Pressable, StyleSheet, View, type PressableProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { useI18n } from '@/i18n';

/** Web tab bar: the native tabs component has no working web implementation. */
export default function AppTabs() {
  const { t } = useI18n();

  return (
    <Tabs>
      <TabSlot style={{ height: '100%' }} />
      <TabList asChild>
        <View style={styles.bar}>
          <ThemedView type="backgroundElement" style={styles.inner}>
            <TabTrigger name="index" href="/" asChild>
              <TabButton>{t('nav.groups')}</TabButton>
            </TabTrigger>
            <TabTrigger name="settings" href="/settings" asChild>
              <TabButton>{t('nav.settings')}</TabButton>
            </TabTrigger>
          </ThemedView>
        </View>
      </TabList>
    </Tabs>
  );
}

function TabButton({ children, isFocused, ...props }: TabTriggerSlotProps) {
  return (
    <Pressable {...(props as unknown as PressableProps)} accessibilityRole="tab" accessibilityState={{ selected: isFocused }} style={({ pressed }) => pressed && styles.pressed}>
      <ThemedView type={isFocused ? 'backgroundSelected' : 'backgroundElement'} style={styles.button}>
        <ThemedText type="small" themeColor={isFocused ? 'text' : 'textSecondary'}>
          {children}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: { position: 'absolute', width: '100%', padding: Spacing.three, alignItems: 'center' },
  inner: { flexDirection: 'row', gap: Spacing.two, padding: Spacing.two, borderRadius: Spacing.five, maxWidth: MaxContentWidth },
  button: { paddingVertical: Spacing.one, paddingHorizontal: Spacing.three, borderRadius: Spacing.three },
  pressed: { opacity: 0.7 },
});
