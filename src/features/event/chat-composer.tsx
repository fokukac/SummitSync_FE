import { useRef, useState } from 'react';
import { Platform, Pressable, TextInput, type TextInputKeyPressEvent, type TextInputSelectionChangeEvent, View } from 'react-native';

import { Icon } from '@/components/icon';
import { ThemedText } from '@/components/themed-text';
import { familyFor } from '@/constants/themes';
import { EmojiPicker } from '@/features/event/emoji-picker';
import { useShape, useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n';
import { insertAt } from '@/lib/emojis';
import { useAppTheme } from '@/theme/theme-provider';

const BUTTON = 44;
const MAX_INPUT_HEIGHT = 140;
/** What the field is taller than its text (native reports the text alone): padding (10 + 10) and border (1 + 1). */
const FIELD_CHROME = 22;
const COUNTER_FROM = 200;

type Props = { draft: string; onChange: (text: string) => void; onSend: () => void; maxLength: number };

/**
 * The message composer, laid out as on the website: an emoji button, the text field and a round send button side by
 * side, with the emoji panel opening above them. Enter sends on the web (Shift+Enter makes a new line).
 */
export function ChatComposer({ draft, onChange, onSend, maxLength }: Props) {
  const { t } = useI18n();
  const theme = useTheme();
  const shape = useShape();
  const { body: bodyFont } = useAppTheme();
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [focused, setFocused] = useState(false);
  const [inputHeight, setInputHeight] = useState(BUTTON);
  // Where the caret is (kept in a ref: it changes on every key press) and, only right after an emoji was inserted, where to put it.
  const caret = useRef({ start: 0, end: 0 });
  const [forced, setForced] = useState<{ start: number; end: number }>();
  const empty = draft.trim() === '';
  const radius = Math.max(shape.radius, 14);

  function addEmoji(emoji: string) {
    const result = insertAt(draft, caret.current, emoji);

    if (result.text.length > maxLength) {
      return;
    }

    onChange(result.text);
    caret.current = { start: result.caret, end: result.caret };
    setForced(caret.current);
  }

  function onSelectionChange(event: TextInputSelectionChangeEvent) {
    caret.current = event.nativeEvent.selection;
    // The forced position has been applied; from here the field manages its own caret again.
    setForced(undefined);
  }

  function onKeyPress(event: TextInputKeyPressEvent) {
    const native = event.nativeEvent as typeof event.nativeEvent & { shiftKey?: boolean };

    if (Platform.OS === 'web' && native.key === 'Enter' && !native.shiftKey) {
      event.preventDefault();
      onSend();
    }
  }

  return (
    <View style={{ marginTop: 12, gap: 8 }}>
      {emojiOpen ? <EmojiPicker onPick={addEmoji} /> : null}

      <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 8 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('chat.emoji.add')}
          accessibilityState={{ expanded: emojiOpen }}
          onPress={() => setEmojiOpen((open) => !open)}
          style={({ pressed }) => ({
            width: BUTTON,
            height: BUTTON,
            borderRadius: BUTTON / 2,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: emojiOpen || pressed ? theme.backgroundSelected : 'transparent',
          })}
        >
          <Icon name="smile" size={22} color={emojiOpen ? theme.primary : theme.textSecondary} />
        </Pressable>

        <TextInput
          value={draft}
          onChangeText={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyPress={onKeyPress}
          onSelectionChange={onSelectionChange}
          selection={forced}
          placeholder={t('chat.placeholder')}
          placeholderTextColor={theme.textSecondary}
          accessibilityLabel={t('chat.placeholder')}
          multiline
          // One line to start with (a browser's multi-line field is two rows tall by default, which towered over the buttons),
          // then growing with the text up to a limit. On the web the browser does the growing itself; on a phone the
          // measured text height sets the field's height.
          numberOfLines={1}
          onContentSizeChange={
            Platform.OS === 'web'
              ? undefined
              : (event) => setInputHeight(Math.min(MAX_INPUT_HEIGHT, Math.max(BUTTON, event.nativeEvent.contentSize.height + FIELD_CHROME)))
          }
          maxLength={maxLength}
          style={[
            {
              flex: 1,
              ...(Platform.OS === 'web' ? { minHeight: BUTTON, maxHeight: MAX_INPUT_HEIGHT, fieldSizing: 'content' } : { height: inputHeight }),
              color: theme.text,
              fontFamily: familyFor(bodyFont, 500),
              borderWidth: 1,
              borderColor: focused ? theme.primary : theme.border,
              borderRadius: radius,
              backgroundColor: theme.backgroundElement,
              paddingHorizontal: 16,
              paddingVertical: 10,
              fontSize: 16,
              lineHeight: 22,
            },
            // The outline is drawn by the border (which also shows focus); the browser's own ring would double it.
            Platform.OS === 'web' ? ({ outlineStyle: 'none' } as object) : null,
          ]}
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('chat.send')}
          accessibilityState={{ disabled: empty }}
          onPress={onSend}
          style={({ pressed }) => ({
            width: BUTTON,
            height: BUTTON,
            borderRadius: BUTTON / 2,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.primary,
            opacity: empty ? 0.4 : pressed ? 0.8 : 1,
          })}
        >
          <Icon name="send" size={20} color={theme.onPrimary} />
        </Pressable>
      </View>

      {draft.length > maxLength - COUNTER_FROM ? (
        <ThemedText type="small" themeColor="textSecondary" style={{ textAlign: 'right', fontSize: 12 }}>
          {t('chat.charsLeft', { count: maxLength - draft.length })}
        </ThemedText>
      ) : null}
    </View>
  );
}
