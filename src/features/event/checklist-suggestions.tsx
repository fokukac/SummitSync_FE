import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Linking, View } from 'react-native';

import { API_URL, api, unwrap } from '@/api/client';
import { ThemedText } from '@/components/themed-text';
import { Card, QueryState } from '@/components/ui';
import { useI18n } from '@/i18n';
import { formatPrice, isWebUrl } from '@/lib/format';
import { resolveMediaUrl } from '@/lib/media';

/** Partner-shop products for one checklist item. Links are affiliate links, so the disclosure always goes with them. */
export function ChecklistSuggestions({ eventId, itemId }: { eventId: number; itemId: number }) {
  const { t, intlLocale } = useI18n();

  const suggestions = useQuery({
    queryKey: ['event', eventId, 'checklist', itemId, 'suggestions'],
    retry: false,
    queryFn: async () =>
      (await unwrap(api.GET('/v1/events/{event}/checklist/{checklistItem}/suggestions', { params: { path: { event: eventId, checklistItem: itemId } } }))).data,
  });

  const products = suggestions.data ?? [];

  return (
    <QueryState query={suggestions} empty={products.length === 0} emptyText={t('checklist.suggestions.none')}>
      <View style={{ gap: 8 }}>
        {products.map((product) => (
          <Card key={product.id} onPress={isWebUrl(product.url) ? () => void Linking.openURL(product.url) : undefined}>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              {product.image ? (
                <Image
                  source={{ uri: resolveMediaUrl(product.image, API_URL) }}
                  accessibilityLabel={product.name}
                  contentFit="contain"
                  style={{ width: 56, height: 56 }}
                />
              ) : null}
              <View style={{ flex: 1 }}>
                <ThemedText type="smallBold" numberOfLines={2}>
                  {product.name}
                </ThemedText>
                {product.brand ? (
                  <ThemedText type="small" themeColor="textSecondary">
                    {product.brand}
                  </ThemedText>
                ) : null}
                <ThemedText type="small" themeColor="textSecondary">
                  {[formatPrice(product.price, product.currency, intlLocale), product.shop].filter(Boolean).join(' · ')}
                </ThemedText>
              </View>
            </View>
          </Card>
        ))}
        <ThemedText type="small" themeColor="textSecondary">
          {t('checklist.suggestions.disclosure')}
        </ThemedText>
      </View>
    </QueryState>
  );
}
