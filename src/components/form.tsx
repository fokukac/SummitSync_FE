import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { familyFor } from '@/constants/themes';
import { useShape, useTheme } from '@/hooks/use-theme';
import { useAppTheme } from '@/theme/theme-provider';

/** A centered, scrollable column for forms and simple pages. */
export function Screen({ children }: { children: ReactNode }) {
  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
          <View style={styles.column}>{children}</View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

type FieldProps = TextInputProps & { label: string; error?: string };

export function TextField({ label, error, style, ...props }: FieldProps) {
  const { colors: theme, shape, body } = useAppTheme();

  return (
    <View style={styles.field}>
      <ThemedText type="small">{label}</ThemedText>
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor={theme.textSecondary}
        style={[
          styles.input,
          {
            color: theme.text,
            borderRadius: shape.radius,
            fontFamily: familyFor(body, 500),
            borderColor: error ? theme.danger : theme.border,
            backgroundColor: theme.backgroundElement,
          },
          style,
        ]}
        {...props}
      />
      {error ? <ErrorText>{error}</ErrorText> : null}
    </View>
  );
}

export function ErrorText({ children }: { children: ReactNode }) {
  const theme = useTheme();

  return (
    <ThemedText type="small" style={{ color: theme.danger }} accessibilityRole="alert">
      {children}
    </ThemedText>
  );
}

type ButtonProps = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'plain';
  /** Sized to its label instead of the full width, for rows of actions. */
  compact?: boolean;
};

export function Button({ title, onPress, loading = false, variant = 'primary', compact = false }: ButtonProps) {
  const theme = useTheme();
  const shape = useShape();
  const primary = variant === 'primary';

  return (
    <Pressable
      accessibilityRole="button"
      disabled={loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        compact && { alignSelf: 'flex-start', minHeight: 44, paddingHorizontal: 18 },
        { borderRadius: shape.radius, backgroundColor: primary ? theme.primary : 'transparent', opacity: pressed || loading ? 0.7 : 1 },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={primary ? theme.onPrimary : theme.text} />
      ) : (
        <ThemedText type="smallBold" style={{ color: primary ? theme.onPrimary : theme.primary }}>
          {title}
        </ThemedText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flexGrow: 1, justifyContent: 'center', padding: Spacing.four },
  column: { width: '100%', maxWidth: MaxContentWidth / 2, alignSelf: 'center', gap: Spacing.three },
  field: { gap: Spacing.one },
  input: { borderWidth: 1, paddingHorizontal: Spacing.three, paddingVertical: Spacing.three, fontSize: 16 },
  button: { minHeight: 48, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.three },
});
