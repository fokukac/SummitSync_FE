import { Pressable } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

import { useShape, useTheme } from '@/hooks/use-theme';

export type IconName = 'groups' | 'search' | 'settings' | 'plus' | 'back' | 'clock' | 'pin' | 'check' | 'up' | 'down' | 'camera' | 'trash';

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
