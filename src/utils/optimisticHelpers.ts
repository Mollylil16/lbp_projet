/**
 * Utilitaires pour gérer les mises à jour optimistes
 * Helpers pour les patterns courants
 */

import { QueryClient, QueryKey } from '@tanstack/react-query'

/**
 * Créer un item temporaire pour les mises à jour optimistes
 */
export function createTemporaryItem<T>(
  data: Partial<T>,
  idPrefix: string = 'temp'
): T & { id: string; _temp?: boolean } {
  return {
    ...data,
    id: `${idPrefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    _temp: true,
  } as T & { id: string; _temp?: boolean }
}

/**
 * Remplacer un item temporaire par le vrai item retourné par le serveur
 */
export function replaceTemporaryItem<TItem>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  tempItem: TItem & { id: string },
  realItem: TItem,
  getId: (item: TItem) => string | number = (item: any) => item.id
): void {
  queryClient.setQueryData<TItem[]>(queryKey, (old = []) =>
    old.map((item) => {
      const itemId = getId(item)
      const tempId = getId(tempItem)
      
      // Si c'est l'item temporaire, le remplacer par le vrai
      if (itemId === tempId || (item as any)._temp) {
        return realItem
      }
      
      return item
    })
  )
}

/**
 * Restaurer les données précédentes (rollback)
 */
export function rollbackQueryData<T>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  previousData: T | undefined
): void {
  if (previousData !== undefined) {
    queryClient.setQueryData(queryKey, previousData)
  }
}

/**
 * Mettre à jour une liste optimistement (ajout)
 */
export function optimisticListAppend<TItem>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  newItem: TItem
): void {
  queryClient.setQueryData<TItem[]>(queryKey, (old = []) => [...old, newItem])
}

/**
 * Mettre à jour une liste optimistement (remplacement)
 */
export function optimisticListUpdate<TItem>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  updatedItem: TItem,
  getId: (item: TItem) => string | number = (item: any) => item.id
): void {
  queryClient.setQueryData<TItem[]>(queryKey, (old = []) =>
    old.map((item) => (getId(item) === getId(updatedItem) ? updatedItem : item))
  )
}

/**
 * Mettre à jour une liste optimistement (suppression)
 */
export function optimisticListRemove<TItem>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  itemId: string | number,
  getId: (item: TItem) => string | number = (item: any) => item.id
): void {
  queryClient.setQueryData<TItem[]>(queryKey, (old = []) =>
    old.filter((item) => getId(item) !== itemId)
  )
}

/**
 * Mettre à jour un objet unique optimistement
 */
export function optimisticObjectUpdate<T>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  updatedData: Partial<T>
): void {
  queryClient.setQueryData<T>(queryKey, (old) => ({
    ...old,
    ...updatedData,
  } as T))
}
