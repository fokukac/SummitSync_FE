import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';

/** Heading of a section on a settings or form page, with an optional line of explanation under it. */
export function SectionTitle({ title, description }: { title: string; description?: string }) {
  return (
    <View style={{ gap: 4 }}>
      <ThemedText type="subtitle" style={{ fontSize: 22, lineHeight: 28 }}>
        {title}
      </ThemedText>
      {description ? (
        <ThemedText type="small" themeColor="textSecondary">
          {description}
        </ThemedText>
      ) : null}
    </View>
  );
}
