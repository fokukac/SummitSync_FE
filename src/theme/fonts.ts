import * as Font from 'expo-font';

import type { ThemeId } from '@/constants/themes';

/**
 * Font files per theme, loaded when the theme is first used (so a theme nobody picked costs nothing at startup).
 * Deep imports on purpose: the packages' index would pull every weight of every family into the bundle.
 */
const FILES: Record<ThemeId, () => Record<string, number>> = {
  alpine: () => ({
    Fraunces_600SemiBold: require('@expo-google-fonts/fraunces/600SemiBold/Fraunces_600SemiBold.ttf'),
    Fraunces_700Bold: require('@expo-google-fonts/fraunces/700Bold/Fraunces_700Bold.ttf'),
    Figtree_400Regular: require('@expo-google-fonts/figtree/400Regular/Figtree_400Regular.ttf'),
    Figtree_500Medium: require('@expo-google-fonts/figtree/500Medium/Figtree_500Medium.ttf'),
    Figtree_600SemiBold: require('@expo-google-fonts/figtree/600SemiBold/Figtree_600SemiBold.ttf'),
    Figtree_700Bold: require('@expo-google-fonts/figtree/700Bold/Figtree_700Bold.ttf'),
  }),
  instrument: () => ({
    BarlowSemiCondensed_500Medium: require('@expo-google-fonts/barlow-semi-condensed/500Medium/BarlowSemiCondensed_500Medium.ttf'),
    BarlowSemiCondensed_600SemiBold: require('@expo-google-fonts/barlow-semi-condensed/600SemiBold/BarlowSemiCondensed_600SemiBold.ttf'),
    BarlowSemiCondensed_700Bold: require('@expo-google-fonts/barlow-semi-condensed/700Bold/BarlowSemiCondensed_700Bold.ttf'),
    Barlow_400Regular: require('@expo-google-fonts/barlow/400Regular/Barlow_400Regular.ttf'),
    Barlow_500Medium: require('@expo-google-fonts/barlow/500Medium/Barlow_500Medium.ttf'),
    Barlow_600SemiBold: require('@expo-google-fonts/barlow/600SemiBold/Barlow_600SemiBold.ttf'),
    Barlow_700Bold: require('@expo-google-fonts/barlow/700Bold/Barlow_700Bold.ttf'),
  }),
  nordic: () => ({
    Inter_300Light: require('@expo-google-fonts/inter/300Light/Inter_300Light.ttf'),
    Inter_400Regular: require('@expo-google-fonts/inter/400Regular/Inter_400Regular.ttf'),
    Inter_500Medium: require('@expo-google-fonts/inter/500Medium/Inter_500Medium.ttf'),
    Inter_600SemiBold: require('@expo-google-fonts/inter/600SemiBold/Inter_600SemiBold.ttf'),
  }),
  social: () => ({
    Archivo_400Regular: require('@expo-google-fonts/archivo/400Regular/Archivo_400Regular.ttf'),
    Archivo_500Medium: require('@expo-google-fonts/archivo/500Medium/Archivo_500Medium.ttf'),
    Archivo_600SemiBold: require('@expo-google-fonts/archivo/600SemiBold/Archivo_600SemiBold.ttf'),
    Archivo_700Bold: require('@expo-google-fonts/archivo/700Bold/Archivo_700Bold.ttf'),
    Archivo_800ExtraBold: require('@expo-google-fonts/archivo/800ExtraBold/Archivo_800ExtraBold.ttf'),
  }),
};

/** Resolves once the theme's fonts are usable. A failure is swallowed: text falls back to the system font. */
export async function loadThemeFonts(id: ThemeId): Promise<void> {
  try {
    await Font.loadAsync(FILES[id]());
  } catch {
    // Offline web or a missing file: the system font is an acceptable fallback.
  }
}
