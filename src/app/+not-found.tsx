import { router } from 'expo-router';

import { EmptyState } from '@/components/empty-state';
import { Screen } from '@/components/form';
import { useI18n } from '@/i18n';

/** A link that leads nowhere (a mistyped address, an old deep link). */
export default function NotFound() {
  const { t } = useI18n();

  return (
    <Screen>
      <EmptyState icon="alert" tone="danger" text={t('common.notFound')} action={{ title: t('nav.home'), onPress: () => router.replace('/') }} />
    </Screen>
  );
}
