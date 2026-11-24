import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import hi from './locales/hi.json';
import mr from './locales/mr.json';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', nativeName: 'English' },
  { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'mr', label: 'Marathi', nativeName: 'मराठी' },
] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number]['code'];

const getSavedLanguage = (): SupportedLanguage => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('manganex_language') as SupportedLanguage;
    if (saved && ['en', 'hi', 'mr'].includes(saved)) {
      return saved;
    }
  }
  return 'en';
};

const initialLang = getSavedLanguage();

if (typeof document !== 'undefined') {
  document.documentElement.lang = initialLang;
}

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      mr: { translation: mr },
    },
    lng: initialLang,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

export const setAppLanguage = (lng: SupportedLanguage) => {
  i18n.changeLanguage(lng);
  if (typeof window !== 'undefined') {
    localStorage.setItem('manganex_language', lng);
    document.documentElement.lang = lng;
  }
};

export default i18n;
