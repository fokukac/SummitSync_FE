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
  /** Fixed height (wide layout, beside the chat); the list scrolls inside it. Omit to size to content. */
  height?: number;
};

/**
 * Everyone who wrote in the loaded messages, with arrows to step through that person's messages (the same panel the
 * website shows beside the chat). Shows "3 of 7" once the arrows are in use, and the message count before.
 */
export function ChatPeople({ people, currentUserId, cursors, onJump, height }: Props) {
  const { t } = useI18n();
  const theme = useTheme();

  if (people.length === 0) {
    return (
      <ThemedText type="small" themeColor="textSecondary" style={{ padding: 12 }}>
        {t('chat.peopleNone')}
      </ThemedText>
    );
  }

  return (
    <ScrollView style={height ? { height } : undefined} nestedScrollEnabled>
      {people.map((person) => {
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
              backgroundColor: active ? theme.backgroundSelected : 'transparent',
            }}
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
            <View>
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
  );
}
