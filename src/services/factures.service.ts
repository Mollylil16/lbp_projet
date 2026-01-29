import { FactureColis, Colis, PaginatedResponse, PaginationParams } from '@types'
import { apiService } from './api.service'

class FacturesService {
  /**
   * Récupérer la liste des factures
   */
  async getFactures(
    type?: 'proforma' | 'definitive',
    params?: PaginationParams
  ): Promise<PaginatedResponse<FactureColis>> {
    const queryParams = new URLSearchParams()
    if (type) queryParams.append('type', type)
    if (params?.page) queryParams.append('page', params.page.toString())
    if (params?.limit) queryParams.append('limit', params.limit.toString())
    if (params?.search) queryParams.append('search', params.search)

    return apiService.get<PaginatedResponse<FactureColis>>(`/factures?${queryParams.toString()}`)
  }

  /**
   * Récupérer une facture par son ID
   */
  async getFactureById(id: number): Promise<FactureColis> {
    return apiService.get<FactureColis>(`/factures/${id}`)
  }

  /**
   * Récupérer une facture par numéro
   */
  async getFactureByNum(numFacture: string): Promise<FactureColis> {
    return apiService.get<FactureColis>(`/factures/num/${numFacture}`)
  }

  /**
   * Récupérer la facture d'un colis
   */
  async getFactureByColis(refColis: string): Promise<FactureColis | null> {
    return apiService.get<FactureColis | null>(`/factures/colis/${refColis}`)
  }

  /**
   * Créer une facture proforma pour un colis
   */
  async createFactureProforma(refColis: string): Promise<FactureColis> {
    return apiService.post<FactureColis>('/factures/proforma', { ref_colis: refColis })
  }

  /**
   * Valider une facture proforma (génère facture définitive)
   */
  async validateFacture(id: number): Promise<FactureColis> {
    return apiService.patch<FactureColis>(`/factures/${id}/validate`)
  }

  /**
   * Annuler une facture
   */
  async cancelFacture(id: number): Promise<void> {
    return apiService.patch<void>(`/factures/${id}/cancel`)
  }

  /**
   * Générer le PDF d'une facture
   */
  async generatePDF(id: number): Promise<Blob> {
    const response = await apiService.instance.get(`/factures/${id}/pdf`, {
      responseType: 'blob',
    })
    return response.data
  }

  /**
   * Télécharger le PDF d'une facture
   */
  async downloadPDF(id: number, filename?: string): Promise<void> {
    const blob = await this.generatePDF(id)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename || `facture-${id}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  /**
   * Imprimer une facture
   */
  async printFacture(id: number): Promise<void> {
    const blob = await this.generatePDF(id)
    const url = window.URL.createObjectURL(blob)
    const printWindow = window.open(url, '_blank')
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print()
      }
    }
  }
}

export const facturesService = new FacturesService()
