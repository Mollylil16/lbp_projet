/**
 * Configuration i18next pour l'internationalisation
 * Support français (par défaut) et anglais
 */

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import frTranslations from './locales/fr.json'
import enTranslations from './locales/en.json'

// Configuration des ressources de traduction (mapping automatique des clés de premier niveau comme namespaces)
const resources = {
  fr: {
    ...frTranslations,
    // Compatibilité descendante si certaines clés sont encore dans le namespace par défaut
    translation: frTranslations,
  },
  en: {
    ...enTranslations,
    translation: enTranslations,
  },
}

// Configuration i18next
i18n
  // Détecter la langue du navigateur
  .use(LanguageDetector)
  // Passe l'instance i18n à react-i18next
  .use(initReactI18next)
  // Initialiser i18next
  .init({
    resources,
    fallbackLng: 'fr', // Langue par défaut
    debug: false, // Désactivé pour la clarté

    interpolation: {
      escapeValue: false, // React échappe déjà les valeurs
    },

    // Options de détection de langue
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'lbp_language',
      caches: ['localStorage'],
      cookieMinutes: 0,
    },

    // Options de réacteur
    react: {
      useSuspense: false,
    },

    // Définir les namespaces disponibles pour éviter le fallback sur 'translation'
    ns: ['common', 'colis', 'auth', 'navigation', 'caisse', 'errors', 'validation', 'format'],
    defaultNS: 'common',
  })

export default i18n
