import { Paiement, PaginatedResponse, PaginationParams } from '@types'
import { apiService } from './api.service'

class PaiementsService {
  /**
   * Récupérer la liste des paiements
   */
  async getPaiements(params?: PaginationParams): Promise<PaginatedResponse<Paiement>> {
    const queryParams = new URLSearchParams()
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.search) queryParams.append('search', params.search)

    return apiService.get<PaginatedResponse<Paiement>>(`/paiements?${queryParams.toString()}`)
  }

  /**
   * Récupérer un paiement par son ID
   */
  async getPaiementById(id: number): Promise<Paiement> {
    return apiService.get<Paiement>(`/paiements/${id}`)
  }

  /**
   * Récupérer les paiements d'un colis
   */
  async getPaiementsByColis(refColis: string): Promise<Paiement[]> {
    return apiService.get<Paiement[]>(`/paiements/colis/${refColis}`)
  }

  /**
   * Récupérer les paiements d'une facture
   */
  async getPaiementsByFacture(factureId: number): Promise<Paiement[]> {
    return apiService.get<Paiement[]>(`/paiements/facture/${factureId}`)
  }

  /**
   * Enregistrer un paiement pour un colis
   */
  async createPaiement(data: CreatePaiementDto): Promise<Paiement> {
    return apiService.post<Paiement>('/paiements', data)
  }

  /**
   * Mettre à jour un paiement
   */
  async updatePaiement(id: number, data: UpdatePaiementDto): Promise<Paiement> {
    return apiService.put<Paiement>(`/paiements/${id}`, data)
  }

  /**
   * Annuler un paiement
   */
  async cancelPaiement(id: number): Promise<void> {
    return apiService.patch<void>(`/paiements/${id}/cancel`)
  }

  /**
   * Valider un paiement
   */
  async validatePaiement(id: number): Promise<Paiement> {
    return apiService.patch<Paiement>(`/paiements/${id}/validate`)
  }

  /**
   * Calculer le restant à payer pour un colis
   */
  async calculateRestantAPayer(refColis: string): Promise<RestantAPayerInfo> {
    return apiService.get<RestantAPayerInfo>(`/paiements/calculate/${refColis}`)
  }
}

export interface CreatePaiementDto {
  colis_id?: number
  facture_id?: number
  ref_colis?: string
  montant: number
  mode_paiement: string // 'Comptant', '30 jours', etc.
  date_paiement: string
  reference?: string
  monnaie_rendue?: number // Pour paiement comptant
}

export interface UpdatePaiementDto extends Partial<CreatePaiementDto> {}

export interface RestantAPayerInfo {
  montant_total: number
  montant_paye: number
  restant_a_payer: number
  ref_colis: string
  facture_num?: string
}

export const paiementsService = new PaiementsService()
