/**
 * Hook pour sauvegarder et restaurer les filtres dans localStorage
 * Permet de conserver les filtres entre les sessions
 */

import { useState, useEffect, useCallback } from 'react'
import { persistentCache } from '@utils/cachePersistent'

interface UseLocalStorageFiltersOptions<T> {
  key: string
  defaultFilters?: T
  debounceMs?: number
}

/**
 * Hook pour gérer les filtres avec sauvegarde automatique
 */
export function useLocalStorageFilters<T extends Record<string, any>>(
  options: UseLocalStorageFiltersOptions<T>
) {
  const { key, defaultFilters = {} as T, debounceMs = 500 } = options
  const storageKey = `lbp_filters_${key}`

  // État initial : charger depuis localStorage ou utiliser les valeurs par défaut
  const [filters, setFilters] = useState<T>(defaultFilters)

  // Charger les filtres sauvegardés au montage
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const saved = await persistentCache.getPreference<T>(storageKey)
        if (saved) {
          setFilters({ ...defaultFilters, ...saved })
        }
      } catch (error) {
        console.warn('Failed to load filters from cache:', error)
        // Fallback vers localStorage
        try {
          const saved = localStorage.getItem(storageKey)
          if (saved) {
            setFilters({ ...defaultFilters, ...JSON.parse(saved) })
          }
        } catch (e) {
          console.warn('Failed to load filters from localStorage:', e)
        }
      }
    }

    loadFilters()
  }, [storageKey]) // eslint-disable-line react-hooks/exhaustive-deps

  // Sauvegarder les filtres avec debounce
  useEffect(() => {
    if (Object.keys(filters).length === 0) return

    const timer = setTimeout(async () => {
      try {
        await persistentCache.savePreference(storageKey, filters)
      } catch (error) {
        console.warn('Failed to save filters to cache:', error)
        // Fallback vers localStorage
        try {
          localStorage.setItem(storageKey, JSON.stringify(filters))
        } catch (e) {
          console.warn('Failed to save filters to localStorage:', e)
        }
      }
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [filters, storageKey, debounceMs])

  // Fonction pour mettre à jour un filtre
  const updateFilter = useCallback(<K extends keyof T>(filterKey: K, value: T[K]) => {
    setFilters((prev) => ({
      ...prev,
      [filterKey]: value,
    }))
  }, [])

  // Fonction pour mettre à jour plusieurs filtres
  const updateFilters = useCallback((newFilters: Partial<T>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }))
  }, [])

  // Fonction pour réinitialiser les filtres
  const resetFilters = useCallback(() => {
    setFilters(defaultFilters)
    // Supprimer les filtres sauvegardés
    persistentCache.delete(storageKey).catch(() => {
      localStorage.removeItem(storageKey)
    })
  }, [defaultFilters, storageKey])

  // Fonction pour effacer un filtre spécifique
  const clearFilter = useCallback(<K extends keyof T>(filterKey: K) => {
    setFilters((prev) => {
      const newFilters = { ...prev }
      delete newFilters[filterKey]
      return newFilters
    })
  }, [])

  return {
    filters,
    updateFilter,
    updateFilters,
    resetFilters,
    clearFilter,
    setFilters,
  }
}
