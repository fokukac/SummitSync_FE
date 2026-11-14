import { Pressable } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { useShape, useTheme } from '@/hooks/use-theme';

export type IconName =
  | 'groups'
  | 'search'
  | 'settings'
  | 'plus'
  | 'back'
  | 'clock'
  | 'pin'
  | 'check'
  | 'up'
  | 'down'
  | 'camera'
  | 'trash'
  | 'send'
  | 'more'
  | 'chat'
  | 'calendar'
  | 'list'
  | 'poll'
  | 'bag'
  | 'mail'
  | 'alert'
  | 'lock'
  | 'smile'
  | 'eye'
  | 'eyeOff'
  | 'ban'
  | 'offline';

/** Stroke icons (24px grid), drawn with the theme's text colour unless told otherwise. */
export function Icon({ name, size = 24, color }: { name: IconName; size?: number; color?: string }) {
  const theme = useTheme();

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color ?? theme.text} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      {name === 'groups' ? (
        <>
          <Path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <Circle cx={9} cy={7} r={4} />
          <Path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <Path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </>
      ) : null}
      {name === 'send' ? <Path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z" /> : null}
      {name === 'more' ? (
        <>
          <Circle cx={5} cy={12} r={1} />
          <Circle cx={12} cy={12} r={1} />
          <Circle cx={19} cy={12} r={1} />
        </>
      ) : null}
      {name === 'search' ? (
        <>
          <Circle cx={11} cy={11} r={7} />
          <Path d="m20 20-3.5-3.5" />
        </>
      ) : null}
      {name === 'settings' ? (
        <>
          <Path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" />
          <Circle cx={16} cy={6} r={2} />
          <Circle cx={10} cy={12} r={2} />
          <Circle cx={18} cy={18} r={2} />
        </>
      ) : null}
      {name === 'plus' ? <Path d="M12 5v14M5 12h14" /> : null}
      {name === 'clock' ? (
        <>
          <Circle cx={12} cy={12} r={9} />
          <Path d="M12 7v5l3 2" />
        </>
      ) : null}
      {name === 'pin' ? (
        <>
          <Path d="M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11z" />
          <Circle cx={12} cy={10} r={2.5} />
        </>
      ) : null}
      {name === 'check' ? <Path d="m5 12.5 4.5 4.5L19 7.5" /> : null}
      {name === 'up' ? <Path d="m6 15 6-6 6 6" /> : null}
      {name === 'down' ? <Path d="m6 9 6 6 6-6" /> : null}
      {name === 'camera' ? (
        <>
          <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
          <Circle cx={12} cy={13} r={4} />
        </>
      ) : null}
      {name === 'trash' ? <Path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m5 5v6m4-6v6" /> : null}
      {name === 'back' ? <Path d="m15 18-6-6 6-6" /> : null}
      {name === 'chat' ? <Path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /> : null}
      {name === 'calendar' ? <Path d="M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM16 2v4M8 2v4M3 10h18" /> : null}
      {name === 'list' ? <Path d="M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2" /> : null}
      {name === 'poll' ? <Path d="M5 21V10M12 21V3M19 21v-7" /> : null}
      {name === 'bag' ? <Path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" /> : null}
      {name === 'mail' ? <Path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zM22 7l-10 6L2 7" /> : null}
      {name === 'smile' ? (
        <>
          <Circle cx={12} cy={12} r={10} />
          <Path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
        </>
      ) : null}
      {name === 'eye' ? (
        <>
          <Path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z" />
          <Circle cx={12} cy={12} r={3} />
        </>
      ) : null}
      {name === 'eyeOff' ? (
        <Path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-8-10-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" />
      ) : null}
      {name === 'lock' ? <Path d="M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2zM7 11V7a5 5 0 0 1 10 0v4" /> : null}
      {name === 'alert' ? (
        <>
          <Circle cx={12} cy={12} r={10} />
          <Path d="M12 8v4M12 16h.01" />
        </>
      ) : null}
      {name === 'ban' ? (
        <>
          <Circle cx={12} cy={12} r={10} />
          <Path d="m4.9 4.9 14.2 14.2" />
        </>
      ) : null}
      {name === 'offline' ? (
        <Path d="M2 2l20 20M8.5 16.5a5 5 0 0 1 7 0M2 8.8a15 15 0 0 1 4.2-2.7M22 8.8a15 15 0 0 0-9.2-3.7M5 12.9a10 10 0 0 1 5.2-2.6M19 12.9a10 10 0 0 0-2.6-2M12 20h.01" />
      ) : null}
    </Svg>
  );
}

/** A tappable icon. Plain by default (no border, no fill); `filled` is the one primary action on a screen. */
export function IconButton({ name, label, onPress, filled = false }: { name: IconName; label: string; onPress: () => void; filled?: boolean }) {
  const theme = useTheme();
  const shape = useShape();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={6}
      onPress={onPress}
      style={({ pressed }) => [
        { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', opacity: pressed ? 0.6 : 1 },
        filled ? { backgroundColor: theme.primary, borderRadius: shape.avatar === 'round' ? 22 : shape.radius } : null,
      ]}
    >
      <Icon name={name} color={filled ? theme.onPrimary : theme.text} />
    </Pressable>
  );
}
