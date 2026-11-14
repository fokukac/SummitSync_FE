import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { Linking, Pressable, View } from 'react-native';

import { API_URL, api, unwrap } from '@/api/client';
import { QueryState } from '@/components/query-state';
import { ThemedText } from '@/components/themed-text';
import { useShape, useTheme } from '@/hooks/use-theme';
import { useI18n } from '@/i18n';
import { formatPrice, isWebUrl } from '@/lib/format';
import { resolveMediaUrl } from '@/lib/media';

const TILE = 60;

/**
 * Partner-shop products for one checklist item, as a ruled strip under the item. Links are affiliate links, so the
 * disclosure always goes with them.
 */
export function ChecklistSuggestions({ eventId, itemId }: { eventId: number; itemId: number }) {
  const { t, intlLocale } = useI18n();
  const theme = useTheme();
  const shape = useShape();

  const suggestions = useQuery({
    queryKey: ['event', eventId, 'checklist', itemId, 'suggestions'],
    retry: false,
    queryFn: async () =>
      (await unwrap(api.GET('/v1/events/{event}/checklist/{checklistItem}/suggestions', { params: { path: { event: eventId, checklistItem: itemId } } }))).data,
  });

  const products = suggestions.data ?? [];

  return (
    <QueryState query={suggestions} empty={products.length === 0} emptyText={t('checklist.suggestions.none')} emptyIcon="bag" compact>
      <View style={{ gap: 4, borderLeftWidth: 3, borderLeftColor: theme.primary, paddingLeft: 14, marginBottom: 8 }}>
        {products.map((product) => {
          const link = isWebUrl(product.url);
          const price = formatPrice(product.price, product.currency, intlLocale);

          return (
            <Pressable
              key={product.id}
              accessibilityRole={link ? 'link' : undefined}
              disabled={!link}
              onPress={() => void Linking.openURL(product.url)}
              style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8, opacity: pressed ? 0.7 : 1 })}
            >
              <View
                style={{
                  width: TILE,
                  height: TILE,
                  borderRadius: shape.radius,
                  backgroundColor: '#FFFFFF',
                  borderWidth: 1,
                  borderColor: theme.border,
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                {product.image ? (
                  <Image
                    source={{ uri: resolveMediaUrl(product.image, API_URL) }}
                    accessibilityLabel={product.name}
                    contentFit="contain"
                    style={{ width: TILE - 8, height: TILE - 8 }}
                  />
                ) : null}
              </View>
              <View style={{ flex: 1, gap: 1 }}>
                <ThemedText type="smallBold" numberOfLines={2}>
                  {product.name}
                </ThemedText>
                <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
                  {[product.brand, product.shop].filter(Boolean).join(' · ')}
                </ThemedText>
              </View>
              {price ? (
                <ThemedText type="smallBold" style={{ color: theme.primary }}>
                  {price}
                </ThemedText>
              ) : null}
            </Pressable>
          );
        })}
        <ThemedText type="small" themeColor="textSecondary" style={{ fontSize: 12, lineHeight: 16, marginTop: 4 }}>
          {t('checklist.suggestions.disclosure')}
        </ThemedText>
      </View>
    </QueryState>
  );
}
