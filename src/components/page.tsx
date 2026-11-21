import { createContext, type ReactElement, type ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { type HostInstance, Keyboard, Platform, ScrollView, type ScrollViewInstance, StyleSheet, View, type RefreshControlProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { OfflineBanner } from '@/components/offline-banner';
import { ThemedView } from '@/components/themed-view';
import { CONTENT_WIDTH, useBreakpoint } from '@/hooks/use-breakpoint';
import { useSpacing } from '@/hooks/use-spacing';

/** The keyboard takes a moment to slide up and shrink the screen: measure only after it has settled. */
const KEYBOARD_SETTLE_MS = 350;

type PageScroll = { scrollIntoView: (target: HostInstance | null) => void };

const PageScrollContext = createContext<PageScroll | null>(null);

/**
 * Brings a view (a text field and its buttons) fully into sight once the keyboard is up. The keyboard covers the lower
 * part of the page without scrolling it, so a field low on the page would stay hidden behind the keyboard.
 * Does nothing outside a `Page`.
 */
export function useScrollIntoView(): PageScroll['scrollIntoView'] {
  return useContext(PageScrollContext)?.scrollIntoView ?? noop;
}

function noop() {}

/**
 * How much of the screen the keyboard covers (Android only: it is drawn over the page). The page adds that much room
 * at its end, otherwise a field near the bottom could never be scrolled up above the keyboard.
 */
function useKeyboardHeight(): number {
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      return;
    }

    const shown = Keyboard.addListener('keyboardDidShow', (event) => setHeight(event.endCoordinates.height));
    const hidden = Keyboard.addListener('keyboardDidHide', () => setHeight(0));

    return () => {
      shown.remove();
      hidden.remove();
    };
  }, []);

  return height;
}

/** Scrollable content page inside the tabs: centered column with room for the tab bar. */
export function Page({
  children,
  refreshControl,
  underHeader = false,
}: {
  children: ReactNode;
  refreshControl?: ReactElement<RefreshControlProps>;
  /** The screen has a navigation header, which already clears the status bar: leave out the top inset (it showed as a tall empty band). */
  underHeader?: boolean;
}) {
  const breakpoint = useBreakpoint();
  const space = useSpacing();
  const scroller = useRef<ScrollViewInstance>(null);
  const offset = useRef(0);
  const keyboardHeight = useKeyboardHeight();
  const margin = space.three;

  const scrollIntoView = useCallback(
    (target: HostInstance | null) => {
      setTimeout(() => {
        // On Android the keyboard is drawn over the page (the page keeps its size), so what is hidden is whatever lies below the keyboard's top edge.
        const keyboardTop = Keyboard.metrics()?.screenY;

        if (!target || keyboardTop === undefined) {
          return;
        }

        target.measureInWindow((_x, y, _width, height) => {
          const hidden = y + height + margin - keyboardTop;

          if (hidden > 0) {
            scroller.current?.scrollTo({ y: offset.current + hidden, animated: true });
          }
        });
      }, KEYBOARD_SETTLE_MS);
    },
    [margin],
  );

  const scroll = useMemo(() => ({ scrollIntoView }), [scrollIntoView]);

  return (
    <ThemedView style={styles.flex}>
      <SafeAreaView style={styles.flex} edges={underHeader ? ['left', 'right'] : ['top', 'left', 'right']}>
        <PageScrollContext.Provider value={scroll}>
          <ScrollView
            ref={scroller}
            refreshControl={refreshControl}
            // Without this the first tap on a button while the keyboard is open only closes the keyboard (an Add or Send that needs two taps).
            keyboardShouldPersistTaps="handled"
            scrollEventThrottle={16}
            onScroll={(event) => (offset.current = event.nativeEvent.contentOffset.y)}
            contentContainerStyle={[
              breakpoint === 'expanded' ? { paddingVertical: space.five, paddingHorizontal: space.five } : { padding: space.four },
              { paddingBottom: (breakpoint === 'expanded' ? space.five : space.four) + keyboardHeight },
            ]}
          >
            <View style={[styles.column, { maxWidth: CONTENT_WIDTH[breakpoint], gap: space.three }]}>
              <OfflineBanner />
              {children}
            </View>
          </ScrollView>
        </PageScrollContext.Provider>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  column: { width: '100%', alignSelf: 'center' },
});
