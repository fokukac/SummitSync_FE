import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Platform, View } from 'react-native';

import { api, unwrap } from '@/api/client';
import { ErrorText, Screen } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { PhotoEditor } from '@/components/photo-editor';
import { QueryState } from '@/components/query-state';
import { GroupForm } from '@/features/forms/group-form';
import { useI18n } from '@/i18n';
import { goBackOr } from '@/lib/navigation';
import { useFormState } from '@/lib/use-form';

export default function EditGroupScreen() {
  const { t } = useI18n();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const queryClient = useQueryClient();
  const group = useQuery({
    queryKey: ['group', slug],
    queryFn: async () => (await unwrap(api.GET('/v1/groups/{group}', { params: { path: { group: slug } } }))).data,
  });
  const data = group.data;

  const refresh = (updated: unknown) => {
    queryClient.setQueryData(['group', slug], updated);
    void queryClient.invalidateQueries({ queryKey: ['me', 'groups'] });
  };

  return (
    <Screen form>
      <Stack.Screen options={{ title: t('groups.edit') }} />
      <QueryState query={group}>
        {data ? (
          <>
            <LogoSection slug={slug} name={data.name} logo={data.logo} onChanged={refresh} />
            <GroupForm
              initial={{
                name: data.name,
                description: data.description ?? '',
                visibility: data.visibility,
                activityIds: data.activities.map((activity) => activity.id),
              }}
              submitLabel={t('common.save')}
              submit={async (values, run) => {
                const result = await run(
                  api.PATCH('/v1/groups/{group}', {
                    params: { path: { group: slug } },
                    body: { name: values.name, description: values.description || null, visibility: values.visibility, activity_ids: values.activityIds },
                  }),
                );

                if (result?.data) {
                  refresh(result.data.data);
                  goBackOr({ pathname: '/groups/[slug]', params: { slug } });
                }
              }}
            />
          </>
        ) : null}
      </QueryState>
    </Screen>
  );
}

function LogoSection({ slug, name, logo, onChanged }: { slug: string; name: string; logo: string | null; onChanged: (group: unknown) => void }) {
  const { t } = useI18n();
  const form = useFormState();

  async function pick() {
    const picked = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9 });
    const asset = picked.canceled ? undefined : picked.assets[0];

    if (!asset) {
      return;
    }

    const body = new FormData();

    if (Platform.OS === 'web') {
      body.append('logo', await (await fetch(asset.uri)).blob(), asset.fileName ?? 'logo.jpg');
    } else {
      body.append('logo', { uri: asset.uri, name: asset.fileName ?? 'logo.jpg', type: asset.mimeType ?? 'image/jpeg' } as unknown as Blob);
    }

    const result = await form.run(api.POST('/v1/groups/{group}/logo', { params: { path: { group: slug } }, body: { logo: '' }, bodySerializer: () => body }));

    if (result?.data) {
      onChanged(result.data.data);
    }
  }

  async function remove() {
    const result = await form.run(api.DELETE('/v1/groups/{group}/logo', { params: { path: { group: slug } } }));

    if (result?.data) {
      onChanged(result.data.data);
    }
  }

  return (
    <View style={{ gap: 8 }}>
      <ThemedText type="smallBold">{t('groups.logo.label')}</ThemedText>
      <PhotoEditor
        name={name}
        uri={logo}
        busy={form.busy}
        changeLabel={t(logo ? 'groups.logo.change' : 'groups.logo.upload')}
        removeLabel={t('groups.logo.remove')}
        hint={t('groups.logo.hint')}
        error={form.errors.logo}
        onChange={() => void pick()}
        onRemove={() => void remove()}
      />
      {form.message !== undefined ? <ErrorText>{form.message || t('common.somethingWrong')}</ErrorText> : null}
    </View>
  );
}
