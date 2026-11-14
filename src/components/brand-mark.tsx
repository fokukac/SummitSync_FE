import Svg, { Circle, Path, Rect } from 'react-native-svg';

/**
 * The SummitSync mark: the mountain and sun on the brand amber, the same artwork as the app icon and the website's
 * logo. Fixed colours on purpose: it is a logo, not themed UI.
 */
export function BrandMark({ size = 40 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" accessibilityLabel="SummitSync">
      <Rect width={32} height={32} rx={7} fill="#F5AB3D" />
      <Path transform="translate(4.8 4.8) scale(0.7)" fill="#0F241C" d="M1.5 27 12 8.5a1.2 1.2 0 0 1 2.1 0L18 15.4l2.4-4.1a1.2 1.2 0 0 1 2.1 0L30.5 27H1.5Z" />
      <Circle transform="translate(4.8 4.8) scale(0.7)" cx={24} cy={9} r={3} fill="#0F241C" opacity={0.65} />
      <Path transform="translate(4.8 4.8) scale(0.7)" fill="#0F241C" opacity={0.35} d="m12 13.2 3.6 6.3-2.2-1.2L12 20l-1.6-1.7-2.2 1.2 3.8-6.3Z" />
    </Svg>
  );
}
