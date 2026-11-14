import NativeDateTimePicker from '@expo/ui/community/datetime-picker';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { Button, ErrorText, FieldLabel } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useShape, useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n';
import { combineDayAndTime, dateToField, fieldToDate, pickerStart } from '@/lib/date-field';

export type DateTimeFieldProps = {
  label: string;
  /** `YYYY-MM-DD HH:mm`, or '' while nothing is chosen. */
  value: string;
  onChange: (value: string) => void;
  error?: string;
  /** An optional field can be cleared again. */
  required?: boolean;
  /** Where the picker opens when empty, in the same format (e.g. an end time opens at the start time). */
  suggest?: string;
};

type Step = 'closed' | 'date' | 'time';

/**
 * Date and time chosen with the system pickers. Android: a date dialog, then a time dialog. iOS: one inline
 * date-and-time picker. The form keeps its `YYYY-MM-DD HH:mm` text, so nothing downstream changes.
 */
export function DateTimeField({ label, value, onChange, error, required = false, suggest = '' }: DateTimeFieldProps) {
  const { t } = useI18n();
  const theme = useTheme();
  const shape = useShape();
  const [step, setStep] = useState<Step>('closed');
  const [day, setDay] = useState<Date>();
  const current = fieldToDate(value) ?? pickerStart(suggest);

  return (
    <View style={styles.field}>
      <FieldLabel>{label}</FieldLabel>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={label}
        onPress={() => setStep(step === 'closed' ? 'date' : 'closed')}
        style={[styles.input, { borderRadius: shape.radius, borderColor: error ? theme.danger : theme.border, backgroundColor: theme.backgroundElement }]}
      >
        <ThemedText themeColor={value ? 'text' : 'textSecondary'}>{value || t('common.dateTime.choose')}</ThemedText>
      </Pressable>
      {error ? <ErrorText>{error}</ErrorText> : null}
      {value && !required ? <Button compact variant="plain" title={t('common.clear')} onPress={() => onChange('')} /> : null}

      {Platform.OS === 'ios' && step !== 'closed' ? (
        <>
          <NativeDateTimePicker value={current} mode="datetime" display="inline" onValueChange={(_event, picked) => onChange(dateToField(picked))} />
          <Button variant="plain" title={t('common.confirm')} onPress={() => setStep('closed')} />
        </>
      ) : null}

      {Platform.OS === 'android' && step === 'date' ? (
        <NativeDateTimePicker
          value={current}
          mode="date"
          presentation="dialog"
          onValueChange={(_event, picked) => {
            setDay(picked);
            setStep('time');
          }}
          onDismiss={() => setStep('closed')}
        />
      ) : null}

      {Platform.OS === 'android' && step === 'time' ? (
        <NativeDateTimePicker
          value={current}
          mode="time"
          presentation="dialog"
          is24Hour
          onValueChange={(_event, picked) => {
            onChange(dateToField(combineDayAndTime(day ?? current, picked)));
            setStep('closed');
          }}
          onDismiss={() => setStep('closed')}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: Spacing.one },
  input: { borderWidth: 1, paddingHorizontal: Spacing.three, paddingVertical: Spacing.three },
});
