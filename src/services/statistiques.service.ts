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
    // TODO: Remplacer par un appel API réel
    // return apiService.get<DonneesAnnuelles[]>(`/statistiques/historique?annees=${annees.join(',')}`)
    
    // Données mock pour la démo
    return this.generateMockData(annees)
  }

  /**
   * Récupérer l'analyse des tendances mensuelles
   */
  async getTendancesMensuelles(annees: number[]): Promise<TendancesMensuelles[]> {
    // TODO: Remplacer par un appel API réel
    // return apiService.get<TendancesMensuelles[]>(`/statistiques/tendances?annees=${annees.join(',')}`)
    
    // Générer des tendances basées sur les données historiques
    const historique = await this.getHistorique(annees)
    return this.calculateTendances(historique)
  }

  /**
   * Générer des données mock pour la démo
   */
  private generateMockData(annees: number[]): DonneesAnnuelles[] {
    const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
    
    return annees.map(annee => {
      const moisData: DonneesMensuelles[] = mois.map((moisNom, index) => {
        // Générer des données réalistes avec variations
        const baseGroupage = 150 + (annee - 2020) * 10 // Augmentation annuelle
        const baseAutres = 100 + (annee - 2020) * 8
        const variation = Math.sin((index / 12) * Math.PI * 2) * 30 // Variation saisonnière
        
        const groupage = Math.round(baseGroupage + variation + (Math.random() * 40 - 20))
        const autresEnvois = Math.round(baseAutres + variation * 0.7 + (Math.random() * 30 - 15))
        const total = groupage + autresEnvois
        const revenus = total * 50000 // Estimation: 50k FCFA par colis

        return {
          mois: moisNom,
          groupage: Math.max(0, groupage),
          autresEnvois: Math.max(0, autresEnvois),
          total: Math.max(0, total),
          revenus: Math.max(0, revenus),
        }
      })

      const totalColis = moisData.reduce((sum, m) => sum + m.total, 0)
      const totalRevenus = moisData.reduce((sum, m) => sum + (m.revenus || 0), 0)
      const moyenneMensuelle = totalColis / 12

      return {
        annee,
        mois: moisData,
        totalColis,
        totalRevenus,
        moyenneMensuelle: Math.round(moyenneMensuelle * 10) / 10,
      }
    })
  }

  /**
   * Calculer les tendances mensuelles
   */
  private calculateTendances(historique: DonneesAnnuelles[]): TendancesMensuelles[] {
    const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
    
    return mois.map(moisNom => {
      // Récupérer les valeurs pour ce mois pour toutes les années
      const valeurs = historique.map(yearData => {
        const moisData = yearData.mois.find(m => m.mois === moisNom)
        return {
          annee: yearData.annee,
          valeur: moisData?.total || 0,
        }
      })

      const meilleure = valeurs.reduce((max, v) => v.valeur > max.valeur ? v : max, valeurs[0])
      const pire = valeurs.reduce((min, v) => v.valeur < min.valeur ? v : min, valeurs[0])
      const moyenne = valeurs.reduce((sum, v) => sum + v.valeur, 0) / valeurs.length

      // Calculer l'évolution (comparaison entre la première et la dernière année)
      const premiereAnnee = valeurs[0]?.valeur || 0
      const derniereAnnee = valeurs[valeurs.length - 1]?.valeur || 0
      const evolution = premiereAnnee > 0 
        ? ((derniereAnnee - premiereAnnee) / premiereAnnee) * 100 
        : 0

      let tendance: 'hausse' | 'baisse' | 'stable'
      if (evolution > 5) tendance = 'hausse'
      else if (evolution < -5) tendance = 'baisse'
      else tendance = 'stable'

      return {
        mois: moisNom,
        meilleureAnnee: meilleure.annee,
        meilleureValeur: meilleure.valeur,
        pireAnnee: pire.annee,
        pireValeur: pire.valeur,
        moyenne: Math.round(moyenne * 10) / 10,
        evolution: Math.round(evolution * 10) / 10,
        tendance,
      }
    })
  }
}

export const statistiquesService = new StatistiquesService()
