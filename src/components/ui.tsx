import { Image } from 'expo-image';
import { Children, type ReactNode } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import Svg, { Ellipse, G } from 'react-native-svg';

import { API_URL } from '@/api/client';
import { Button } from '@/components/form';
import { ActivityIcon } from '@/components/activity-icon';
import { useBreakpoint } from '@/hooks/use-breakpoint';
import { Icon, type IconName } from '@/components/icon';
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

/** Lays cards out in two columns on wide screens and one column otherwise. */
export function CardGrid({ children }: { children: ReactNode }) {
  const wide = useBreakpoint() !== 'compact';
  const items = Children.toArray(children);

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: Spacing.four }}>
      {items.map((child, index) => (
        <View key={index} style={{ width: wide ? '48.5%' : '100%' }}>
          {child}
        </View>
      ))}
    </View>
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

/** Activities in the accent colour, each with its icon, wrapping over as many lines as needed. */
export function ActivityTags({ activities }: { activities: { id: number; name: string; icon: string }[] }) {
  const { shape, colors } = useAppTheme();

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 14, rowGap: 4 }}>
      {activities.map((activity) => (
        <View key={activity.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
          <ActivityIcon icon={activity.icon} size={15} color={colors.primary} />
          <ThemedText
            type="small"
            style={{ color: colors.primary, textTransform: shape.uppercaseHeadings ? 'uppercase' : 'none', letterSpacing: shape.uppercaseHeadings ? 0.6 : 0 }}
          >
            {activity.name}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

/** A label sitting on the hero image (status, activity). */
export function Pill({ label, accent = false, icon }: { label: string; accent?: boolean; icon?: string }) {
  const { colors, shape, definition } = useAppTheme();
  // On the orange hero of Social Sport an orange pill would vanish, so the accent pill is ink there.
  const accentBg = definition.id === 'social' ? colors.text : colors.primary;
  const accentFg = definition.id === 'social' ? colors.background : colors.onPrimary;

  return (
    <View
      style={{
        backgroundColor: accent ? accentBg : colors.backgroundElement,
        borderRadius: shape.radiusSmall,
        paddingHorizontal: 10,
        paddingVertical: 4,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
      }}
    >
      {icon ? <ActivityIcon icon={icon} size={14} color={accent ? accentFg : colors.text} /> : null}
      <ThemedText type="smallBold" style={{ fontSize: 12.5, lineHeight: 18, color: accent ? accentFg : colors.text }}>
        {label}
      </ThemedText>
    </View>
  );
}

/** Contour-line banner (the app's one illustration); `children` are pills laid along the bottom edge. */
export function Hero({ children }: { children?: ReactNode }) {
  const { colors, shape, definition } = useAppTheme();
  const lines = definition.id === 'social' ? '#FFFFFF' : colors.primary;
  const fill = definition.id === 'social' ? colors.primary : colors.backgroundSelected;

  return (
    <View style={{ height: 150, borderRadius: shape.radius, overflow: 'hidden', backgroundColor: fill, justifyContent: 'flex-end' }}>
      <Svg
        style={StyleSheet.absoluteFill}
        viewBox="0 0 346 150"
        preserveAspectRatio="xMidYMid slice"
        fill="none"
        stroke={lines}
        strokeOpacity={0.35}
        strokeWidth={1.3}
      >
        <G transform="rotate(-16 230 60)">
          {[
            [40, 22],
            [72, 40],
            [106, 58],
            [142, 78],
            [180, 98],
            [222, 120],
          ].map(([rx, ry]) => (
            <Ellipse key={rx} cx={230} cy={60} rx={rx} ry={ry} />
          ))}
        </G>
      </Svg>
      <View style={{ flexDirection: 'row', gap: 8, padding: 14 }}>{children}</View>
    </View>
  );
}

/** One fact with its icon (when, where, who). */
export function Fact({ icon, children, secondary = false }: { icon: IconName; children: ReactNode; secondary?: boolean }) {
  const theme = useTheme();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <Icon name={icon} size={22} color={theme.primary} />
      <ThemedText style={{ flex: 1 }} themeColor={secondary ? 'textSecondary' : 'text'}>
        {children}
      </ThemedText>
    </View>
  );
}

/** Quoted text with a rule on the left instead of a box around it. */
export function Note({ title, children }: { title?: string; children: ReactNode }) {
  const theme = useTheme();

  return (
    <View style={{ borderLeftWidth: 3, borderLeftColor: theme.primary, paddingLeft: 14, gap: 4 }}>
      {title ? (
        <ThemedText type="small" themeColor="textSecondary">
          {title}
        </ThemedText>
      ) : null}
      {children}
    </View>
  );
}

/** Thin progress bar, `value` between 0 and 1. */
export function ProgressBar({ value }: { value: number }) {
  const theme = useTheme();

  return (
    <View style={{ height: 6, borderRadius: 3, backgroundColor: theme.border, overflow: 'hidden' }}>
      <View style={{ width: `${Math.round(Math.min(1, Math.max(0, value)) * 100)}%`, height: 6, backgroundColor: theme.primary }} />
    </View>
  );
}

/** A square checkbox in the theme's small radius. */
export function Checkbox({ checked }: { checked: boolean }) {
  const { colors, shape } = useAppTheme();

  return (
    <View
      style={{
        width: 26,
        height: 26,
        borderRadius: shape.radiusSmall + 1,
        borderWidth: 2,
        borderColor: checked ? colors.primary : colors.textSecondary,
        backgroundColor: checked ? colors.primary : 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {checked ? <Icon name="check" size={18} color={colors.onPrimary} /> : null}
    </View>
  );
}

/** A round badge button sitting on a corner of a picture (change, remove). */
function Badge({ icon, label, danger = false, onPress, style }: { icon: IconName; label: string; danger?: boolean; onPress: () => void; style: object }) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => [
        {
          position: 'absolute',
          width: 34,
          height: 34,
          borderRadius: 17,
          borderWidth: 2,
          borderColor: colors.background,
          backgroundColor: danger ? colors.danger : colors.primary,
          alignItems: 'center',
          justifyContent: 'center',
          opacity: pressed ? 0.7 : 1,
        },
        style,
      ]}
    >
      <Icon name={icon} size={16} color={danger ? colors.background : colors.onPrimary} />
    </Pressable>
  );
}

/**
 * The profile photo as on the website: a big avatar with a camera badge (change) on its bottom-right corner, a bin
 * badge (remove) on the top-right when there is a photo, and the hint beside it.
 */
export function PhotoEditor({
  name,
  uri,
  busy = false,
  changeLabel,
  removeLabel,
  hint,
  error,
  onChange,
  onRemove,
}: {
  name: string;
  uri?: string | null;
  busy?: boolean;
  changeLabel: string;
  removeLabel: string;
  hint: string;
  error?: string;
  onChange: () => void;
  onRemove: () => void;
}) {
  const { colors } = useAppTheme();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 20 }}>
      <View style={{ width: 96, height: 96, opacity: busy ? 0.6 : 1 }}>
        <Avatar name={name} uri={uri} size={96} />
        <Badge icon="camera" label={changeLabel} onPress={() => !busy && onChange()} style={{ right: -6, bottom: -6 }} />
        {uri ? <Badge icon="trash" label={removeLabel} danger onPress={() => !busy && onRemove()} style={{ right: -6, top: -6 }} /> : null}
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <ThemedText type="small" themeColor="textSecondary">
          {hint}
        </ThemedText>
        {error ? (
          <ThemedText type="small" style={{ color: colors.danger }} accessibilityRole="alert">
            {error}
          </ThemedText>
        ) : null}
      </View>
    </View>
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
  const theme = useTheme();

  if (query.isPending) {
    return <ActivityIndicator color={theme.primary} style={styles.state} />;
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
