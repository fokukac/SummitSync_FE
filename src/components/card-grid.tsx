import { View } from 'react-native';
import { Children, type ReactNode } from 'react';

import { useBreakpoint } from '@/hooks/use-breakpoint';
import { useSpacing } from '@/hooks/use-spacing';

/** Lays cards out in two columns on wide screens and one column otherwise. */
export function CardGrid({ children }: { children: ReactNode }) {
  const wide = useBreakpoint() !== 'compact';
  const space = useSpacing();
  const items = Children.toArray(children);

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: space.four }}>
      {items.map((child, index) => (
        <View key={index} style={{ width: wide ? '48.5%' : '100%' }}>
          {child}
        </View>
      ))}
    </View>
  );
}
