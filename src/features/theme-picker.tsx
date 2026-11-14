import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { THEME_IDS, THEMES } from '@/constants/themes';
import { useI18n } from '@/i18n';
import { useAppTheme, type Appearance } from '@/theme/theme-provider';

const APPEARANCES: Appearance[] = ['system', 'light', 'dark'];

/** Colour theme grid plus light/dark/system, mirroring the website's settings (the dark switch is off for dark-only themes). */
export function ThemePicker() {
  const { t } = useI18n();
  const { themeId, setTheme, appearance, setAppearance, definition, colors, shape } = useAppTheme();

  return (
    <View style={{ gap: 16 }}>
      <ThemedText type="smallBold">{t('settings.theme.title')}</ThemedText>
      <View style={{ gap: 10 }} accessibilityRole="radiogroup">
        {THEME_IDS.map((id) => {
          const theme = THEMES[id];
          const selected = id === themeId;

          return (
            <Pressable
              key={id}
              accessibilityRole="radio"
              accessibilityState={{ selected }}
              onPress={() => setTheme(id)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
                padding: 12,
                borderWidth: selected ? 2 : 1,
                borderColor: selected ? colors.primary : colors.border,
                borderRadius: shape.radius,
              }}
            >
              <View style={{ flexDirection: 'row', borderRadius: shape.radiusSmall, overflow: 'hidden', borderWidth: 1, borderColor: colors.border }}>
                {theme.swatch.map((color, index) => (
                  <View key={index} style={{ width: 20, height: 36, backgroundColor: color }} />
                ))}
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText type="smallBold">
                  {theme.name}
                  {theme.darkOnly ? ` · ${t('theme.darkOnly')}` : ''}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary">
                  {theme.description}
                </ThemedText>
              </View>
            </Pressable>
          );
        })}
      </View>

      <ThemedText type="smallBold">{t('nav.appearance')}</ThemedText>
      <View style={{ flexDirection: 'row', gap: 16, opacity: definition.darkOnly ? 0.4 : 1 }}>
        {APPEARANCES.map((value) => (
          <Pressable
            key={value}
            accessibilityRole="button"
            disabled={definition.darkOnly}
            accessibilityState={{ selected: appearance === value }}
            onPress={() => setAppearance(value)}
          >
            <ThemedText type={appearance === value ? 'smallBold' : 'small'} themeColor={appearance === value ? 'primary' : 'textSecondary'}>
              {t(`appearance.${value}`)}
            </ThemedText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
