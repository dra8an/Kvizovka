import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

// Import types for TypeScript autocomplete
import './types'

// Import translation files
import enCommon from './locales/en/common.json'
import enGame from './locales/en/game.json'
import enDialogs from './locales/en/dialogs.json'
import enValidation from './locales/en/validation.json'

import srCommon from './locales/sr/common.json'
import srGame from './locales/sr/game.json'
import srDialogs from './locales/sr/dialogs.json'
import srValidation from './locales/sr/validation.json'

const resources = {
  en: {
    common: enCommon,
    game: enGame,
    dialogs: enDialogs,
    validation: enValidation,
  },
  sr: {
    common: srCommon,
    game: srGame,
    dialogs: srDialogs,
    validation: srValidation,
  },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: ['common', 'game', 'dialogs', 'validation'],

    interpolation: {
      escapeValue: false, // React already escapes
    },

    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'kvizovka-language',
    },

    // Enable pluralization
    pluralSeparator: '_',
  })

export default i18n
