import { useState } from 'react';

import { Button, ErrorText, TextField } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { Segmented } from '@/components/ui';
import { ActivityPicker } from '@/features/forms/activity-picker';
import { PlacePicker } from '@/features/forms/place-picker';
import { deviceTimezone, type EventValues } from '@/lib/event-values';
import { useI18n } from '@/i18n';
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
        style={{ minHeight: 88 }}
      />
      <TextField
        label={t('events.form.starts')}
        value={values.startsAt}
        onChangeText={set('startsAt')}
        error={form.errors.starts_at}
        placeholder="2026-11-08 07:00"
        autoCapitalize="none"
      />
      <TextField
        label={t('events.form.ends')}
        value={values.endsAt}
        onChangeText={set('endsAt')}
        error={form.errors.ends_at}
        placeholder="2026-11-08 12:00"
        autoCapitalize="none"
      />
      <ThemedText type="small" themeColor="textSecondary">
        {t('events.form.dateHint')}
      </ThemedText>
      <TextField label={t('events.form.timezone')} value={values.timezone} onChangeText={set('timezone')} error={form.errors.timezone} autoCapitalize="none" />
      <ThemedText type="small" themeColor="textSecondary">
        {t('events.form.timezoneHint')}
      </ThemedText>
      <PlacePicker value={values.place} onChange={set('place')} error={form.errors.location_name ?? form.errors.latitude} />
      <ActivityPicker value={values.activityIds} onChange={set('activityIds')} error={form.errors.activity_ids} />
      <ThemedText type="small">{t('events.form.status')}</ThemedText>
      <Segmented
        value={values.status}
        onChange={set('status')}
        options={statusOptions.map((status) => ({
          value: status,
          label: t(`events.status.${status}`),
        }))}
      />
      {form.errors.status ? <ErrorText>{form.errors.status}</ErrorText> : null}
      {form.message !== undefined ? <ErrorText>{form.message || t('common.somethingWrong')}</ErrorText> : null}
      <Button title={submitLabel} loading={form.busy} onPress={() => void submit(values, form.run)} />
    </>
  );
}
