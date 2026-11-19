import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';

import { DEFAULT_THEME, THEMES, familyFor, isThemeId, type FontFamily, type Palette, type Shape, type ThemeDefinition, type ThemeId } from '@/constants/themes';
import { DEFAULT_DENSITY, DEFAULT_FONT_SIZE, DENSITY_SCALE, FONT_SCALE, isDensity, isFontSize, type Density, type FontSize } from '@/lib/display';
import { loadThemeFonts } from '@/theme/fonts';

export type Appearance = 'system' | 'light' | 'dark';

const THEME_KEY = 'summitsync.theme';
const APPEARANCE_KEY = 'summitsync.appearance';
const DENSITY_KEY = 'summitsync.density';
const FONT_SIZE_KEY = 'summitsync.fontSize';

type ThemeContextValue = {
  /** False until the saved choice and its fonts are loaded; the root layout keeps the splash screen up until then. */
  ready: boolean;
  definition: ThemeDefinition;
  themeId: ThemeId;
  setTheme: (id: ThemeId) => void;
  appearance: Appearance;
  setAppearance: (value: Appearance) => void;
  density: Density;
  setDensity: (value: Density) => void;
  /** Multiplier for spacing (see `useSpacing`). */
  spaceScale: number;
  fontSize: FontSize;
  setFontSize: (value: FontSize) => void;
  /** Multiplier for text sizes (applied by `ThemedText`). */
  fontScale: number;
  scheme: 'light' | 'dark';
  colors: Palette;
  shape: Shape;
  heading: FontFamily;
  body: FontFamily;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme();
  const [ready, setReady] = useState(false);
  const [themeId, setThemeId] = useState<ThemeId>(DEFAULT_THEME);
  const [appearance, setAppearanceState] = useState<Appearance>('system');
  const [density, setDensityState] = useState<Density>(DEFAULT_DENSITY);
  const [fontSize, setFontSizeState] = useState<FontSize>(DEFAULT_FONT_SIZE);

  useEffect(() => {
    void (async () => {
      const [savedTheme, savedAppearance, savedDensity, savedFontSize] = await Promise.all([
        AsyncStorage.getItem(THEME_KEY),
        AsyncStorage.getItem(APPEARANCE_KEY),
        AsyncStorage.getItem(DENSITY_KEY),
        AsyncStorage.getItem(FONT_SIZE_KEY),
      ]);
      const id = isThemeId(savedTheme) ? savedTheme : DEFAULT_THEME;

      await loadThemeFonts(id);
      setThemeId(id);
      setAppearanceState(savedAppearance === 'light' || savedAppearance === 'dark' ? savedAppearance : 'system');
      setDensityState(isDensity(savedDensity) ? savedDensity : DEFAULT_DENSITY);
      setFontSizeState(isFontSize(savedFontSize) ? savedFontSize : DEFAULT_FONT_SIZE);
      setReady(true);
    })();
  }, []);

  const setTheme = useCallback((id: ThemeId) => {
    // Fonts first, so the screen never renders the new theme in the old (or a fallback) typeface.
    void loadThemeFonts(id).then(() => setThemeId(id));
    void AsyncStorage.setItem(THEME_KEY, id);
  }, []);

  const setAppearance = useCallback((value: Appearance) => {
    setAppearanceState(value);
    void AsyncStorage.setItem(APPEARANCE_KEY, value);
  }, []);

  const setDensity = useCallback((value: Density) => {
    setDensityState(value);
    void AsyncStorage.setItem(DENSITY_KEY, value);
  }, []);

  const setFontSize = useCallback((value: FontSize) => {
    setFontSizeState(value);
    void AsyncStorage.setItem(FONT_SIZE_KEY, value);
  }, []);

  const value = useMemo<ThemeContextValue>(() => {
    const definition = THEMES[themeId];
    const scheme = definition.darkOnly ? 'dark' : appearance === 'system' ? (system === 'dark' ? 'dark' : 'light') : appearance;

    return {
      ready,
      definition,
      themeId,
      setTheme,
      appearance,
      setAppearance,
      density,
      setDensity,
      spaceScale: DENSITY_SCALE[density],
      fontSize,
      setFontSize,
      fontScale: FONT_SCALE[fontSize],
      scheme,
      colors: definition[scheme],
      shape: definition.shape,
      heading: definition.heading,
      body: definition.body,
    };
  }, [ready, themeId, appearance, density, fontSize, system, setTheme, setAppearance, setDensity, setFontSize]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme(): ThemeContextValue {
  const value = useContext(ThemeContext);

  if (value === null) {
    throw new Error('useAppTheme must be used inside AppThemeProvider');
  }

  return value;
}

/** Options for every stack navigator, so headers follow the theme: flat, themed title, a plain back chevron. */
export function useStackOptions() {
  const { colors, body } = useAppTheme();

  return {
    headerShadowVisible: false,
    headerBackButtonDisplayMode: 'minimal' as const,
    headerTintColor: colors.text,
    headerStyle: { backgroundColor: colors.background },
    headerTitleStyle: { color: colors.text, fontFamily: familyFor(body, 600) },
    contentStyle: { backgroundColor: colors.background },
  };
}
