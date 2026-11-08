import { useQuery } from '@tanstack/react-query';
import { ActivityIndicator, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { api } from '@/api/client';
import { ErrorText } from '@/components/form';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomTabInset, Spacing } from '@/constants/theme';
import { useI18n } from '@/i18n';

/** Placeholder for phase 2 (read paths): proves the signed-in round trip with the real API. */
export default function GroupsScreen() {
  const { t } = useI18n();
  const groups = useQuery({
    queryKey: ['me', 'groups'],
    queryFn: async () => {
      const { data, error } = await api.GET('/v1/me/groups');

      if (!data) {
        throw error ?? new Error('Failed to load groups');
      }

      return data.data;
    },
  });

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex}>
        <ThemedText type="subtitle" style={styles.title}>
          {t('nav.groups')}
        </ThemedText>
        {groups.isPending ? <ActivityIndicator /> : null}
        {groups.isError ? <ErrorText>{t('common.somethingWrong')}</ErrorText> : null}
        <FlatList
          data={groups.data}
          keyExtractor={(group) => group.slug}
          contentContainerStyle={styles.list}
          onRefresh={() => void groups.refetch()}
          refreshing={groups.isRefetching}
          renderItem={({ item }) => (
            <ThemedView type="backgroundElement" style={styles.card}>
              <ThemedText type="smallBold">{item.name}</ThemedText>
              {item.description ? <ThemedText type="small" themeColor="textSecondary" numberOfLines={2}>{item.description}</ThemedText> : null}
            </ThemedView>
          )}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  title: { paddingHorizontal: Spacing.four, paddingTop: Spacing.three },
  list: { padding: Spacing.four, paddingBottom: BottomTabInset + Spacing.four, gap: Spacing.three },
  card: { padding: Spacing.three, borderRadius: Spacing.three, gap: Spacing.one },
});
