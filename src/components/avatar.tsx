import { StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';

import { API_URL } from '@/api/client';
import { ThemedText } from '@/components/themed-text';
import { initials } from '@/lib/format';
import { resolveMediaUrl } from '@/lib/media';
import { useShape, useTheme } from '@/hooks/use-theme';

/** Image when the server has one, initials otherwise. Round or softly squared, depending on the theme. */
export function Avatar({ name, uri, size = 36 }: { name: string; uri?: string | null; size?: number }) {
  const theme = useTheme();
  const shape = useShape();
  const radius = shape.avatar === 'round' ? size / 2 : Math.min(shape.radius, size / 4);

  return uri ? (
    <Image source={{ uri: resolveMediaUrl(uri, API_URL) }} accessibilityLabel={name} style={{ width: size, height: size, borderRadius: radius }} />
  ) : (
    <View style={[styles.avatar, { width: size, height: size, borderRadius: radius, backgroundColor: theme.backgroundSelected }]}>
      <ThemedText type="smallBold" style={{ fontSize: size / 2.8, lineHeight: size / 2.2 }}>
        {initials(name)}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  avatar: { alignItems: 'center', justifyContent: 'center' },
});
