import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { Button } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n';
import { initials } from '@/lib/format';

export function Card({ children, onPress }: { children: ReactNode; onPress?: () => void }) {
  const body = (
    <ThemedView type="backgroundElement" style={styles.card}>
      {children}
    </ThemedView>
  );

  return onPress ? (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
      {body}
    </Pressable>
  ) : (
    body
  );
}

export function Chip({ label }: { label: string }) {
  const theme = useTheme();

  return (
    <View style={[styles.chip, { backgroundColor: theme.backgroundSelected }]}>
      <ThemedText type="small">{label}</ThemedText>
    </View>
  );
}

/** Image when the server has one, initials otherwise. */
export function Avatar({ name, uri, size = 36 }: { name: string; uri?: string | null; size?: number }) {
  const theme = useTheme();

  return uri ? (
    <Image source={{ uri }} accessibilityLabel={name} style={{ width: size, height: size, borderRadius: size / 2 }} />
  ) : (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: size / 2, backgroundColor: theme.backgroundSelected }]}>
      <ThemedText type="smallBold" style={{ fontSize: size / 2.8 }}>
        {initials(name)}
      </ThemedText>
    </View>
  );
}

type Option<T extends string> = { value: T; label: string };

/** A row of mutually exclusive choices (the app's tab strip inside a screen). */
export function Segmented<T extends string>({ options, value, onChange }: { options: Option<T>[]; value: T; onChange: (value: T) => void }) {
  const theme = useTheme();

  return (
    <View style={styles.segmented} accessibilityRole="tablist">
      {options.map((option) => {
        const selected = option.value === value;

        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[styles.segment, { backgroundColor: selected ? theme.backgroundSelected : theme.backgroundElement }]}
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

type QueryLike = { isPending: boolean; isError: boolean; refetch: () => unknown };

/** The three non-happy states of a query, in one place; renders `children` once data is there. */
export function QueryState({ query, empty, emptyText, children }: { query: QueryLike; empty?: boolean; emptyText?: string; children: ReactNode }) {
  const { t } = useI18n();

  if (query.isPending) {
    return <ActivityIndicator style={styles.state} />;
  }

  if (query.isError) {
    return (
      <View style={styles.state}>
        <ThemedText themeColor="textSecondary">{t('common.somethingWrong')}</ThemedText>
        <Button variant="plain" title={t('common.tryAgain')} onPress={() => void query.refetch()} />
      </View>
    );
  }

  if (empty) {
    return (
      <View style={styles.state}>
        <ThemedText themeColor="textSecondary">{emptyText}</ThemedText>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
  card: { padding: Spacing.three, borderRadius: Spacing.three, gap: Spacing.one },
  chip: { paddingHorizontal: Spacing.two, paddingVertical: Spacing.half, borderRadius: Spacing.three },
  avatar: { alignItems: 'center', justifyContent: 'center' },
  segmented: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  segment: { paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, borderRadius: Spacing.three },
  state: { padding: Spacing.four, alignItems: 'center', gap: Spacing.two },
});
