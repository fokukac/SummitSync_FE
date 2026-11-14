import { View } from 'react-native';

import { Button, ErrorText } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import type { DateTimeFieldProps } from '@/components/date-time-field';
import { Spacing } from '@/constants/theme';
import { familyFor } from '@/constants/themes';
import { useShape, useTheme } from '@/hooks/use-theme';
import { useAppTheme } from '@/theme/theme-provider';
import { useI18n } from '@/i18n';
import { fieldToDate } from '@/lib/date-field';

/** The browser's own date and time control, speaking the same `YYYY-MM-DD HH:mm` text as the native field. */
export function DateTimeField({ label, value, onChange, error, required = false }: DateTimeFieldProps) {
  const { t } = useI18n();
  const theme = useTheme();
  const shape = useShape();
  const { body } = useAppTheme();
  const valid = fieldToDate(value) !== null;

  return (
    <View style={{ gap: Spacing.one }}>
      <ThemedText type="small">{label}</ThemedText>
      <input
        type="datetime-local"
        aria-label={label}
        value={valid ? value.replace(' ', 'T') : ''}
        onChange={(event) => onChange(event.target.value.replace('T', ' '))}
        style={{
          border: `1px solid ${error ? theme.danger : theme.border}`,
          borderRadius: shape.radius,
          padding: Spacing.three,
          fontSize: 16,
          fontFamily: familyFor(body, 500),
          color: theme.text,
          backgroundColor: theme.backgroundElement,
          colorScheme: 'light dark',
        }}
      />
      {error ? <ErrorText>{error}</ErrorText> : null}
      {value && !required ? <Button variant="plain" title={t('common.clear')} onPress={() => onChange('')} /> : null}
    </View>
  );
}
