import { type ReactNode, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, ScrollView, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';
import { familyFor } from '@/constants/themes';
import { useBreakpoint } from '@/hooks/use-breakpoint';
import { useShape, useTheme } from '@/hooks/use-theme';
import { useAppTheme } from '@/theme/theme-provider';

/**
 * A scrollable column for forms and simple pages. By default the content is centered on the screen (sign-in and other
 * short pages); `form` pins it to the top and makes it wider, for long create/edit forms.
 */
export function Screen({ children, form = false }: { children: ReactNode; form?: boolean }) {
  const breakpoint = useBreakpoint();

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <ScrollView contentContainerStyle={[styles.screen, form && styles.screenTop]} keyboardShouldPersistTaps="handled">
          <View style={[styles.column, form && { maxWidth: breakpoint === 'compact' ? 640 : 560, gap: Spacing.four }]}>{children}</View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

/** A set of related fields in a form: spaced out and separated from the previous set by a hairline. */
export function FormGroup({ children, first = false }: { children: ReactNode; first?: boolean }) {
  const theme = useTheme();

  return (
    <View style={[styles.group, !first && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: theme.border, paddingTop: Spacing.four }]}>
      {children}
    </View>
  );
}

/** The label above a field: quiet and small, the same everywhere (text fields, date fields, pickers). */
export function FieldLabel({ children }: { children: ReactNode }) {
  return (
    <ThemedText type="smallBold" themeColor="textSecondary" style={{ fontSize: 13 }}>
      {children}
    </ThemedText>
  );
}

type FieldProps = TextInputProps & {
  label: string;
  error?: string;
  /** The label is still read by screen readers but not drawn (a list of fields whose placeholders say what they are). */
  hideLabel?: boolean;
  /** A button inside the field's right end (search, add), sharing its outline. */
  action?: { icon: IconName; label: string; onPress: () => void; loading?: boolean };
};

export function TextField({ label, error, hideLabel, style, action, onFocus, onBlur, multiline, ...props }: FieldProps) {
  const { colors: theme, shape, body } = useAppTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.field}>
      {hideLabel ? null : <FieldLabel>{label}</FieldLabel>}
      <View
        style={[
          styles.outline,
          {
            borderRadius: shape.radius,
            borderColor: error ? theme.danger : focused ? theme.primary : theme.border,
            backgroundColor: theme.backgroundElement,
            alignItems: multiline ? 'flex-start' : 'center',
          },
        ]}
      >
        <TextInput
          accessibilityLabel={label}
          placeholderTextColor={theme.textSecondary}
          multiline={multiline}
          onFocus={(event) => {
            setFocused(true);
            onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            onBlur?.(event);
          }}
          style={[
            styles.input,
            { color: theme.text, fontFamily: familyFor(body, 500) },
            // The container draws the outline (and shows focus); the browser's own ring would double it.
            Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null,
            style,
          ]}
          {...props}
        />
        {action ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={action.label}
            disabled={action.loading}
            onPress={action.onPress}
            style={({ pressed }) => [styles.action, { opacity: pressed || action.loading ? 0.5 : 1 }]}
          >
            {action.loading ? <ActivityIndicator color={theme.primary} /> : <Icon name={action.icon} size={20} color={theme.primary} />}
          </Pressable>
        ) : null}
      </View>
      {error ? <ErrorText>{error}</ErrorText> : null}
    </View>
  );
}

/** A problem to tell the person about, inline: a small alert icon and the message in the danger colour. Never colour alone. */
export function ErrorText({ children }: { children: ReactNode }) {
  const theme = useTheme();

  return (
    <View accessibilityRole="alert" style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6 }}>
      <View style={{ paddingTop: 2 }}>
        <Icon name="alert" size={16} color={theme.danger} />
      </View>
      <ThemedText type="small" style={{ color: theme.danger, flex: 1 }}>
        {children}
      </ThemedText>
    </View>
  );
}

type ButtonProps = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  variant?: 'primary' | 'plain' | 'outline';
  /** Sized to its label instead of the full width, for rows of actions. */
  compact?: boolean;
  /** An icon before the label. */
  icon?: IconName;
};

export function Button({ title, onPress, loading = false, variant = 'primary', compact = false, icon }: ButtonProps) {
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
        variant === 'outline' && { borderWidth: 1, borderColor: theme.border },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={primary ? theme.onPrimary : theme.text} />
      ) : (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          {icon ? <Icon name={icon} size={16} color={primary ? theme.onPrimary : variant === 'outline' ? theme.text : theme.primary} /> : null}
          <ThemedText type="smallBold" style={{ color: primary ? theme.onPrimary : variant === 'outline' ? theme.text : theme.primary }}>
            {title}
          </ThemedText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  screen: { flexGrow: 1, justifyContent: 'center', padding: Spacing.four },
  screenTop: { justifyContent: 'flex-start', paddingVertical: Spacing.five },
  column: { width: '100%', maxWidth: MaxContentWidth / 2, alignSelf: 'center', gap: Spacing.three },
  group: { gap: Spacing.three },
  field: { gap: Spacing.one },
  outline: { flexDirection: 'row', borderWidth: 1, overflow: 'hidden' },
  input: { flex: 1, paddingHorizontal: Spacing.three, paddingVertical: 12, minHeight: 46, fontSize: 16 },
  action: { width: 46, minHeight: 46, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' },
  button: { minHeight: 48, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.three },
});
