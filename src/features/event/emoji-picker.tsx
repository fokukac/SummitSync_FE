import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { EMOJI_CATEGORIES } from '@/constants/emojis';
import { useShape, useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n';
import { RECENT_EMOJIS_MAX, rememberEmoji } from '@/lib/emojis';

const RECENT_KEY = 'summitsync.recent-emojis';

/**
 * The emoji panel of the chat composer: a row of category tabs (starting on "recently used" once there is any) over a
 * grid of emojis. The same curated set as the website; what was picked last is remembered on the device.
 */
export function EmojiPicker({ onPick }: { onPick: (emoji: string) => void }) {
  const { t } = useI18n();
  const theme = useTheme();
  const shape = useShape();
  const [recent, setRecent] = useState<string[]>([]);
  const [active, setActive] = useState<string>(EMOJI_CATEGORIES[0].key);

  useEffect(() => {
    void AsyncStorage.getItem(RECENT_KEY).then((stored) => {
      try {
        const parsed: unknown = stored ? JSON.parse(stored) : [];
        const list = Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === 'string').slice(0, RECENT_EMOJIS_MAX) : [];

        setRecent(list);

        if (list.length > 0) {
          setActive('recent');
        }
      } catch {
        // Corrupt or unreadable: simply no recent emojis.
      }
    });
  }, []);

  const tabs = [...(recent.length > 0 ? [{ key: 'recent', icon: '🕘', emojis: recent }] : []), ...EMOJI_CATEGORIES];
  const emojis = tabs.find((tab) => tab.key === active)?.emojis ?? tabs[0].emojis;

  function pick(emoji: string) {
    const next = rememberEmoji(recent, emoji);

    setRecent(next);
    void AsyncStorage.setItem(RECENT_KEY, JSON.stringify(next));
    onPick(emoji);
  }

  return (
    <View style={{ borderWidth: 1, borderColor: theme.border, borderRadius: shape.radius, backgroundColor: theme.backgroundElement, overflow: 'hidden' }}>
      <View accessibilityRole="tablist" style={{ flexDirection: 'row', gap: 4, padding: 6, borderBottomWidth: 1, borderBottomColor: theme.border }}>
        {tabs.map((tab) => {
          const selected = tab.key === active;

          return (
            <Pressable
              key={tab.key}
              accessibilityRole="tab"
              accessibilityState={{ selected }}
              accessibilityLabel={tab.key === 'recent' ? t('chat.emoji.recent') : t(`chat.emoji.${tab.key}` as 'chat.emoji.smileys')}
              onPress={() => setActive(tab.key)}
              style={{
                width: 36,
                height: 36,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: shape.radiusSmall + 2,
                backgroundColor: selected ? theme.backgroundSelected : 'transparent',
              }}
            >
              <ThemedText style={{ fontSize: 18, lineHeight: 24 }}>{tab.icon}</ThemedText>
            </Pressable>
          );
        })}
      </View>
      <ScrollView
        style={{ maxHeight: 200 }}
        contentContainerStyle={{ flexDirection: 'row', flexWrap: 'wrap', padding: 6 }}
        nestedScrollEnabled
        keyboardShouldPersistTaps="always"
      >
        {emojis.map((emoji) => (
          <Pressable
            key={emoji}
            accessibilityRole="button"
            accessibilityLabel={emoji}
            onPress={() => pick(emoji)}
            style={({ pressed }) => ({
              width: '12.5%',
              minWidth: 36,
              aspectRatio: 1,
              maxHeight: 44,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: shape.radiusSmall + 2,
              backgroundColor: pressed ? theme.backgroundSelected : 'transparent',
            })}
          >
            <ThemedText style={{ fontSize: 22, lineHeight: 28 }}>{emoji}</ThemedText>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
