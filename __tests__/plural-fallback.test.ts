import { pluralForm, translate } from '@/i18n';

describe('plural forms without Intl.PluralRules (Hermes on Android)', () => {
  const original = Intl.PluralRules;

  beforeEach(() => {
    // Hermes does not define it at all: `new Intl.PluralRules()` is then "undefined cannot be used as a constructor".
    (Intl as { PluralRules?: unknown }).PluralRules = undefined;
  });

  afterEach(() => {
    (Intl as { PluralRules?: unknown }).PluralRules = original;
  });

  it('does not crash and picks English and Hungarian forms', () => {
    expect(translate('en', 'groups.membersCount', { count: 1 })).toBe('1 member');
    expect(translate('en', 'groups.membersCount', { count: 3 })).toBe('3 members');
    expect(pluralForm('hu', 1)).toBe('one');
    expect(pluralForm('hu', 5)).toBe('other');
  });

  it('follows the Romanian rules', () => {
    expect([0, 1, 2, 19, 20, 21, 101, 102, 119, 120].map((n) => pluralForm('ro', n))).toEqual([
      'few',
      'one',
      'few',
      'few',
      'other',
      'other',
      'few',
      'few',
      'few',
      'other',
    ]);
  });

  it('agrees with Intl.PluralRules where it exists', () => {
    for (const locale of ['en', 'hu', 'ro']) {
      const intl = new original({ en: 'en-GB', hu: 'hu-HU', ro: 'ro-RO' }[locale]);

      for (const n of [0, 1, 2, 5, 19, 20, 21, 100, 101, 102, 119, 120, 1000]) {
        expect(pluralForm(locale, n)).toBe(intl.select(n));
      }
    }
  });
});
