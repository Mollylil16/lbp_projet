import { Colis, ClientColis, PaginatedResponse, PaginationParams, CreateColisDto, UpdateColisDto } from '@types'
import { apiService } from './api.service'

class ColisService {
  /**
   * Récupérer la liste des colis (groupage ou autres envois)
   */
  async getColis(
    formeEnvoi: 'groupage' | 'autres_envoi',
    params?: PaginationParams
  ): Promise<PaginatedResponse<Colis>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.search) queryParams.append('search', params.search)
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by)
    if (params?.sort_order) queryParams.append('sort_order', params.sort_order)

    return apiService.get<PaginatedResponse<Colis>>(
      `/colis?forme_envoi=${formeEnvoi}&${queryParams.toString()}`
    )
  }

  /**
   * Récupérer un colis par son ID
   */
  async getColisById(id: number): Promise<Colis> {
    return apiService.get<Colis>(`/colis/${id}`)
  }

  /**
   * Récupérer un colis par sa référence
   */
  async getColisByRef(refColis: string): Promise<Colis> {
    return apiService.get<Colis>(`/colis/ref/${refColis}`)
  }

  /**
   * Récupérer tous les colis (pour compatibilité avec alerts.service)
   */
  async getAll(params?: { statut?: string }): Promise<PaginatedResponse<Colis>> {
    const queryParams = new URLSearchParams()
    if (params?.statut) queryParams.append('statut', params.statut)
    
    return apiService.get<PaginatedResponse<Colis>>(
      `/colis?${queryParams.toString()}`
    )
  }

  /**
   * Créer un nouveau colis (groupage)
   */
  async createGroupage(data: CreateColisDto): Promise<Colis> {
    return apiService.post<Colis>('/colis/groupage', data)
  }

  /**
   * Créer un nouveau colis (autres envois)
   */
  async createAutresEnvois(data: CreateColisDto): Promise<Colis> {
    return apiService.post<Colis>('/colis/autres-envois', data)
  }

  /**
   * Mettre à jour un colis
   */
  async updateColis(id: number, data: UpdateColisDto): Promise<Colis> {
    return apiService.put<Colis>(`/colis/${id}`, data)
  }

  /**
   * Supprimer un colis
   */
  async deleteColis(id: number): Promise<void> {
    return apiService.delete<void>(`/colis/${id}`)
  }

  /**
   * Valider un colis
   */
  async validateColis(id: number): Promise<Colis> {
    return apiService.patch<Colis>(`/colis/${id}/validate`)
  }

  /**
   * Rechercher des colis
   */
  async searchColis(searchTerm: string, formeEnvoi?: 'groupage' | 'autres_envoi'): Promise<Colis[]> {
    const query = formeEnvoi ? `?forme_envoi=${formeEnvoi}&search=${searchTerm}` : `?search=${searchTerm}`
    return apiService.get<Colis[]>(`/colis/search${query}`)
  }

  /**
   * Suivre un colis (pour la page publique)
   */
  async trackColis(refColis: string): Promise<ColisTrackingInfo> {
    return apiService.get<ColisTrackingInfo>(`/colis/track/${refColis}`)
  }
}


export interface ColisTrackingInfo {
  ref_colis: string
  status: string
  current_location?: string
  steps: Array<{
    title: string
    date: string
    location?: string
  }>
  client_colis: ClientColis
  colis: Colis
}

export const colisService = new ColisService()
