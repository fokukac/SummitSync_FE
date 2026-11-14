import { StyleSheet, View } from 'react-native';
import { type ReactNode } from 'react';
import Svg, { Ellipse, G } from 'react-native-svg';

import { useAppTheme } from '@/theme/theme-provider';

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
