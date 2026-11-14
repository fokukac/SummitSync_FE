import { Image } from 'expo-image';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { API_URL } from '@/api/client';
import { Button } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useShape, useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n';
import { initials } from '@/lib/format';
import { resolveMediaUrl } from '@/lib/media';
import { useAppTheme } from '@/theme/theme-provider';

/**
 * A block of related content. Flat on purpose: no fill, no corners, just a hairline underneath, so lists read as
 * one surface instead of a stack of boxes inside boxes.
 */
export function Card({ children, onPress }: { children: ReactNode; onPress?: () => void }) {
  const theme = useTheme();
  const body = <View style={[styles.card, { borderBottomColor: theme.border }]}>{children}</View>;

  return onPress ? (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
      {body}
    </Pressable>
  ) : (
    body
  );
}

/** A small label (a selectable activity, a status). */
export function Chip({ label }: { label: string }) {
  const theme = useTheme();
  const shape = useShape();

  return (
    <View style={[styles.chip, { backgroundColor: theme.backgroundSelected, borderRadius: shape.radiusSmall }]}>
      <ThemedText type="small">{label}</ThemedText>
    </View>
  );
}

/** Short facts on one line ("Hiking · Climbing"), in the accent colour. Replaces a wrapping row of chips. */
export function TagLine({ tags }: { tags: string[] }) {
  const { shape, colors } = useAppTheme();

  return (
    <ThemedText
      type="small"
      style={{ color: colors.primary, textTransform: shape.uppercaseHeadings ? 'uppercase' : 'none', letterSpacing: shape.uppercaseHeadings ? 0.6 : 0 }}
    >
      {tags.join(' · ')}
    </ThemedText>
  );
}

/** Image when the server has one, initials otherwise. Round or softly squared, depending on the theme. */
export function Avatar({ name, uri, size = 36 }: { name: string; uri?: string | null; size?: number }) {
  const theme = useTheme();
  const shape = useShape();
  const radius = shape.avatar === 'round' ? size / 2 : Math.min(shape.radius, size / 4);

  return uri ? (
    <Image source={{ uri: resolveMediaUrl(uri, API_URL) }} accessibilityLabel={name} style={{ width: size, height: size, borderRadius: radius }} />
  ) : (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: radius, backgroundColor: theme.backgroundSelected }]}>
      <ThemedText type="smallBold" style={{ fontSize: size / 2.8, lineHeight: size / 2.2 }}>
        {initials(name)}
      </ThemedText>
    </View>
  );
}

type Option<T extends string> = { value: T; label: string };

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
  card: { paddingVertical: Spacing.three, borderBottomWidth: StyleSheet.hairlineWidth, gap: Spacing.one },
  chip: { paddingHorizontal: Spacing.two, paddingVertical: Spacing.half },
  avatar: { alignItems: 'center', justifyContent: 'center' },
  segmented: { flexDirection: 'row', flexWrap: 'wrap', columnGap: Spacing.four, borderBottomWidth: StyleSheet.hairlineWidth },
  segment: { minHeight: 44, justifyContent: 'center', borderBottomWidth: 2, marginBottom: -StyleSheet.hairlineWidth },
  state: { padding: Spacing.four, alignItems: 'center', gap: Spacing.two },
});
