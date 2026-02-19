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

  /**
   * Suivi des paiements (payé / partiel / impayé) par colis/facture
   */
  async getSuiviPaiements(params?: SuiviPaiementsParams): Promise<PaginatedResponse<SuiviPaiementItem>> {
    const queryParams = new URLSearchParams()
    if (params?.page)       queryParams.append('page', params.page.toString())
    if (params?.limit)      queryParams.append('limit', params.limit.toString())
    if (params?.statut && params.statut !== 'tous') queryParams.append('statut', params.statut)
    if (params?.search)     queryParams.append('search', params.search)
    if (params?.date_debut) queryParams.append('date_debut', params.date_debut)
    if (params?.date_fin)   queryParams.append('date_fin', params.date_fin)

    try {
      return await apiService.get<PaginatedResponse<SuiviPaiementItem>>(
        `/paiements/suivi?${queryParams.toString()}`
      )
    } catch {
      // Fallback : construire le suivi depuis les factures existantes
      const factures = await apiService.get<any>(`/factures?${queryParams.toString()}`)
      const items: SuiviPaiementItem[] = (factures?.data || []).map((f: any) => {
        const paye = f.montant_paye || 0
        const total = f.total_mont_ttc || 0
        const restant = Math.max(0, total - paye)
        const statut: StatutPaiement = paye >= total ? 'paye' : paye > 0 ? 'partiel' : 'impaye'
        return {
          id: f.id,
          ref_colis: f.ref_colis || f.colis?.ref_colis || '-',
          facture_num: f.num_facture,
          nom_client: f.colis?.client_colis?.nom_exp || f.nom_client || 'Client inconnu',
          tel_client: f.colis?.client_colis?.tel_exp,
          montant_total: total,
          montant_paye: paye,
          restant_a_payer: restant,
          statut,
          dernier_paiement_date: f.updated_at,
          nb_paiements: f.nb_paiements || 0,
          date_creation: f.created_at,
        }
      })
      return { data: items, total: factures?.total || 0, page: params?.page || 1, limit: params?.limit || 20 }
    }
  }

  /**
   * Télécharger le reçu d'un paiement
   */
  async downloadReceipt(id: number, filename?: string): Promise<void> {
    const response = await apiService.instance.get(`/paiements/${id}/receipt`, {
      responseType: 'blob',
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.download = filename || `recu-paiement-${id}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
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

export interface UpdatePaiementDto extends Partial<CreatePaiementDto> { }

export interface RestantAPayerInfo {
  montant_total: number
  montant_paye: number
  restant_a_payer: number
  ref_colis: string
  facture_num?: string
}

export type StatutPaiement = 'paye' | 'partiel' | 'impaye'

export interface SuiviPaiementItem {
  id: number
  ref_colis: string
  facture_num?: string
  nom_client: string
  tel_client?: string
  montant_total: number
  montant_paye: number
  restant_a_payer: number
  statut: StatutPaiement
  dernier_paiement_date?: string
  dernier_mode_paiement?: string
  nb_paiements: number
  date_creation: string
}

export interface SuiviPaiementsParams {
  statut?: StatutPaiement | 'tous'
  search?: string
  date_debut?: string
  date_fin?: string
  page?: number
  limit?: number
}

export const paiementsService = new PaiementsService()
