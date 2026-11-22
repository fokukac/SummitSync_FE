import { Pressable, ScrollView, View } from 'react-native';

import { Avatar } from '@/components/avatar';
import { Icon } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import type { ChatPerson } from '@/features/event/messages-cache';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n';

type Props = {
  people: ChatPerson[];
  currentUserId?: number;
  /** userId => id of the message that person's arrows are on. */
  cursors: Record<number, number>;
  onJump: (userId: number, direction: 1 | -1) => void;
  /** People whose messages are the only ones shown in the chat (none chosen: everyone's). */
  selected: number[];
  onToggle: (userId: number) => void;
  onClear: () => void;
  /** Fixed height (wide layout, beside the chat); the list scrolls inside it. Omit to size to content. */
  height?: number;
};

/**
 * Everyone who wrote in the loaded messages, with arrows to step through that person's messages (the same panel the
 * website shows beside the chat). Shows "3 of 7" once the arrows are in use, and the message count before.
 */
export function ChatPeople({ people, currentUserId, cursors, onJump, selected, onToggle, onClear, height }: Props) {
  const { t } = useI18n();
  const theme = useTheme();

  if (people.length === 0) {
    return (
      <ThemedText type="small" themeColor="textSecondary" style={{ padding: 12 }}>
        {t('chat.peopleNone')}
      </ThemedText>
    );
  }

  const filtering = selected.length > 0;

  return (
    <View>
      {filtering ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingHorizontal: 12, paddingBottom: 8 }}>
          <ThemedText type="small" themeColor="textSecondary" style={{ flex: 1 }}>
            {t('chat.filter.count', { count: selected.length })}
          </ThemedText>
          <Pressable accessibilityRole="button" hitSlop={8} onPress={onClear}>
            <ThemedText type="smallBold" style={{ color: theme.primary }}>
              {t('chat.filter.clear')}
            </ThemedText>
          </Pressable>
        </View>
      ) : null}
      <ScrollView style={height ? { height } : undefined} nestedScrollEnabled>
        {people.map((person) => {
          const chosen = selected.includes(person.user.id);
          // While filtering, a person who is not chosen has no messages on screen for the arrows to go to.
          const stepping = !filtering || chosen;
          const position = person.ids.indexOf(cursors[person.user.id] ?? -1) + 1;
          const active = cursors[person.user.id] !== undefined;

          return (
            <View
              key={person.user.id}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 10,
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderBottomWidth: 1,
                borderBottomColor: theme.border,
                backgroundColor: active || chosen ? theme.backgroundSelected : 'transparent',
              }}
            >
              {/* Tapping the person chooses whose messages the chat shows (several can be chosen). */}
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: chosen }}
                accessibilityLabel={t('chat.filter.toggle', { name: person.user.name })}
                onPress={() => onToggle(person.user.id)}
                style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10 }}
              >
                <Avatar name={person.user.name} uri={person.user.avatar} size={30} />
                <View style={{ flex: 1 }}>
                  <ThemedText type="smallBold" numberOfLines={1}>
                    {person.user.id === currentUserId ? t('chat.you') : person.user.name}
                  </ThemedText>
                  <ThemedText type="small" themeColor="textSecondary" style={{ fontSize: 12, lineHeight: 16 }}>
                    {position > 0 ? t('chat.position', { current: position, total: person.ids.length }) : t('chat.messageCount', { count: person.ids.length })}
                  </ThemedText>
                </View>
                {chosen ? <Icon name="check" size={18} color={theme.primary} /> : null}
              </Pressable>
              <View style={{ opacity: stepping ? 1 : 0.3 }} pointerEvents={stepping ? 'auto' : 'none'}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('chat.previousFrom', { name: person.user.name })}
                  hitSlop={6}
                  onPress={() => onJump(person.user.id, -1)}
                  style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, padding: 2 })}
                >
                  <Icon name="up" size={18} color={theme.textSecondary} />
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={t('chat.nextFrom', { name: person.user.name })}
                  hitSlop={6}
                  onPress={() => onJump(person.user.id, 1)}
                  style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, padding: 2 })}
                >
                  <Icon name="down" size={18} color={theme.textSecondary} />
                </Pressable>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
