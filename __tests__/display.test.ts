import { DENSITY_SCALE, FONT_SCALE, isDensity, isFontSize, scaleSize, scaleSpacing } from '@/lib/display';

describe('display settings', () => {
  it('recognises only the known values', () => {
    expect(['condensed', 'normal', 'relaxed'].every(isDensity)).toBe(true);
    expect(['small', 'medium', 'large'].every(isFontSize)).toBe(true);
    expect([isDensity('huge'), isDensity(null), isFontSize('normal'), isFontSize(undefined)]).toEqual([false, false, false, false]);
  });

  it('leaves sizes alone at the default scale', () => {
    expect(scaleSize(16, DENSITY_SCALE.normal)).toBe(16);
    expect(scaleSize(14, FONT_SCALE.medium)).toBe(14);
  });

  it('shrinks and grows sizes, rounded to half a point', () => {
    expect(scaleSize(24, DENSITY_SCALE.condensed)).toBe(20);
    expect(scaleSize(24, DENSITY_SCALE.relaxed)).toBe(27.5);
    expect(scaleSize(16, FONT_SCALE.large)).toBe(18);
    expect(scaleSize(16, FONT_SCALE.small)).toBe(14.5);
  });

  it('scales a whole spacing table and keeps its keys', () => {
    expect(scaleSpacing({ one: 4, two: 8, four: 24 }, DENSITY_SCALE.condensed)).toEqual({ one: 3.5, two: 6.5, four: 20 });
  });
});
