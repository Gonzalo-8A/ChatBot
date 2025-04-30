import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Importa tus archivos de traducción
import en from './src/locales/en.json'
import es from './src/locales/es.json';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en },
    es: { translation: es },
  },
  lng: 'en', // Idioma por defecto
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
