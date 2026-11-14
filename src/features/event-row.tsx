import { router } from 'expo-router';
import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useShape, useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n';
import { formatDateParts } from '@/lib/format';

export type EventSummary = {
  id: number;
  title: string;
  starts_at: string;
  timezone: string;
  location_name?: string | null;
  participants_count: number;
  status?: string;
};

/**
 * An event in a list: a calendar tile (day and month) beside the title, the time and place, and who is going.
 * Opens the event page. One row, no box around it: the list's hairlines separate the rows.
 */
export function EventRow({ event, group }: { event: EventSummary; group?: string }) {
  const { t, intlLocale } = useI18n();
  const theme = useTheme();
  const shape = useShape();
  const when = formatDateParts(event.starts_at, event.timezone, intlLocale);
  // A draft or cancelled event is worth flagging; a published one is the normal case and needs no label.
  const flagged = event.status && event.status !== 'published' ? t(`events.status.${event.status}`) : null;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push({ pathname: '/events/[id]', params: { id: String(event.id) } })}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: theme.border,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      <View
        style={{ width: 56, height: 56, borderRadius: shape.radius, backgroundColor: theme.backgroundSelected, alignItems: 'center', justifyContent: 'center' }}
      >
        <ThemedText type="subtitle" style={{ fontSize: 22, lineHeight: 24 }}>
          {when.day}
        </ThemedText>
        <ThemedText type="smallBold" style={{ color: theme.primary, fontSize: 11, lineHeight: 14, textTransform: 'uppercase' }}>
          {when.month}
        </ThemedText>
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <ThemedText type="smallBold" style={{ fontSize: 16, lineHeight: 22 }}>
          {event.title}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {[when.time, event.location_name].filter(Boolean).join(' · ')}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {[group, t('events.going', { count: event.participants_count })].filter(Boolean).join(' · ')}
          {flagged ? (
            <ThemedText type="smallBold" style={{ color: theme.primary }}>
              {` · ${flagged}`}
            </ThemedText>
          ) : null}
        </ThemedText>
      </View>
    </Pressable>
  );
}
