import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { clientsService, CreateClientDto, UpdateClientDto } from '@services/clients.service'
import { PaginationParams } from '@types'
import toast from 'react-hot-toast'

/**
 * Hook pour récupérer la liste des clients
 */
export function useClientsList(params?: PaginationParams) {
  return useQuery({
    queryKey: ['clients', params],
    queryFn: () => clientsService.getClients(params),
  })
}

/**
 * Hook pour récupérer un client par ID
 */
export function useClient(id: number | null) {
  return useQuery({
    queryKey: ['clients', id],
    queryFn: () => clientsService.getClientById(id!),
    enabled: !!id,
  })
}

/**
 * Hook pour rechercher des clients
 */
export function useSearchClients(searchTerm: string) {
  return useQuery({
    queryKey: ['clients', 'search', searchTerm],
    queryFn: () => clientsService.searchClients(searchTerm),
    enabled: searchTerm.length >= 2,
  })
}

/**
 * Hook pour créer un client
 */
export function useCreateClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateClientDto) => clientsService.createClient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Client créé avec succès')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la création du client')
    },
  })
}

/**
 * Hook pour mettre à jour un client
 */
export function useUpdateClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateClientDto }) =>
      clientsService.updateClient(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Client mis à jour avec succès')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour')
    },
  })
}

/**
 * Hook pour supprimer un client
 */
export function useDeleteClient() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: number) => clientsService.deleteClient(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Client supprimé avec succès')
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression')
    },
  })
}

/**
 * Hook pour récupérer l'historique d'un client
 */
export function useClientHistory(id: number | null) {
  return useQuery({
    queryKey: ['clients', id, 'history'],
    queryFn: () => clientsService.getClientHistory(id!),
    enabled: !!id,
  })
}
