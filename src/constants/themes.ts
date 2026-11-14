/**
 * The selectable app themes (the mobile counterpart of the website's colour themes). Each one is a complete look: a
 * light and a dark palette, corner radii, avatar shape and typefaces. Components read them through `useTheme()` /
 * `useShape()` / `useFonts()` (src/theme/theme-provider.tsx) and never hardcode colours, radii or font names.
 */

export type Palette = {
  text: string;
  background: string;
  backgroundElement: string;
  backgroundSelected: string;
  textSecondary: string;
  primary: string;
  onPrimary: string;
  danger: string;
  border: string;
};

export type ThemeColor = keyof Palette;

export type Shape = {
  /** Buttons, inputs, images, menus. */
  radius: number;
  /** Tags, checkboxes, small badges. */
  radiusSmall: number;
  avatar: 'round' | 'rounded';
  /** Screen titles in capitals (instrument panels). */
  uppercaseHeadings: boolean;
};

export type FontWeight = 300 | 400 | 500 | 600 | 700 | 800;

/** One loaded family per weight: custom fonts are separate files, `fontWeight` does not pick between them. */
export type FontFamily = Partial<Record<FontWeight, string>>;

export type ThemeId = 'alpine' | 'instrument' | 'nordic' | 'social';

export type ThemeDefinition = {
  id: ThemeId;
  name: string;
  description: string;
  /** Only a dark palette exists; the light/dark setting is ignored. */
  darkOnly: boolean;
  light: Palette;
  dark: Palette;
  shape: Shape;
  heading: FontFamily;
  body: FontFamily;
  /** Preview swatch for the picker: [page, surface, accent]. */
  swatch: [string, string, string];
};

const instrument: Palette = {
  text: '#EEF2F5',
  background: '#121416',
  backgroundElement: '#1B1E21',
  backgroundSelected: '#262B30',
  textSecondary: '#A9B3BC',
  primary: '#12A7F0',
  onPrimary: '#041218',
  danger: '#FF6B5E',
  border: '#2A2F34',
};

export const THEMES: Record<ThemeId, ThemeDefinition> = {
  alpine: {
    id: 'alpine',
    name: 'Alpine Dawn',
    description: 'Warm paper, pine green, serif headings',
    darkOnly: false,
    light: {
      text: '#1E2A24',
      background: '#F6F1E9',
      backgroundElement: '#FBF8F2',
      backgroundSelected: '#E9E2D5',
      textSecondary: '#4F5A53',
      primary: '#1F5D45',
      onPrimary: '#FFFFFF',
      danger: '#8A2F1F',
      border: '#DDD5C5',
    },
    dark: {
      text: '#EEF1EC',
      background: '#121A16',
      backgroundElement: '#1A241F',
      backgroundSelected: '#25322B',
      textSecondary: '#A9B6AD',
      primary: '#5BC495',
      onPrimary: '#07261A',
      danger: '#F08A7A',
      border: '#2B3830',
    },
    shape: { radius: 10, radiusSmall: 6, avatar: 'rounded', uppercaseHeadings: false },
    heading: { 600: 'Fraunces_600SemiBold', 700: 'Fraunces_700Bold' },
    body: { 400: 'Figtree_400Regular', 500: 'Figtree_500Medium', 600: 'Figtree_600SemiBold', 700: 'Figtree_700Bold' },
    swatch: ['#F6F1E9', '#FBF8F2', '#1F5D45'],
  },
  instrument: {
    id: 'instrument',
    name: 'Instrument',
    description: 'Dark, data-first, condensed type, electric blue',
    darkOnly: true,
    light: instrument,
    dark: instrument,
    shape: { radius: 4, radiusSmall: 3, avatar: 'rounded', uppercaseHeadings: true },
    heading: { 500: 'BarlowSemiCondensed_500Medium', 600: 'BarlowSemiCondensed_600SemiBold', 700: 'BarlowSemiCondensed_700Bold' },
    body: { 400: 'Barlow_400Regular', 500: 'Barlow_500Medium', 600: 'Barlow_600SemiBold', 700: 'Barlow_700Bold' },
    swatch: ['#121416', '#1B1E21', '#12A7F0'],
  },
  nordic: {
    id: 'nordic',
    name: 'Nordic',
    description: 'Quiet and airy, thin type, one signal red',
    darkOnly: false,
    light: {
      text: '#14181C',
      background: '#F5F6F7',
      backgroundElement: '#FFFFFF',
      backgroundSelected: '#E4E8EB',
      textSecondary: '#555E66',
      primary: '#E0301E',
      onPrimary: '#FFFFFF',
      danger: '#C0291A',
      border: '#DADEE1',
    },
    dark: {
      text: '#ECEFF1',
      background: '#0F1214',
      backgroundElement: '#171B1E',
      backgroundSelected: '#22282C',
      textSecondary: '#A0A9B0',
      primary: '#FF5A47',
      onPrimary: '#1A0603',
      danger: '#FF7A6B',
      border: '#2A3136',
    },
    shape: { radius: 4, radiusSmall: 2, avatar: 'rounded', uppercaseHeadings: false },
    heading: { 300: 'Inter_300Light', 400: 'Inter_400Regular', 500: 'Inter_500Medium' },
    body: { 400: 'Inter_400Regular', 500: 'Inter_500Medium', 600: 'Inter_600SemiBold' },
    swatch: ['#F5F6F7', '#FFFFFF', '#E0301E'],
  },
  social: {
    id: 'social',
    name: 'Social Sport',
    description: 'White, bold and energetic, hot orange',
    darkOnly: false,
    light: {
      text: '#1D1D21',
      background: '#FFFFFF',
      backgroundElement: '#F6F6F8',
      backgroundSelected: '#EDEDF0',
      textSecondary: '#52525B',
      primary: '#FC4C02',
      onPrimary: '#FFFFFF',
      danger: '#C23B00',
      border: '#E4E4E8',
    },
    dark: {
      text: '#F4F4F6',
      background: '#121214',
      backgroundElement: '#1C1C20',
      backgroundSelected: '#2A2A30',
      textSecondary: '#A6A6B0',
      primary: '#FF6A2B',
      onPrimary: '#1A0800',
      danger: '#FF8A5C',
      border: '#2E2E34',
    },
    shape: { radius: 8, radiusSmall: 4, avatar: 'round', uppercaseHeadings: false },
    heading: { 700: 'Archivo_700Bold', 800: 'Archivo_800ExtraBold' },
    body: { 400: 'Archivo_400Regular', 500: 'Archivo_500Medium', 600: 'Archivo_600SemiBold', 700: 'Archivo_700Bold' },
    swatch: ['#FFFFFF', '#F6F6F8', '#FC4C02'],
  },
};

export const THEME_IDS = Object.keys(THEMES) as ThemeId[];
export const DEFAULT_THEME: ThemeId = 'alpine';

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === 'string' && value in THEMES;
}

/** The family for a weight, falling back to the nearest weight the theme ships. */
export function familyFor(family: FontFamily, weight: number): string | undefined {
  const available = (Object.keys(family) as unknown as string[]).map(Number).sort((a, b) => Math.abs(a - weight) - Math.abs(b - weight));

  return available.length > 0 ? family[available[0] as FontWeight] : undefined;
}
