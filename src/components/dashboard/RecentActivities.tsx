import React from 'react'
import { Card, Typography, Empty, Spin, Timeline } from 'antd'
import {
  InboxOutlined,
  FileTextOutlined,
  DollarOutlined,
  TeamOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import { formatDateTime } from '@utils/format'
import './RecentActivities.css'

const { Title, Text } = Typography

interface Activity {
  id: number
  type: 'colis' | 'facture' | 'paiement' | 'client'
  action: string
  description: string
  user: string
  date: string
  ref?: string
}

interface RecentActivitiesProps {
  activities: Activity[]
  loading?: boolean
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'colis':
      return <InboxOutlined />
    case 'facture':
      return <FileTextOutlined />
    case 'paiement':
      return <DollarOutlined />
    case 'client':
      return <TeamOutlined />
    default:
      return <CheckCircleOutlined />
  }
}

const getActivityColor = (type: string) => {
  switch (type) {
    case 'colis':
      return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    case 'facture':
      return 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
    case 'paiement':
      return 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
    case 'client':
      return 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)'
    default:
      return 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
  }
}

export const RecentActivities: React.FC<RecentActivitiesProps> = ({ activities, loading = false }) => {
  if (loading) {
    return (
      <Card className="modern-chart-card">
        <Title level={4} className="chart-title">Activités Récentes</Title>
        <div className="chart-loading">
          <Spin size="large" />
        </div>
      </Card>
    )
  }

  if (activities.length === 0) {
    return (
      <Card className="modern-chart-card">
        <Title level={4} className="chart-title">Activités Récentes</Title>
        <Empty description="Aucune activité récente" />
      </Card>
    )
  }

  return (
    <Card className="modern-chart-card">
      <div className="chart-header">
        <Title level={4} className="chart-title">Activités Récentes</Title>
      </div>
      
      <div className="activities-timeline">
        <Timeline
          items={activities.map((activity) => ({
            dot: (
              <div
                className="activity-dot"
                style={{ background: getActivityColor(activity.type) }}
              >
                {getActivityIcon(activity.type)}
              </div>
            ),
            children: (
              <div className="activity-item">
                <div className="activity-header">
                  <Text strong className="activity-action">
                    {activity.action}
                  </Text>
                  {activity.ref && (
                    <span className="activity-ref">{activity.ref}</span>
                  )}
                </div>
                <Text className="activity-description">{activity.description}</Text>
                <div className="activity-footer">
                  <Text type="secondary" className="activity-user">
                    {activity.user}
                  </Text>
                  <Text type="secondary" className="activity-date">
                    {formatDateTime(activity.date)}
                  </Text>
                </div>
              </div>
            ),
          }))}
        />
      </div>
    </Card>
  )
}
