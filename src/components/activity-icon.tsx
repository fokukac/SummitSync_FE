import Svg, { Path } from 'react-native-svg';

import { ACTIVITY_ICON_PATHS } from '@/constants/activity-icons';
import { useTheme } from '@/hooks/use-theme';

/** The website's icon for an activity (its `icon` key), filled with `color` (the theme's text colour by default). */
export function ActivityIcon({ icon, size = 16, color }: { icon: string; size?: number; color?: string }) {
  const theme = useTheme();
  const path = ACTIVITY_ICON_PATHS[icon];

  // An icon the app does not know yet (added on the server later) simply has no glyph.
  return path ? (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d={path} fill={color ?? theme.text} />
    </Svg>
  ) : null;
}
