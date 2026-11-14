import { useWindowDimensions } from 'react-native';

/**
 * React Native has no CSS media queries; layout adapts by reading the window size (it updates on rotation, split
 * screen and browser resizes). Same size classes as Material's window size classes.
 */
export type Breakpoint = 'compact' | 'medium' | 'expanded';

const MEDIUM = 600;
const EXPANDED = 1024;

export function breakpointFor(width: number): Breakpoint {
  return width >= EXPANDED ? 'expanded' : width >= MEDIUM ? 'medium' : 'compact';
}

export function useBreakpoint(): Breakpoint {
  return breakpointFor(useWindowDimensions().width);
}

/** Widest the page content gets at each size, so lines stay readable on big screens. */
export const CONTENT_WIDTH: Record<Breakpoint, number> = { compact: 800, medium: 720, expanded: 1040 };
