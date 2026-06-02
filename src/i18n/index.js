import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import azTranslation from './az.json';
import enTranslation from './en.json';

const resources = {
  az: {
    translation: azTranslation
  },
  en: {
    translation: enTranslation
  }
};

const savedLanguage = localStorage.getItem('portfolio_lang') || 'az';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // React already escapes values
    }
  });

export default i18n;
