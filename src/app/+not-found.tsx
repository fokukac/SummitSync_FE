import { Link } from 'expo-router';

import { Screen } from '@/components/form';
import { ThemedText } from '@/components/themed-text';

export default function NotFound() {
  return (
    <Screen>
      <ThemedText type="subtitle">404</ThemedText>
      <Link href="/">
        <ThemedText type="link">Home</ThemedText>
      </Link>
    </Screen>
  );
}
