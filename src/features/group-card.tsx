import { router } from 'expo-router';
import { View } from 'react-native';

import type { components } from '@/api/schema';
import { ThemedText } from '@/components/themed-text';
import { Avatar, Card, ActivityTags } from '@/components/ui';
import { useI18n } from '@/i18n';

export type GroupSummary = components['schemas']['GroupSummaryResource'];

/** A group in a list: logo, name, size, description and activities; opens the group page. */
export function GroupCard({ group }: { group: GroupSummary }) {
  const { t } = useI18n();

  return (
    <Card onPress={() => router.push({ pathname: '/groups/[slug]', params: { slug: group.slug } })}>
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
        <Avatar name={group.name} uri={group.logo} size={44} />
        <View style={{ flex: 1 }}>
          <ThemedText type="smallBold">{group.name}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {t('groups.membersCount', { count: group.members_count })}
            {group.visibility === 'private' ? ` · ${t('common.private')}` : ''}
          </ThemedText>
        </View>
      </View>
      {group.description ? (
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>
          {group.description}
        </ThemedText>
      ) : null}
      {group.activities.length > 0 ? <ActivityTags activities={group.activities} /> : null}
    </Card>
  );
}
