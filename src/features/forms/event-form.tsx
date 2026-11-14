import { useState } from 'react';

import { DateTimeField } from '@/components/date-time-field';
import { Button, ErrorText, FieldLabel, FormGroup, TextField } from '@/components/form';
import { Segmented } from '@/components/segmented';
import { ThemedText } from '@/components/themed-text';
import { ActivityPicker } from '@/features/forms/activity-picker';
import { PlacePicker } from '@/features/forms/place-picker';
import { useI18n } from '@/i18n';
import { deviceTimezone, type EventValues } from '@/lib/event-values';
import { useFormState } from '@/lib/use-form';

type Props = {
  initial?: EventValues;
  statusOptions: string[];
  submitLabel: string;
  submit: (values: EventValues, run: ReturnType<typeof useFormState>['run']) => Promise<void>;
};

export function EventForm({ initial, statusOptions, submitLabel, submit }: Props) {
  const { t } = useI18n();
  const [values, setValues] = useState<EventValues>(
    initial ?? {
      title: '',
      description: '',
      startsAt: '',
      endsAt: '',
      timezone: deviceTimezone(),
      place: { name: '', latitude: null, longitude: null },
      status: 'draft',
      activityIds: [],
    },
  );
  const form = useFormState();
  const set =
    <K extends keyof EventValues>(key: K) =>
    (value: EventValues[K]) =>
      setValues((current) => ({ ...current, [key]: value }));

  return (
    <>
      <FormGroup first>
        <TextField
          label={t('events.form.title')}
          value={values.title}
          onChangeText={set('title')}
          error={form.errors.title}
          placeholder={t('events.form.titlePlaceholder')}
        />
        <TextField
          label={t('events.form.description')}
          value={values.description}
          onChangeText={set('description')}
          error={form.errors.description}
          placeholder={t('events.form.descriptionPlaceholder')}
          multiline
          style={{ minHeight: 96 }}
        />
      </FormGroup>

      <FormGroup>
        <DateTimeField label={t('events.form.starts')} value={values.startsAt} onChange={set('startsAt')} error={form.errors.starts_at} required />
        <DateTimeField label={t('events.form.ends')} value={values.endsAt} onChange={set('endsAt')} error={form.errors.ends_at} suggest={values.startsAt} />
        <TextField
          label={t('events.form.timezone')}
          value={values.timezone}
          onChangeText={set('timezone')}
          error={form.errors.timezone}
          autoCapitalize="none"
        />
        <ThemedText type="small" themeColor="textSecondary">
          {t('events.form.timezoneHint')}
        </ThemedText>
      </FormGroup>

      <FormGroup>
        <PlacePicker value={values.place} onChange={set('place')} error={form.errors.location_name ?? form.errors.latitude} />
      </FormGroup>

      <FormGroup>
        <ActivityPicker value={values.activityIds} onChange={set('activityIds')} error={form.errors.activity_ids} />
      </FormGroup>

      <FormGroup>
        <FieldLabel>{t('events.form.status')}</FieldLabel>
        <Segmented
          value={values.status}
          onChange={set('status')}
          options={statusOptions.map((status) => ({
            value: status,
            label: t(`events.status.${status}`),
          }))}
        />
        {form.errors.status ? <ErrorText>{form.errors.status}</ErrorText> : null}
      </FormGroup>

      <FormGroup>
        {form.message !== undefined ? <ErrorText>{form.message || t('common.somethingWrong')}</ErrorText> : null}
        <Button title={submitLabel} loading={form.busy} onPress={() => void submit(values, form.run)} />
      </FormGroup>
    </>
  );
}
