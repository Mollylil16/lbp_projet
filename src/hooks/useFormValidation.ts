/**
 * Hook personnalisé pour la validation de formulaires avec Zod
 * Fournit validation en temps réel, gestion d'erreurs et sauvegarde automatique
 */

import { useEffect, useCallback, useRef, useState } from 'react'
import { useForm, UseFormReturn, FieldValues } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { logger } from '@services/logger.service'

interface UseFormValidationOptions<T extends FieldValues> {
  schema: z.ZodSchema<T>
  defaultValues?: Partial<T>
  autoSaveKey?: string // Clé pour la sauvegarde automatique dans localStorage
  autoSaveDelay?: number // Délai en ms avant sauvegarde (défaut: 2000ms)
  onSubmit: (data: T) => void | Promise<void>
  onError?: (errors: Record<string, string>) => void
}

interface UseFormValidationReturn<T extends FieldValues> {
  form: UseFormReturn<T, any, T>
  handleSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>
  isSubmitting: boolean
  hasUnsavedChanges: boolean
  clearDraft: () => void
  loadDraft: () => boolean
}

/**
 * Hook pour la validation de formulaires avec Zod
 */
export function useFormValidation<T extends FieldValues>({
  schema,
  defaultValues,
  autoSaveKey,
  autoSaveDelay = 2000,
  onSubmit,
  onError,
}: UseFormValidationOptions<T>): UseFormValidationReturn<T> {
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as any,
    mode: 'onChange', // Validation en temps réel
    reValidateMode: 'onChange',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null)
  const isInitialMount = useRef(true)

  // Charger le brouillon au montage si disponible
  useEffect(() => {
    if (autoSaveKey && isInitialMount.current) {
      const draft = loadDraftFromStorage(autoSaveKey)
      if (draft) {
        try {
          // Valider le brouillon avant de le charger
          schema.parse(draft)
          form.reset(draft as T)
          setHasUnsavedChanges(true)
          logger.info('Brouillon chargé', { key: autoSaveKey })
        } catch (error) {
          logger.warn('Brouillon invalide, ignoré', { key: autoSaveKey, error })
          clearDraftFromStorage(autoSaveKey)
        }
      }
      isInitialMount.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSaveKey]) // Ne pas inclure form et schema car ils changent à chaque render

  // Sauvegarder automatiquement les changements
  useEffect(() => {
    if (!autoSaveKey) return

    const subscription = form.watch((value) => {
      if (!isInitialMount.current) {
        setHasUnsavedChanges(true)

        // Annuler le timer précédent
        if (autoSaveTimerRef.current) {
          clearTimeout(autoSaveTimerRef.current)
        }

        // Sauvegarder après le délai
        autoSaveTimerRef.current = setTimeout(() => {
          saveDraftToStorage(autoSaveKey, value as T)
          logger.debug('Brouillon sauvegardé automatiquement', { key: autoSaveKey })
        }, autoSaveDelay)
      }
    })

    return () => {
      subscription.unsubscribe()
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSaveKey, autoSaveDelay]) // Ne pas inclure form car il change à chaque render

  // Nettoyer le brouillon après soumission réussie
  const handleSubmit = useCallback(
    async (e?: React.BaseSyntheticEvent) => {
      e?.preventDefault()

      try {
        setIsSubmitting(true)
        const isValid = await form.trigger()

        if (!isValid) {
          const errors = form.formState.errors
          const errorMessages: Record<string, string> = {}

          // Convertir les erreurs Zod en format simple
          Object.keys(errors).forEach((key) => {
            const error = errors[key as keyof typeof errors]
            if (error?.message) {
              errorMessages[key] = error.message as string
            }
          })

          if (onError) {
            onError(errorMessages)
          }

          logger.warn('Validation échouée', { errors: errorMessages })
          return
        }

        const data = form.getValues()
        await onSubmit(data)

        // Nettoyer le brouillon après soumission réussie
        if (autoSaveKey) {
          clearDraftFromStorage(autoSaveKey)
          setHasUnsavedChanges(false)
        }

        logger.info('Formulaire soumis avec succès')
      } catch (error) {
        logger.error('Erreur lors de la soumission du formulaire', error)
        throw error
      } finally {
        setIsSubmitting(false)
      }
    },
    [form, onSubmit, onError, autoSaveKey]
  )

  const clearDraft = useCallback(() => {
    if (autoSaveKey) {
      clearDraftFromStorage(autoSaveKey)
      setHasUnsavedChanges(false)
      logger.info('Brouillon effacé', { key: autoSaveKey })
    }
  }, [autoSaveKey])

  const loadDraft = useCallback((): boolean => {
    if (autoSaveKey) {
      const draft = loadDraftFromStorage(autoSaveKey)
      if (draft) {
        try {
          schema.parse(draft)
          form.reset(draft as T)
          setHasUnsavedChanges(true)
          logger.info('Brouillon chargé manuellement', { key: autoSaveKey })
          return true
        } catch (error) {
          logger.warn('Brouillon invalide', { key: autoSaveKey, error })
          clearDraftFromStorage(autoSaveKey)
          return false
        }
      }
    }
    return false
  }, [autoSaveKey, form, schema])

  return {
    form,
    handleSubmit,
    isSubmitting,
    hasUnsavedChanges,
    clearDraft,
    loadDraft,
  }
}

/**
 * Fonctions utilitaires pour la sauvegarde des brouillons
 */
function saveDraftToStorage<T>(key: string, data: T): void {
  try {
    const storageKey = `lbp_draft_${key}`
    const serialized = JSON.stringify({
      data,
      timestamp: Date.now(),
    })
    localStorage.setItem(storageKey, serialized)
  } catch (error) {
    logger.error('Erreur lors de la sauvegarde du brouillon', error)
  }
}

function loadDraftFromStorage<T>(key: string): T | null {
  try {
    const storageKey = `lbp_draft_${key}`
    const stored = localStorage.getItem(storageKey)

    if (!stored) return null

    const parsed = JSON.parse(stored)

    // Vérifier que le brouillon n'est pas trop ancien (7 jours max)
    const maxAge = 7 * 24 * 60 * 60 * 1000
    if (Date.now() - parsed.timestamp > maxAge) {
      clearDraftFromStorage(key)
      return null
    }

    return parsed.data as T
  } catch (error) {
    logger.error('Erreur lors du chargement du brouillon', error)
    return null
  }
}

function clearDraftFromStorage(key: string): void {
  try {
    const storageKey = `lbp_draft_${key}`
    localStorage.removeItem(storageKey)
  } catch (error) {
    logger.error('Erreur lors de l\'effacement du brouillon', error)
  }
}
