import en from '@/i18n/locales/en';
import hu from '@/i18n/locales/hu';
import ro from '@/i18n/locales/ro';
import { translate } from '@/i18n';

describe('translate', () => {
  it('returns the message for the locale and falls back to English', () => {
    expect(translate('en', 'nav.login')).toBe('Log in');
    expect(translate('hu', 'nav.login')).not.toBe('Log in');
    expect(translate('xx', 'nav.login')).toBe('Log in');
  });

  it('passes unknown keys through unchanged', () => {
    expect(translate('en', 'My group name')).toBe('My group name');
  });

  it('keeps every catalog complete', () => {
    expect(Object.keys(hu).sort()).toEqual(Object.keys(en).sort());
    expect(Object.keys(ro).sort()).toEqual(Object.keys(en).sort());
  });
});
