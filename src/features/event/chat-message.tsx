import { View } from 'react-native';

import { Avatar } from '@/components/avatar';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

const AVATAR = 36;

type Props = {
  name: string;
  avatar?: string | null;
  /** Time shown beside the name; omit while a message is still being sent. */
  time?: string;
  body: string;
  /** First message of a block: shows the avatar, name and time. */
  header: boolean;
  own?: boolean;
  /** A line under the text (waiting to send, failed). */
  status?: React.ReactNode;
  /** Dimmed: not on the server yet. */
  sending?: boolean;
  /** The "..." menu. */
  actions?: React.ReactNode;
};

/**
 * One chat message, flat: no bubble, no card. Avatar on the left, name and time above the text, the "..." menu at the
 * right edge. Follow-up messages in a block line up under the first one's text.
 */
export function ChatMessage({ name, avatar, time, body, header, own = false, status, sending = false, actions }: Props) {
  const theme = useTheme();

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginTop: header ? 14 : 2, opacity: sending ? 0.6 : 1 }}>
      <View style={{ width: AVATAR }}>{header ? <Avatar name={name} uri={avatar} size={AVATAR} /> : null}</View>
      <View style={{ flex: 1 }}>
        {header ? (
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
            <ThemedText type="smallBold" style={{ color: own ? theme.primary : theme.text }}>
              {name}
            </ThemedText>
            {time ? (
              <ThemedText type="small" themeColor="textSecondary" style={{ fontSize: 12 }}>
                {time}
              </ThemedText>
            ) : null}
          </View>
        ) : null}
        <ThemedText>{body}</ThemedText>
        {status}
      </View>
      {actions}
    </View>
  );
}
