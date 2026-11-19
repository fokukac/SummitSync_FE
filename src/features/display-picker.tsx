import { View } from 'react-native';

import { Segmented } from '@/components/segmented';
import { ThemedText } from '@/components/themed-text';
import { useI18n } from '@/i18n';
import { DENSITIES, FONT_SIZES } from '@/lib/display';
import { useAppTheme } from '@/theme/theme-provider';

/** Interface density and font size, mirroring the website's Appearance settings; remembered on the device. */
export function DisplayPicker() {
  const { t } = useI18n();
  const { density, setDensity, fontSize, setFontSize } = useAppTheme();

  return (
    <View style={{ gap: 12 }}>
      <View style={{ gap: 2 }}>
        <ThemedText type="smallBold">{t('settings.density.title')}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {t('settings.density.description')}
        </ThemedText>
      </View>
      <Segmented value={density} onChange={setDensity} options={DENSITIES.map((value) => ({ value, label: t(`density.${value}`) }))} />

      <View style={{ gap: 2 }}>
        <ThemedText type="smallBold">{t('settings.fontSize.title')}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {t('settings.fontSize.description')}
        </ThemedText>
      </View>
      <Segmented value={fontSize} onChange={setFontSize} options={FONT_SIZES.map((value) => ({ value, label: t(`fontSize.${value}`) }))} />
    </View>
  );
}
