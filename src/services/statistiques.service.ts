import { apiService } from './api.service'

export interface DonneesMensuelles {
  mois: string
  groupage: number
  autresEnvois: number
  total: number
  revenus?: number
}

export interface DonneesAnnuelles {
  annee: number
  mois: DonneesMensuelles[]
  totalColis: number
  totalRevenus: number
  moyenneMensuelle: number
}

export interface TendancesMensuelles {
  mois: string
  meilleureAnnee: number
  meilleureValeur: number
  pireAnnee: number
  pireValeur: number
  moyenne: number
  evolution: number // Pourcentage d'évolution
  tendance: 'hausse' | 'baisse' | 'stable'
}

class StatistiquesService {
  /**
   * Récupérer les données historiques pour plusieurs années
   */
  async getHistorique(annees: number[]): Promise<DonneesAnnuelles[]> {
    return apiService.get<DonneesAnnuelles[]>(`/rapports/historique?annees=${annees.join(',')}`);
  }

  /**
   * Récupérer l'analyse des tendances mensuelles
   */
  async getTendancesMensuelles(annees: number[]): Promise<TendancesMensuelles[]> {
    return apiService.get<TendancesMensuelles[]>(`/rapports/tendances?annees=${annees.join(',')}`);
  }

  /**
   * Récupérer les recommandations stratégiques dynamiques (IA)
   */
  async getAIRecommendations(): Promise<any[]> {
    return apiService.get<any[]>('/analytics/recommendations');
  }
}

export const statistiquesService = new StatistiquesService()
