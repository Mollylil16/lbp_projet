/**
 * Hooks utilitaires pour les actions optimistes courantes
 * Pour les opérations CRUD standard
 */

import { useOptimisticMutation, createOptimisticUpdater } from './useOptimisticMutation'
import { useQueryClient } from '@tanstack/react-query'
import type { QueryKey } from '@tanstack/react-query'

/**
 * Hook pour la création optimiste d'un élément
 */
export function useOptimisticCreate<TItem, TCreateData = Partial<TItem>>(
  queryKey: QueryKey,
  createFn: (data: TCreateData) => Promise<TItem>,
  options?: {
    successMessage?: string
    errorMessage?: string
    onSuccess?: (item: TItem) => void
  }
) {
  const queryClient = useQueryClient()

  return useOptimisticMutation<TItem, TCreateData, TItem>(createFn, {
    queryKey: queryKey as readonly unknown[],
    onMutate: async (newData) => {
      // Créer un item temporaire optimiste
      const optimisticItem = {
        ...newData,
        id: `temp-${Date.now()}`,
        createdAt: new Date().toISOString(),
      } as TItem

      // Ajouter immédiatement à la liste
      queryClient.setQueryData<TItem[]>(queryKey, (old = []) => [
        ...old,
        optimisticItem,
      ])

      return optimisticItem
    },
    onSuccess: (data, _, context) => {
      // Remplacer l'item temporaire par le vrai item retourné par le serveur
      const ctx = context as any
      queryClient.setQueryData<TItem[]>(queryKey, (old = []) =>
        old.map((item: any) => (item.id === ctx?.id ? data : item))
      )

      if (options?.onSuccess) {
        options.onSuccess(data)
      }
    },
    successMessage: options?.successMessage || 'Élément créé avec succès',
    errorMessage: options?.errorMessage || 'Erreur lors de la création',
    invalidateQueries: false, // Pas besoin, on a déjà mis à jour manuellement
  })
}

/**
 * Hook pour la mise à jour optimiste d'un élément
 */
export function useOptimisticUpdate<TItem, TUpdateData = Partial<TItem>>(
  queryKey: QueryKey,
  updateFn: (id: number | string, data: TUpdateData) => Promise<TItem>,
  getItemId: (item: TItem) => number | string,
  options?: {
    successMessage?: string
    errorMessage?: string
    onSuccess?: (item: TItem) => void
  }
) {
  const queryClient = useQueryClient()

  return useOptimisticMutation<TItem, { id: number | string; data: TUpdateData }, { previousItem: TItem | undefined; optimisticItem: TItem }>(
    ({ id, data }: { id: number | string; data: TUpdateData }) => updateFn(id, data),
    {
      queryKey: queryKey as readonly unknown[],
      onMutate: async ({ id, data }) => {
        // Sauvegarder l'item actuel
        const previousItems = queryClient.getQueryData<TItem[]>(queryKey) || []
        const previousItem = previousItems.find(
          (item) => getItemId(item) === id
        )

        // Créer un item optimiste avec les nouvelles données
        const optimisticItem = {
          ...(previousItem || {}),
          ...data,
        } as unknown as TItem

        // Mettre à jour immédiatement
        queryClient.setQueryData<TItem[]>(queryKey, (old = []) =>
          old.map((item) => (getItemId(item) === id ? optimisticItem : item))
        )

        return { previousItem, optimisticItem }
      },
      onSuccess: (data, { id }, context) => {
        // Remplacer l'item optimiste par le vrai item retourné par le serveur
        queryClient.setQueryData<TItem[]>(queryKey, (old = []) =>
          old.map((item) => (getItemId(item) === id ? data : item))
        )

        if (options?.onSuccess) {
          options.onSuccess(data)
        }
      },
      successMessage: options?.successMessage || 'Élément modifié avec succès',
      errorMessage: options?.errorMessage || 'Erreur lors de la modification',
      invalidateQueries: false,
    }
  )
}

/**
 * Hook pour la suppression optimiste d'un élément
 */
export function useOptimisticDelete<TItem>(
  queryKey: QueryKey,
  deleteFn: (id: number | string) => Promise<void>,
  getItemId: (item: TItem) => number | string,
  options?: {
    successMessage?: string
    errorMessage?: string
    onSuccess?: () => void
  }
) {
  const queryClient = useQueryClient()

  return useOptimisticMutation<void, number | string, { itemToDelete: TItem | undefined; previousItems: TItem[] }>(deleteFn, {
    queryKey: queryKey as readonly unknown[],
    onMutate: async (id) => {
      // Sauvegarder l'item à supprimer
      const previousItems = queryClient.getQueryData<TItem[]>(queryKey) || []
      const itemToDelete = previousItems.find((item) => getItemId(item) === id)

      // Supprimer immédiatement de la liste
      queryClient.setQueryData<TItem[]>(queryKey, (old = []) =>
        old.filter((item) => getItemId(item) !== id)
      )

      return { itemToDelete, previousItems }
    },
    onSuccess: (_, id, context) => {
      if (options?.onSuccess) {
        options.onSuccess()
      }
    },
    successMessage: options?.successMessage || 'Élément supprimé avec succès',
    errorMessage: options?.errorMessage || 'Erreur lors de la suppression',
    invalidateQueries: false,
  })
}
