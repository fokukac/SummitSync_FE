import type { Palette, Shape } from '@/constants/themes';
import { useAppTheme } from '@/theme/theme-provider';

/** The active palette (light or dark, of the chosen theme). */
export function useTheme(): Palette {
  return useAppTheme().colors;
}

/** Corner radii and avatar shape of the chosen theme. */
export function useShape(): Shape {
  return useAppTheme().shape;
}
