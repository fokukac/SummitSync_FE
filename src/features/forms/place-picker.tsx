import { useState } from 'react';
import { View } from 'react-native';

import { api, unwrap } from '@/api/client';
import { Button, TextField } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui';
import { useI18n } from '@/i18n';

export type Place = { name: string; latitude: number | null; longitude: number | null };

/** Meeting point: a free-text name, optionally pinned to coordinates by searching a place (OpenStreetMap, through the API). */
export function PlacePicker({ value, onChange, error }: { value: Place; onChange: (place: Place) => void; error?: string }) {
  const { t } = useI18n();
  const [term, setTerm] = useState('');
  const [results, setResults] = useState<{ name: string; label: string; latitude: number; longitude: number }[]>();
  const [busy, setBusy] = useState(false);

  async function search() {
    if (term.trim().length < 3) {
      return;
    }

    setBusy(true);

    try {
      setResults((await unwrap(api.GET('/v1/places/search', { params: { query: { q: term.trim() } } }))).data);
    } catch {
      setResults([]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={{ gap: 8 }}>
      <TextField
        label={t('events.form.meetingPoint')}
        value={value.name}
        onChangeText={(name) => onChange({ ...value, name })}
        error={error}
        placeholder={t('events.form.meetingPointPlaceholder')}
      />
      <TextField label={t('events.form.searchPlace')} value={term} onChangeText={setTerm} onSubmitEditing={search} returnKeyType="search" />
      <Button variant="plain" title={t('nav.search')} onPress={() => void search()} loading={busy} />
      {results?.length === 0 ? (
        <ThemedText type="small" themeColor="textSecondary">
          {t('events.form.noPlaces')}
        </ThemedText>
      ) : null}
      {results?.map((place) => (
        <Card
          key={`${place.latitude},${place.longitude}`}
          onPress={() => {
            onChange({ name: place.name, latitude: place.latitude, longitude: place.longitude });
            setResults(undefined);
          }}
        >
          <ThemedText type="smallBold">{place.name}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
            {place.label}
          </ThemedText>
        </Card>
      ))}
      {value.latitude !== null && value.longitude !== null ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <ThemedText type="small" themeColor="textSecondary">
            {t('events.form.pinned', { coordinates: `${value.latitude.toFixed(4)}, ${value.longitude.toFixed(4)}` })}
          </ThemedText>
          <Button variant="plain" title={t('events.form.removePin')} onPress={() => onChange({ ...value, latitude: null, longitude: null })} />
        </View>
      ) : null}
    </View>
  );
}
