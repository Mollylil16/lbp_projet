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
import { useAuth } from '@hooks/useAuth'
import { PredictionCard } from '@components/dashboard/PredictionCard'
import { AIIntelligencePanel } from '@components/dashboard/AIIntelligencePanel'
import { DashboardSkeleton } from '@components/common/SkeletonLoader'
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

  // Récupérer les données pour les graphiques
  const { data: chartData, isLoading: chartLoading } = useQuery({
    queryKey: ['dashboard', 'charts'],
    queryFn: () => dashboardService.getChartData(),
    refetchInterval: APP_CONFIG.refresh.dashboard * 2,
    enabled: isAuthenticated,
  })

  // Récupérer la répartition du trafic
  const { data: trafficData, isLoading: trafficLoading } = useQuery({
    queryKey: ['dashboard', 'traffic'],
    queryFn: () => dashboardService.getTrafficRepartition(),
    refetchInterval: APP_CONFIG.refresh.dashboard * 2,
    enabled: isAuthenticated,
  })

  // Récupérer les recommandations IA
  const { data: recommendations = [], isLoading: recommendationsLoading } = useQuery({
    queryKey: ['dashboard', 'recommendations'],
    queryFn: () => dashboardService.getAIRecommendations(),
    refetchInterval: APP_CONFIG.refresh.dashboard * 5,
    enabled: isAuthenticated,
  })

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

  const isInitialLoading = statsLoading && !stats

  if (isInitialLoading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-header">
          <Title level={2} className="dashboard-title">Tableau de Bord</Title>
          <div className="dashboard-subtitle">Chargement en cours…</div>
        </div>
        <DashboardSkeleton />
      </div>
    )
  }

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
        <Col xs={24} lg={8}>
          <PredictionCard
            data={(chartData || []).map((d: any) => d.total)}
            loading={chartLoading}
          />
        </Col>
        <Col xs={24} lg={16}>
          <ChartRevenus data={chartData || []} loading={chartLoading} />
        </Col>
      </Row>

      <Row gutter={[24, 24]} className="dashboard-section">
        <Col xs={24} lg={12}>
          <ChartColisParMois data={chartData || []} loading={chartLoading} />
        </Col>
        <Col xs={24} lg={12}>
          <ChartRepartitionTrafic data={trafficData || []} loading={trafficLoading} />
        </Col>
      </Row>

      <Row gutter={[24, 24]} className="dashboard-section">
        <Col xs={24} xl={16}>
          <RecentActivities activities={activities || []} loading={activitiesLoading} />
        </Col>
        <Col xs={24} xl={8}>
          <AIIntelligencePanel
            recommendations={recommendations}
            loading={recommendationsLoading}
          />
        </Col>
      </Row>
    </div>
  )
}
