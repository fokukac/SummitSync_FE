/**
 * Interface density and font size, mirroring the website's settings (`be/resources/css/themes.css`): there, density
 * scales Tailwind's spacing unit (0.21 / 0.25 / 0.285 rem) and font size scales the root size (90% / 100% / 112.5%).
 */
export type Density = 'condensed' | 'normal' | 'relaxed';
export type FontSize = 'small' | 'medium' | 'large';

export const DENSITIES: readonly Density[] = ['condensed', 'normal', 'relaxed'];
export const FONT_SIZES: readonly FontSize[] = ['small', 'medium', 'large'];

export const DEFAULT_DENSITY: Density = 'normal';
export const DEFAULT_FONT_SIZE: FontSize = 'medium';

export const DENSITY_SCALE: Record<Density, number> = { condensed: 0.84, normal: 1, relaxed: 1.14 };
export const FONT_SCALE: Record<FontSize, number> = { small: 0.9, medium: 1, large: 1.125 };

export const isDensity = (value: unknown): value is Density => typeof value === 'string' && (DENSITIES as readonly string[]).includes(value);

export const isFontSize = (value: unknown): value is FontSize => typeof value === 'string' && (FONT_SIZES as readonly string[]).includes(value);

/** A size multiplied by a scale, rounded to half a point so layouts stay crisp. */
export function scaleSize(value: number, scale: number): number {
  return Math.round(value * scale * 2) / 2;
}

/** Every entry of a spacing table multiplied by the scale. */
export function scaleSpacing<T extends Record<string, number>>(spacing: T, scale: number): T {
  return Object.fromEntries(Object.entries(spacing).map(([name, value]) => [name, scaleSize(value, scale)])) as T;
}
