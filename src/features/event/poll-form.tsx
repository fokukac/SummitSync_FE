import { useState } from 'react';
import { Switch, View } from 'react-native';

import { api } from '@/api/client';
import { Button, ErrorText, TextField } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { Card, Segmented } from '@/components/ui';
import { fromFieldDateTime } from '@/lib/event-values';
import { useI18n } from '@/i18n';
import { useFormState } from '@/lib/use-form';

type Visibility = 'always' | 'after_vote' | 'after_close';
const MIN_OPTIONS = 2;
const MAX_OPTIONS = 10;

/** Organizer form for a new poll. `is_anonymous` is fixed at creation (going public later would expose secret votes). */
export function PollForm({ eventId, onCreated, onCancel }: { eventId: number; onCreated: (poll: unknown) => void; onCancel: () => void }) {
  const { t } = useI18n();
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

  return (
    <Card>
      <ThemedText type="smallBold">{t('polls.create.title')}</ThemedText>
      <TextField label={t('polls.create.question')} value={title} onChangeText={setTitle} error={form.errors.title} />
      <TextField label={t('polls.create.details')} value={description} onChangeText={setDescription} error={form.errors.description} multiline />
      <ThemedText type="small">{t('polls.create.options')}</ThemedText>
      {options.map((option, index) => (
        <View key={index} style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <View style={{ flex: 1 }}>
            <TextField
              label={t('polls.create.optionN', { n: index + 1 })}
              value={option}
              onChangeText={(text) => setOptions((current) => current.map((existing, i) => (i === index ? text : existing)))}
            />
          </View>
          {options.length > MIN_OPTIONS ? (
            <Button variant="plain" title="✕" onPress={() => setOptions((current) => current.filter((_, i) => i !== index))} />
          ) : null}
        </View>
      ))}
      {optionError ? <ErrorText>{optionError}</ErrorText> : null}
      {options.length < MAX_OPTIONS ? (
        <Button variant="plain" title={t('polls.create.addOption')} onPress={() => setOptions((current) => [...current, ''])} />
      ) : null}

      <ThemedText type="small">{t('polls.create.showResults')}</ThemedText>
      <Segmented
        value={visibility}
        onChange={setVisibility}
        options={[
          { value: 'always', label: t('polls.create.vis.always') },
          { value: 'after_vote', label: t('polls.create.vis.afterVote') },
          { value: 'after_close', label: t('polls.create.vis.afterClose') },
        ]}
      />
      <ThemedText type="small" themeColor="textSecondary">
        {t('polls.create.organizersSee')}
      </ThemedText>
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
        <Switch value={anonymous} onValueChange={setAnonymous} accessibilityLabel={t('polls.create.anonymous')} />
        <View style={{ flex: 1 }}>
          <ThemedText type="smallBold">{t('polls.create.anonymous')}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {t('polls.create.anonymousHint')}
          </ThemedText>
        </View>
      </View>
      <TextField
        label={t('polls.create.closes')}
        value={closes}
        onChangeText={setCloses}
        error={form.errors.closes_at}
        placeholder="2026-11-08 06:00"
        autoCapitalize="none"
      />
      {form.message !== undefined ? <ErrorText>{form.message || t('polls.create.failed')}</ErrorText> : null}
      <Button title={t('polls.create.submit')} onPress={() => void create()} loading={form.busy} />
      <Button variant="plain" title={t('common.cancel')} onPress={onCancel} />
    </Card>
  );
}
