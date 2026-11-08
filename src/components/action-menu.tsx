import { Modal, Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n';

export type MenuAction = { label: string; onPress: () => void; destructive?: boolean };

/** A small modal list of actions, used for the "..." menu on a chat message. Closes itself before running an action. */
export function ActionMenu({ visible, actions, onClose }: { visible: boolean; actions: MenuAction[]; onClose: () => void }) {
  const { t } = useI18n();
  const theme = useTheme();

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel={t('common.close')}>
        <ThemedView style={styles.menu}>
          {actions.map((action) => (
            <Pressable
              key={action.label}
              accessibilityRole="button"
              onPress={() => {
                onClose();
                action.onPress();
              }}
              style={({ pressed }) => [styles.item, { opacity: pressed ? 0.6 : 1 }]}>
              <ThemedText type="smallBold" style={action.destructive ? { color: theme.danger } : undefined}>
                {action.label}
              </ThemedText>
            </Pressable>
          ))}
        </ThemedView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: Spacing.four },
  menu: { width: '100%', maxWidth: 360, borderRadius: Spacing.three, paddingVertical: Spacing.two },
  item: { paddingHorizontal: Spacing.four, paddingVertical: Spacing.three },
});
