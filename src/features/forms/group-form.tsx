import { useState } from 'react';

import type { components } from '@/api/schema';
import { Button, ErrorText, FormGroup, TextField } from '@/components/form';
import { Segmented } from '@/components/segmented';
import { ActivityPicker } from '@/features/forms/activity-picker';
import { useI18n } from '@/i18n';
import { useFormState } from '@/lib/use-form';

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
      <FormGroup first>
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
          style={{ minHeight: 96 }}
        />
      </FormGroup>

      <FormGroup>
        <Segmented
          value={values.visibility}
          onChange={set('visibility')}
          options={[
            { value: 'public', label: t('groups.visibility.public') },
            { value: 'private', label: t('groups.visibility.private') },
          ]}
        />
      </FormGroup>

      <FormGroup>
        <ActivityPicker value={values.activityIds} onChange={set('activityIds')} error={form.errors.activity_ids} />
      </FormGroup>

      <FormGroup>
        {form.message !== undefined ? <ErrorText>{form.message || t('common.somethingWrong')}</ErrorText> : null}
        <Button title={submitLabel} loading={form.busy} onPress={() => void submit(values, form.run)} />
      </FormGroup>
    </>
  );
}
