import { useState } from 'react';

import { Button, ErrorText, TextField } from '@/components/form';
import { Segmented } from '@/components/ui';
import { ActivityPicker } from '@/features/forms/activity-picker';
import { useI18n } from '@/i18n';
import { useFormState } from '@/lib/use-form';
import type { components } from '@/api/schema';

export type GroupValues = { name: string; description: string; visibility: components['schemas']['GroupVisibility']; activityIds: number[] };

type Props = {
  initial?: GroupValues;
  submitLabel: string;
  /** Sends the request; the form shows its validation errors and busy state. */
  submit: (values: GroupValues, run: ReturnType<typeof useFormState>['run']) => Promise<void>;
};

export function GroupForm({ initial, submitLabel, submit }: Props) {
  const { t } = useI18n();
  const [values, setValues] = useState<GroupValues>(initial ?? { name: '', description: '', visibility: 'public', activityIds: [] });
  const form = useFormState();
  const set =
    <K extends keyof GroupValues>(key: K) =>
    (value: GroupValues[K]) =>
      setValues((current) => ({ ...current, [key]: value }));

  return (
    <>
      <TextField
        label={t('groups.form.name')}
        value={values.name}
        onChangeText={set('name')}
        error={form.errors.name}
        placeholder={t('groups.form.namePlaceholder')}
      />
      <TextField
        label={t('groups.form.description')}
        value={values.description}
        onChangeText={set('description')}
        error={form.errors.description}
        placeholder={t('groups.form.descriptionPlaceholder')}
        multiline
        style={{ minHeight: 88 }}
      />
      <Segmented
        value={values.visibility}
        onChange={set('visibility')}
        options={[
          { value: 'public', label: t('groups.visibility.public') },
          { value: 'private', label: t('groups.visibility.private') },
        ]}
      />
      <ActivityPicker value={values.activityIds} onChange={set('activityIds')} error={form.errors.activity_ids} />
      {form.message !== undefined ? <ErrorText>{form.message || t('common.somethingWrong')}</ErrorText> : null}
      <Button title={submitLabel} loading={form.busy} onPress={() => void submit(values, form.run)} />
    </>
  );
}
