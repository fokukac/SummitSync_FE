/** Mirrors the server's limit on `activities[]`. */
export const MAX_ACTIVITY_FILTER = 30;

/** Toggle a key in the selection: add it when absent, remove it when present. */
export function toggleActivityKey(selected: string[], key: string): string[] {
  if (selected.includes(key)) {
    return selected.filter((existing) => existing !== key);
  }

  return selected.length < MAX_ACTIVITY_FILTER ? [...selected, key] : selected;
}

/** A group matches when it has at least one selected activity (any-of, like the server); no selection matches all. */
export function matchesActivities(group: { activities: { key: string }[] }, selected: string[]): boolean {
  return selected.length === 0 || group.activities.some((activity) => selected.includes(activity.key));
}
