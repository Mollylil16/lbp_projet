/**
 * Hook personnalisé pour les traductions
 * Wrapper autour de useTranslation de react-i18next
 */

import { useTranslation as useI18nTranslation } from 'react-i18next'

/**
 * Hook pour utiliser les traductions
 * @param namespace - Namespace optionnel pour les traductions
 */
export function useTranslation(namespace?: string) {
  const { t, i18n, ready } = useI18nTranslation(namespace)

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
    localStorage.setItem('lbp_language', lng)
  }

  const currentLanguage = i18n.language || 'fr'

  return {
    t,
    i18n,
    ready,
    changeLanguage,
    currentLanguage,
    isLoading: !ready,
  }
}
