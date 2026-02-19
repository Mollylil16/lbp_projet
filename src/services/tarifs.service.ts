import { apiService } from './api.service'

export interface Tarif {
    id: number
    nom: string
    prix_vente_conseille: number
    cout_transport_kg: number
    charges_fixes_unit: number
    created_at?: string
    updated_at?: string
}

class TarifsService {
    async getAll(): Promise<Tarif[]> {
        return apiService.get('/tarifs')
    }

    async getOne(id: number): Promise<Tarif> {
        return apiService.get(`/tarifs/${id}`)
    }

    async create(data: Partial<Tarif>): Promise<Tarif> {
        return apiService.post('/tarifs', data)
    }

    async update(id: number, data: Partial<Tarif>): Promise<Tarif> {
        return apiService.patch(`/tarifs/${id}`, data)
    }

    async delete(id: number): Promise<void> {
        return apiService.delete(`/tarifs/${id}`)
    }
}

export const tarifsService = new TarifsService()
