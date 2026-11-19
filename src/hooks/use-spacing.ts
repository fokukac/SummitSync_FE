import { useMemo } from 'react';

import { Spacing } from '@/constants/theme';
import { scaleSpacing } from '@/lib/display';
import { useAppTheme } from '@/theme/theme-provider';

/** The spacing table scaled by the chosen interface density; use it in inline styles where a layout should follow it. */
export function useSpacing(): typeof Spacing {
  const { spaceScale } = useAppTheme();

  return useMemo(() => scaleSpacing({ ...Spacing }, spaceScale) as typeof Spacing, [spaceScale]);
}
