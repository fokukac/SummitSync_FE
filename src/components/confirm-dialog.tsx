import type { ReactNode } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useI18n } from '@/i18n';

type Props = { visible: boolean; title: string; description?: string; confirmLabel: string; onConfirm: () => void; onCancel: () => void; loading?: boolean; children?: ReactNode };

/** One confirmation dialog for every destructive action, on all platforms (never `window.confirm`). */
export function ConfirmDialog({ visible, title, description, confirmLabel, onConfirm, onCancel, loading, children }: Props) {
  const { t } = useI18n();

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel} accessibilityLabel={t('common.cancel')}>
        <Pressable accessibilityRole="alert">
          <ThemedView style={styles.dialog}>
            <ThemedText type="smallBold">{title}</ThemedText>
            {description ? <ThemedText type="small" themeColor="textSecondary">{description}</ThemedText> : null}
            {children}
            <View style={styles.actions}>
              <Button variant="plain" title={t('common.cancel')} onPress={onCancel} />
              <Button title={confirmLabel} onPress={onConfirm} loading={loading} />
            </View>
          </ThemedView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: Spacing.four },
  dialog: { width: '100%', maxWidth: 420, padding: Spacing.four, borderRadius: Spacing.three, gap: Spacing.three },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: Spacing.two },
});
