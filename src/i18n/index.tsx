import AsyncStorage from '@react-native-async-storage/async-storage';
import { getLocales } from 'expo-localization';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import en from '@/i18n/locales/en';
import hu from '@/i18n/locales/hu';
import ro from '@/i18n/locales/ro';

/**
 * Same message format as the website (`resources/js/i18n` in SummitSync_BE): `en` defines `MessageKey`, other
 * catalogs are typed `Catalog` (tsc fails when a key is missing), a message is a string or plural forms picked
 * with `Intl.PluralRules` from the `count` param. The catalogs under `locales/` are copied from the backend by
 * `npm run sync:backend` - never edit them here.
 */
export type PluralForms = Partial<Record<'zero' | 'one' | 'two' | 'few' | 'many', string>> & { other: string };
export type Message = string | PluralForms;
export type MessageKey = keyof typeof en;
export type Catalog = Record<MessageKey, Message>;
export type MessageParams = Record<string, string | number>;

const catalogs: Record<string, Catalog> = { en, hu, ro };
export const supportedLocales: Record<string, string> = { en: 'English', hu: 'Magyar', ro: 'Română' };
const intlLocales: Record<string, string> = { en: 'en-GB', hu: 'hu-HU', ro: 'ro-RO' };
const STORAGE_KEY = 'summitsync.locale';

function interpolate(template: string, params?: MessageParams): string {
  if (!params) {
    return template;
  }

  return template.replace(/\{(\w+)\}/g, (match, name: string) => (name in params ? String(params[name]) : match));
}

function pick(message: Message, locale: string, params?: MessageParams): string {
  if (typeof message === 'string') {
    return message;
  }

  const form = new Intl.PluralRules(intlLocales[locale] ?? locale).select(Number(params?.count ?? 0));

  return message[form] ?? message.other;
}

/** Unknown keys come back unchanged, so text that is not a catalog key passes through safely. */
export function translate(locale: string, key: string, params?: MessageParams): string {
  const message = catalogs[locale]?.[key as MessageKey] ?? en[key as MessageKey];

  return message === undefined ? key : interpolate(pick(message, locale, params), params);
}

export function toIntlLocale(locale: string): string {
  return intlLocales[locale] ?? locale;
}

/** The device language when the app supports it, otherwise English. */
export function deviceLocale(): string {
  const code = getLocales()[0]?.languageCode ?? 'en';

  return code in catalogs ? code : 'en';
}

type I18n = {
  locale: string;
  intlLocale: string;
  setLocale: (locale: string) => void;
  t: (key: MessageKey | (string & {}), params?: MessageParams) => string;
};

const I18nContext = createContext<I18n | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState(deviceLocale);

  useEffect(() => {
    void AsyncStorage.getItem(STORAGE_KEY).then((saved) => {
      if (saved && saved in catalogs) {
        setLocaleState(saved);
      }
    });
  }, []);

  const setLocale = useCallback((next: string) => {
    if (next in catalogs) {
      setLocaleState(next);
      void AsyncStorage.setItem(STORAGE_KEY, next);
    }
  }, []);

  const value = useMemo<I18n>(
    () => ({
      locale,
      intlLocale: toIntlLocale(locale),
      setLocale,
      t: (key, params) => translate(locale, key, params),
    }),
    [locale, setLocale],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  const context = useContext(I18nContext);

  if (context === null) {
    throw new Error('useI18n must be used inside <I18nProvider>');
  }

  return context;
}
