import * as Clipboard from 'expo-clipboard';
import { Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useShape, useTheme } from '@/hooks/use-theme';

/** Codes to read or copy (a manual two-factor key, recovery codes): monospace on a quiet panel, tap to copy everything. */
export function CodeBlock({ codes, title, hint }: { codes: string[]; title?: string; hint?: string }) {
  const theme = useTheme();
  const shape = useShape();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => void Clipboard.setStringAsync(codes.join('\n'))}
      style={({ pressed }) => ({
        gap: 8,
        padding: 14,
        borderRadius: shape.radius,
        borderWidth: 1,
        borderColor: theme.border,
        backgroundColor: theme.backgroundElement,
        opacity: pressed ? 0.7 : 1,
      })}
    >
      {title ? <ThemedText type="smallBold">{title}</ThemedText> : null}
      {hint ? (
        <ThemedText type="small" themeColor="textSecondary">
          {hint}
        </ThemedText>
      ) : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 24, rowGap: 4 }}>
        {codes.map((code) => (
          <ThemedText key={code} type="code" selectable style={{ fontSize: 14, lineHeight: 22 }}>
            {code}
          </ThemedText>
        ))}
      </View>
    </Pressable>
  );
}
