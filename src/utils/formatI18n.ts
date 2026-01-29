/**
 * Utilitaires de formatage localisés avec i18n
 * Format de date/devise selon la langue sélectionnée
 */

import { format, parseISO } from 'date-fns'
import { fr, enUS } from 'date-fns/locale'
import { APP_CONFIG } from '@constants/application'

// Mapping des langues i18next vers les locales date-fns
const dateLocales: Record<string, Locale> = {
  fr,
  en: enUS,
}

/**
 * Formate une date selon la langue actuelle
 */
export function formatDateLocalized(
  date: string | Date | null | undefined,
  locale: string = 'fr'
): string {
  if (!date) return '-'

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    const dateLocale = dateLocales[locale] || fr
    return format(dateObj, APP_CONFIG.dateFormat, { locale: dateLocale })
  } catch {
    return '-'
  }
}

/**
 * Formate une date avec heure selon la langue actuelle
 */
export function formatDateTimeLocalized(
  date: string | Date | null | undefined,
  locale: string = 'fr'
): string {
  if (!date) return '-'

  try {
    const dateObj = typeof date === 'string' ? parseISO(date) : date
    const dateLocale = dateLocales[locale] || fr
    return format(dateObj, APP_CONFIG.dateTimeFormat, { locale: dateLocale })
  } catch {
    return '-'
  }
}

/**
 * Formate un montant selon la locale
 */
export function formatMontantLocalized(
  montant: number | string | null | undefined,
  locale: string = 'fr'
): string {
  if (montant === null || montant === undefined) return '0'

  const num = typeof montant === 'string' ? parseFloat(montant) : montant

  if (isNaN(num)) return '0'

  // Format selon la locale (fr-FR ou en-US)
  const localeCode = locale === 'fr' ? 'fr-FR' : 'en-US'

  return new Intl.NumberFormat(localeCode, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num)
}

/**
 * Formate un montant avec devise selon la langue
 */
export function formatMontantWithDeviseLocalized(
  montant: number | string | null | undefined,
  locale: string = 'fr'
): string {
  const formatted = formatMontantLocalized(montant, locale)
  // Pour l'instant, on garde FCFA partout, mais on pourrait avoir des traductions
  return `${formatted} FCFA`
}
