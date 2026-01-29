import { DashboardStats, PointCaisse } from '@types'
import { apiService } from './api.service'

class DashboardService {
  /**
   * Récupérer les statistiques du dashboard
   */
  async getStats(): Promise<DashboardStats> {
    return apiService.get<DashboardStats>('/dashboard/stats')
  }

  /**
   * Récupérer le point caisse du jour
   */
  async getPointCaisse(date?: string): Promise<PointCaisse> {
    const url = date ? `/dashboard/caisse?date=${date}` : '/dashboard/caisse'
    return apiService.get<PointCaisse>(url)
  }

  /**
   * Récupérer les activités récentes
   */
  async getRecentActivities(limit: number = 10): Promise<any[]> {
    return apiService.get<any[]>(`/dashboard/activities?limit=${limit}`)
  }
}

export const dashboardService = new DashboardService()
