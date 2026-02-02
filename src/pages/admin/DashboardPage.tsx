import React, { useEffect } from 'react'
import { Row, Col, Typography } from 'antd'
import { useQuery } from '@tanstack/react-query'
import { dashboardService } from '@services/dashboard.service'
import { StatsCards } from '@components/dashboard/StatsCards'
import { ChartColisParMois } from '@components/dashboard/ChartColisParMois'
import { ChartRevenus } from '@components/dashboard/ChartRevenus'
import { ChartRepartitionTrafic } from '@components/dashboard/ChartRepartitionTrafic'
import { RecentActivities } from '@components/dashboard/RecentActivities'
import { PointCaisse } from '@components/dashboard/PointCaisse'
import { WithPermission } from '@components/common/WithPermission'
import { PERMISSIONS } from '@constants/permissions'
import { APP_CONFIG } from '@constants/application'
import { useAlerts } from '@services/alerts.service'
import { useAuth } from '@contexts/AuthContext'
import './DashboardPage.css'

const { Title } = Typography

export const DashboardPage: React.FC = () => {
  const { isAuthenticated } = useAuth()
  
  // Activer les alertes automatiques
  useAlerts();

  // Récupérer les statistiques (seulement si authentifié)
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['dashboard', 'stats'],
    queryFn: () => dashboardService.getStats(),
    refetchInterval: APP_CONFIG.refresh.dashboard,
    enabled: isAuthenticated, // Ne faire la requête que si authentifié
  })

  // Récupérer le point caisse (seulement si authentifié)
  const { data: pointCaisse, isLoading: caisseLoading, refetch: refetchCaisse } = useQuery({
    queryKey: ['dashboard', 'caisse'],
    queryFn: () => dashboardService.getPointCaisse(),
    refetchInterval: APP_CONFIG.refresh.widgets,
    enabled: isAuthenticated, // Ne faire la requête que si authentifié
  })

  // Récupérer les activités récentes (seulement si authentifié)
  const { data: activities, isLoading: activitiesLoading, refetch: refetchActivities } = useQuery({
    queryKey: ['dashboard', 'activities'],
    queryFn: () => dashboardService.getRecentActivities(10),
    refetchInterval: APP_CONFIG.refresh.widgets,
    enabled: isAuthenticated, // Ne faire la requête que si authentifié
  })

  // Données de graphiques (à remplacer par des appels API réels)
  const chartColisData = [
    { mois: 'Jan', groupage: 120, autresEnvois: 80, total: 200 },
    { mois: 'Fév', groupage: 150, autresEnvois: 100, total: 250 },
    { mois: 'Mar', groupage: 180, autresEnvois: 120, total: 300 },
    { mois: 'Avr', groupage: 200, autresEnvois: 150, total: 350 },
    { mois: 'Mai', groupage: 220, autresEnvois: 180, total: 400 },
    { mois: 'Juin', groupage: 250, autresEnvois: 200, total: 450 },
  ]

  const chartRevenusData = [
    { mois: 'Jan', revenus: 15000000, objectif: 20000000 },
    { mois: 'Fév', revenus: 18000000, objectif: 20000000 },
    { mois: 'Mar', revenus: 22000000, objectif: 25000000 },
    { mois: 'Avr', revenus: 25000000, objectif: 25000000 },
    { mois: 'Mai', revenus: 28000000, objectif: 30000000 },
    { mois: 'Juin', revenus: 32000000, objectif: 30000000 },
  ]

  const chartTraficData = [
    { name: 'Import Aérien', value: 45 },
    { name: 'Import Maritime', value: 30 },
    { name: 'Export Aérien', value: 15 },
    { name: 'Export Maritime', value: 10 },
  ]

  // Rafraîchir automatiquement toutes les données
  useEffect(() => {
    const interval = setInterval(() => {
      refetchStats()
      refetchCaisse()
      refetchActivities()
    }, APP_CONFIG.refresh.dashboard)

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [refetchStats, refetchCaisse, refetchActivities])

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <Title level={2} className="dashboard-title">
          Tableau de Bord
        </Title>
        <div className="dashboard-subtitle">
          Vue d'ensemble de votre activité
        </div>
      </div>

      {/* STATISTIQUES */}
      {stats && <StatsCards stats={stats} loading={statsLoading} />}

      {/* POINT CAISSE */}
      <WithPermission permission={PERMISSIONS.DASHBOARD.CAISSE}>
        {pointCaisse && (
          <div className="dashboard-section">
            <PointCaisse data={pointCaisse} loading={caisseLoading} />
          </div>
        )}
      </WithPermission>

      {/* GRAPHIQUES */}
      <Row gutter={[24, 24]} className="dashboard-section">
        <Col xs={24} lg={12}>
          <ChartColisParMois data={chartColisData} loading={statsLoading} />
        </Col>
        <Col xs={24} lg={12}>
          <ChartRepartitionTrafic data={chartTraficData} loading={statsLoading} />
        </Col>
      </Row>

      <WithPermission permission={PERMISSIONS.DASHBOARD.ADMIN}>
        <Row gutter={[24, 24]} className="dashboard-section">
          <Col xs={24}>
            <ChartRevenus data={chartRevenusData} loading={statsLoading} />
          </Col>
        </Row>
      </WithPermission>

      {/* ACTIVITÉS RÉCENTES */}
      <Row gutter={[24, 24]} className="dashboard-section">
        <Col xs={24}>
          <RecentActivities activities={activities || []} loading={activitiesLoading} />
        </Col>
      </Row>
    </div>
  )
}
