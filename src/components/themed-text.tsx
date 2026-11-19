import { Platform, StyleSheet, Text, type TextProps, type TextStyle } from 'react-native';

import { Fonts, ThemeColor } from '@/constants/theme';
import { familyFor } from '@/constants/themes';
import { scaleSize } from '@/lib/display';
import { useAppTheme } from '@/theme/theme-provider';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'small' | 'smallBold' | 'subtitle' | 'link' | 'linkPrimary' | 'code';
  themeColor?: ThemeColor;
};

/** Titles use the theme's heading typeface; everything else its body typeface. */
const HEADINGS = new Set<ThemedTextProps['type']>(['title', 'subtitle']);

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const { colors, heading, body, shape, fontScale } = useAppTheme();
  const base: TextStyle = styles[type];
  const isHeading = HEADINGS.has(type);
  const flat = StyleSheet.flatten([base, style]);
  const weight = Number(flat?.fontWeight ?? 500);
  // The chosen font size scales the final size (a screen's own override included) and its line height together.
  const scaled: TextStyle =
    fontScale === 1
      ? {}
      : {
          ...(typeof flat?.fontSize === 'number' ? { fontSize: scaleSize(flat.fontSize, fontScale) } : {}),
          ...(typeof flat?.lineHeight === 'number' ? { lineHeight: scaleSize(flat.lineHeight, fontScale) } : {}),
        };
  const fontFamily = type === 'code' ? undefined : familyFor(isHeading ? heading : body, weight);

  // A custom family is one file per weight: asking for `fontWeight` on top would synthesise a second bold.
  const typeface: TextStyle = fontFamily ? { fontFamily, fontWeight: 'normal' } : {};
  const casing: TextStyle = isHeading && shape.uppercaseHeadings ? { textTransform: 'uppercase', letterSpacing: 0.5 } : {};

  return <Text style={[{ color: colors[themeColor ?? 'text'] }, base, style, scaled, typeface, casing]} {...rest} />;
}

const styles = StyleSheet.create({
  small: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
  },
  smallBold: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 700,
  },
  default: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 500,
  },
  title: {
    fontSize: 48,
    fontWeight: 600,
    lineHeight: 52,
  },
  subtitle: {
    fontSize: 32,
    lineHeight: 40,
    fontWeight: 600,
  },
  link: {
    lineHeight: 30,
    fontSize: 14,
  },
  linkPrimary: {
    lineHeight: 30,
    fontSize: 14,
    color: '#3c87f7',
  },
  code: {
    fontFamily: Fonts.mono,
    fontWeight: Platform.select({ android: 700 }) ?? 500,
    fontSize: 12,
  },
});
