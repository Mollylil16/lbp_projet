/**
 * Configuration i18next pour l'internationalisation
 * Support français (par défaut) et anglais
 */

import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import frTranslations from './locales/fr.json'
import enTranslations from './locales/en.json'

// Configuration des ressources de traduction
const resources = {
  fr: {
    translation: frTranslations,
  },
  en: {
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
    debug: import.meta.env.DEV, // Debug en développement uniquement

    interpolation: {
      escapeValue: false, // React échappe déjà les valeurs
    },

    // Options de détection de langue
    detection: {
      // Ordre et méthodes de détection de la langue
      order: ['localStorage', 'navigator', 'htmlTag'],
      
      // Clés de lookup (localStorage, cookie, etc.)
      lookupLocalStorage: 'lbp_language',
      
      // Cache de la langue détectée
      caches: ['localStorage'],
      
      // Ne pas utiliser de cookie
      cookieMinutes: 0,
    },

    // Options de réacteur
    react: {
      useSuspense: false, // Ne pas utiliser Suspense pour les traductions
    },

    // Configuration des namespaces (optionnel pour l'instant)
    defaultNS: 'translation',
    ns: ['translation'],
  })

export default i18n
