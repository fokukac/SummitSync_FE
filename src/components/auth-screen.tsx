import type { ReactNode } from 'react';
import { View } from 'react-native';

import { BrandMark } from '@/components/brand-mark';
import { Screen } from '@/components/form';
import { ThemedText } from '@/components/themed-text';

/**
 * The frame of every signed-out page (sign in, register, two-factor, email verification, invitations): the brand
 * lockup, a title with its explanation, then the page's own content.
 */
export function AuthScreen({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        <BrandMark size={40} />
        <ThemedText type="subtitle" style={{ fontSize: 22, lineHeight: 28 }}>
          SummitSync
        </ThemedText>
      </View>
      <View style={{ gap: 6 }}>
        <ThemedText type="subtitle" style={{ fontSize: 30, lineHeight: 36 }}>
          {title}
        </ThemedText>
        {description ? <ThemedText themeColor="textSecondary">{description}</ThemedText> : null}
      </View>
      {children}
    </Screen>
  );
}
