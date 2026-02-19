import { apiService } from './api.service'

interface RapportParams {
  start_date: string
  end_date: string
  trafic_envoi?: string
  mode_envoi?: string
  forme_envoi?: 'groupage' | 'autres_envoi'
  client_id?: number
}

class RapportsService {
  /**
   * Générer un rapport de colis
   */
  async generateRapportColis(params: RapportParams): Promise<any> {
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString())
    })

    return apiService.get(`/rapports/colis?${queryParams.toString()}`)
  }

  /**
   * Exporter le rapport en Excel
   */
  async exportRapportExcel(params: RapportParams): Promise<Blob> {
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString())
    })

    const response = await apiService.instance.get(`/rapports/export/excel?${queryParams.toString()}`, {
      responseType: 'blob',
    })
    return response.data
  }

  /**
   * Exporter le rapport en PDF
   */
  async exportRapportPDF(params: RapportParams): Promise<Blob> {
    const queryParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value) queryParams.append(key, value.toString())
    })

    const response = await apiService.instance.get(`/rapports/export/pdf?${queryParams.toString()}`, {
      responseType: 'blob',
    })
    return response.data
  }

  /**
   * Télécharger le rapport Excel
   */
  async downloadRapportExcel(params: RapportParams, filename?: string): Promise<void> {
    const blob = await this.exportRapportExcel(params)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename || `rapport-${params.start_date}-${params.end_date}.xlsx`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  /**
   * Télécharger le rapport PDF
   */
  async downloadRapportPDF(params: RapportParams, filename?: string): Promise<void> {
    const blob = await this.exportRapportPDF(params)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename || `rapport-${params.start_date}-${params.end_date}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  }

  /**
   * Obtenir les finances groupées par tarif
   */
  async getFinancesParTarif(): Promise<any[]> {
    return apiService.get('/rapports/finances-tarif')
  }
}

export const rapportsService = new RapportsService()
