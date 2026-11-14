import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { api } from '@/api/client';
import { Checkbox } from '@/components/checkbox';
import { DateTimeField } from '@/components/date-time-field';
import { Button, ErrorText, FieldLabel, FormGroup, TextField } from '@/components/form';
import { SectionTitle } from '@/components/section-title';
import { Segmented } from '@/components/segmented';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n';
import { fromFieldDateTime } from '@/lib/event-values';
import { useFormState } from '@/lib/use-form';

type Visibility = 'always' | 'after_vote' | 'after_close';
const MIN_OPTIONS = 2;
const MAX_OPTIONS = 10;

/** Organizer form for a new poll. `is_anonymous` is fixed at creation (going public later would expose secret votes). */
export function PollForm({ eventId, onCreated, onCancel }: { eventId: number; onCreated: (poll: unknown) => void; onCancel: () => void }) {
  const { t } = useI18n();
  const theme = useTheme();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [visibility, setVisibility] = useState<Visibility>('after_vote');
  const [anonymous, setAnonymous] = useState(false);
  const [closes, setCloses] = useState('');
  const form = useFormState();

  async function create() {
    const result = await form.run(
      api.POST('/v1/events/{event}/polls', {
        params: { path: { event: eventId } },
        body: {
          title,
          description: description || null,
          visibility,
          is_anonymous: anonymous,
          closes_at: fromFieldDateTime(closes),
          options: options.map((option) => option.trim()).filter(Boolean),
        },
      }),
    );

    if (result?.data) {
      onCreated(result.data);
    }
  }

  const optionError = form.errors.options ?? Object.entries(form.errors).find(([key]) => key.startsWith('options.'))?.[1];
  const canRemove = options.length > MIN_OPTIONS;

  return (
    <View style={{ gap: 20, paddingTop: 4, paddingBottom: 8 }}>
      <SectionTitle title={t('polls.create.title')} description={t('polls.create.description')} />

      <FormGroup first>
        <TextField label={t('polls.create.question')} value={title} onChangeText={setTitle} error={form.errors.title} maxLength={150} />
        <TextField label={t('polls.create.details')} value={description} onChangeText={setDescription} error={form.errors.description} maxLength={1000} />
      </FormGroup>

      <FormGroup>
        <FieldLabel>{t('polls.create.options')}</FieldLabel>
        {options.map((option, index) => (
          <TextField
            key={index}
            hideLabel
            label={t('polls.create.optionN', { n: index + 1 })}
            placeholder={t('polls.create.optionN', { n: index + 1 })}
            value={option}
            maxLength={100}
            onChangeText={(text) => setOptions((current) => current.map((existing, i) => (i === index ? text : existing)))}
            // The remove button sits inside the field's right end, greyed out while only the minimum is left.
            action={
              canRemove
                ? { icon: 'close', label: t('polls.create.removeOption'), onPress: () => setOptions((current) => current.filter((_, i) => i !== index)) }
                : undefined
            }
          />
        ))}
        {optionError ? <ErrorText>{optionError}</ErrorText> : null}
        {options.length < MAX_OPTIONS ? (
          <Button compact variant="outline" icon="plus" title={t('polls.create.addOption')} onPress={() => setOptions((current) => [...current, ''])} />
        ) : null}
      </FormGroup>

      <FormGroup>
        <FieldLabel>{t('polls.create.showResults')}</FieldLabel>
        <Segmented
          value={visibility}
          onChange={setVisibility}
          options={[
            { value: 'always', label: t('polls.create.vis.always') },
            { value: 'after_vote', label: t('polls.create.vis.afterVote') },
            { value: 'after_close', label: t('polls.create.vis.afterClose') },
          ]}
        />
        <ThemedText type="small" themeColor="textSecondary" style={{ fontSize: 12 }}>
          {t('polls.create.organizersSee')}
        </ThemedText>
        {form.errors.visibility ? <ErrorText>{form.errors.visibility}</ErrorText> : null}

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: anonymous }}
          accessibilityLabel={t('polls.create.anonymous')}
          onPress={() => setAnonymous((current) => !current)}
          style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12, paddingTop: 4 }}
        >
          <Checkbox checked={anonymous} size={22} />
          <View style={{ flex: 1, gap: 2 }}>
            <ThemedText type="smallBold" style={{ color: theme.text }}>
              {t('polls.create.anonymous')}
            </ThemedText>
            <ThemedText type="small" themeColor="textSecondary" style={{ fontSize: 12 }}>
              {t('polls.create.anonymousHint')}
            </ThemedText>
          </View>
        </Pressable>
        {form.errors.is_anonymous ? <ErrorText>{form.errors.is_anonymous}</ErrorText> : null}
      </FormGroup>

      <FormGroup>
        <DateTimeField label={t('polls.create.closes')} value={closes} onChange={setCloses} error={form.errors.closes_at} />
      </FormGroup>

      <FormGroup>
        {form.message !== undefined ? <ErrorText>{form.message || t('polls.create.failed')}</ErrorText> : null}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Button compact title={t('polls.create.submit')} onPress={() => void create()} loading={form.busy} />
          <Button compact variant="plain" title={t('common.cancel')} onPress={onCancel} />
        </View>
      </FormGroup>
    </View>
  );
}
