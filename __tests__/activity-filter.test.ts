import { matchesActivities, toggleActivityKey } from '@/lib/activity-filter';

describe('toggleActivityKey', () => {
  it('selects an unselected activity and unselects a selected one', () => {
    expect(toggleActivityKey([], 'hiking')).toEqual(['hiking']);
    expect(toggleActivityKey(['hiking'], 'mtb')).toEqual(['hiking', 'mtb']);
    expect(toggleActivityKey(['hiking', 'mtb'], 'hiking')).toEqual(['mtb']);
  });

  it('does not select beyond the limit but still allows unselecting', () => {
    const full = Array.from({ length: 30 }, (_, index) => `a${index}`);

    expect(toggleActivityKey(full, 'extra')).toEqual(full);
    expect(toggleActivityKey(full, 'a0')).toHaveLength(29);
  });
});

describe('matchesActivities', () => {
  const group = { activities: [{ key: 'hiking' }, { key: 'mtb' }] };

  it('matches everything without a selection', () => {
    expect(matchesActivities(group, [])).toBe(true);
    expect(matchesActivities({ activities: [] }, [])).toBe(true);
  });

  it('matches when any selected activity is on the group', () => {
    expect(matchesActivities(group, ['mtb', 'skiing'])).toBe(true);
    expect(matchesActivities(group, ['skiing'])).toBe(false);
    expect(matchesActivities({ activities: [] }, ['mtb'])).toBe(false);
  });
});
