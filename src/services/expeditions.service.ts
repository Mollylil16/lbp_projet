
import { apiService } from './api.service'
import { Expedition, CreateExpeditionDto } from '../types'

export const expeditionsService = {
    // Récupérer toutes les expéditions (filtrées par agence côté backend)
    getAll: async (): Promise<Expedition[]> => {
        return apiService.get<Expedition[]>('/expeditions')
    },

    // Récupérer une expédition par ID
    getById: async (id: number): Promise<Expedition> => {
        return apiService.get<Expedition>(`/expeditions/${id}`)
    },

    // Créer une nouvelle expédition
    create: async (data: CreateExpeditionDto): Promise<Expedition> => {
        return apiService.post<Expedition>('/expeditions', data)
    },

    // Ajouter des colis à une expédition
    addColis: async (id: number, colisIds: number[]): Promise<Expedition> => {
        return apiService.post<Expedition>(`/expeditions/${id}/colis`, { colisIds })
    },

    // Retirer un colis d'une expédition
    removeColis: async (id: number, colisId: number): Promise<Expedition> => {
        return apiService.delete<Expedition>(`/expeditions/${id}/colis/${colisId}`)
    },

    // Mettre à jour le statut
    updateStatus: async (id: number, statut: string): Promise<Expedition> => {
        return apiService.patch<Expedition>(`/expeditions/${id}/status`, { statut })
    },
}
