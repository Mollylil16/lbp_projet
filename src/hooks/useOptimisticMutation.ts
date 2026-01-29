/**
 * Hook personnalisé pour les mutations optimistes avec React Query
 * Mise à jour immédiate de l'UI avant confirmation serveur
 * Rollback automatique en cas d'erreur
 */

import { useMutation, useQueryClient, UseMutationOptions } from '@tanstack/react-query'
import { logger } from '@services/logger.service'
import toast from 'react-hot-toast'

interface OptimisticUpdateConfig<TData, TVariables, TContext = any> {
  queryKey: readonly unknown[]
  onMutate: (variables: TVariables) => Promise<TContext> | TContext
  onError?: (error: Error, variables: TVariables, context: TContext | undefined) => void
  onSuccess?: (data: TData, variables: TVariables, context: TContext | undefined) => void
  successMessage?: string
  errorMessage?: string
  invalidateQueries?: boolean
}

/**
 * Hook pour les mutations optimistes
 * Mise à jour immédiate de l'UI + rollback automatique en cas d'erreur
 */
export function useOptimisticMutation<
  TData = unknown,
  TVariables = void,
  TContext = any
>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  config: OptimisticUpdateConfig<TData, TVariables, TContext>
) {
  const queryClient = useQueryClient()
  const {
    queryKey,
    onMutate,
    onError,
    onSuccess,
    successMessage,
    errorMessage,
    invalidateQueries = true,
  } = config

  return useMutation<TData, Error, TVariables, TContext>({
    mutationFn,

    // 1. Optimistic update - Mise à jour immédiate avant la requête serveur
    onMutate: async (variables) => {
      // Annuler les requêtes en cours pour éviter les conflits
      await queryClient.cancelQueries({ queryKey })

      // Sauvegarder le contexte actuel pour rollback
      const previousData = queryClient.getQueryData(queryKey)
      let context: TContext

      try {
        // Appliquer la mise à jour optimiste
        context = await onMutate(variables)
      } catch (error) {
        logger.error('Erreur lors de la mise à jour optimiste', error)
        throw error
      }

      return { previousData, context } as any as TContext
    },

    // 2. En cas de succès - Confirmer la mise à jour optimiste
    onSuccess: async (data, variables, context) => {
      // Appeler le callback personnalisé si fourni
      if (onSuccess) {
        const ctx = context as any
        onSuccess(data, variables, ctx?.context || context)
      }

      // Invalider les queries pour rafraîchir les données
      if (invalidateQueries) {
        await queryClient.invalidateQueries({ queryKey })
      }

      // Afficher le message de succès
      if (successMessage) {
        toast.success(successMessage)
      }
    },

    // 3. En cas d'erreur - Rollback automatique
    onError: (error, variables, context) => {
      // Rollback : restaurer les données précédentes
      const ctx = context as any
      if (ctx?.previousData !== undefined) {
        queryClient.setQueryData(queryKey, ctx.previousData)
      }

      // Appeler le callback personnalisé si fourni
      if (onError) {
        onError(error, variables, ctx?.context || context)
      }

      // Logger l'erreur
      logger.error('Erreur lors de la mutation optimiste', error, {
        variables,
        context: ctx?.context || context,
      })

      // Afficher le message d'erreur
      const message = errorMessage || 'Une erreur est survenue. Les modifications ont été annulées.'
      toast.error(message)
    },

    // 4. Toujours exécuté (succès ou erreur)
    onSettled: () => {
      // Rafraîchir les données pour s'assurer qu'elles sont à jour
      queryClient.invalidateQueries({ queryKey })
    },
  })
}

/**
 * Utilitaire pour créer une mise à jour optimiste simple
 * Pour les opérations CRUD basiques (create, update, delete)
 * NOTE: Nécessite queryClient, utilisez plutôt useOptimisticActions
 */
export function createOptimisticUpdater<TItem>(
  queryClient: ReturnType<typeof useQueryClient>,
  queryKey: any[],
  operation: 'create' | 'update' | 'delete',
  itemId?: (item: TItem) => number | string
) {
  return {
    // Create : ajouter l'item à la liste
    create: (newItem: TItem) => {
      queryClient.setQueryData<TItem[]>(queryKey, (old = []) => [...old, newItem])
    },

    // Update : remplacer l'item dans la liste
    update: (updatedItem: TItem) => {
      if (!itemId) {
        logger.warn('itemId function not provided for optimistic update')
        return
      }

      queryClient.setQueryData<TItem[]>(queryKey, (old = []) =>
        old.map((item) => (itemId(item) === itemId(updatedItem) ? updatedItem : item))
      )
    },

    // Delete : supprimer l'item de la liste
    delete: (deletedItemId: number | string) => {
      if (!itemId) {
        queryClient.setQueryData<TItem[]>(queryKey, (old = []) =>
          old.filter((item: any) => item.id !== deletedItemId)
        )
        return
      }

      queryClient.setQueryData<TItem[]>(queryKey, (old = []) =>
        old.filter((item) => itemId(item) !== deletedItemId)
      )
    },
  }[operation]
}
