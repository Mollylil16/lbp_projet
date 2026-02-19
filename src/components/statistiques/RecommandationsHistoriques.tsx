import React from 'react'
import { Alert, List, Typography, Space, Spin, Empty } from 'antd'
import {
  CheckCircleOutlined,
  WarningOutlined,
  InfoCircleOutlined,
  ExclamationCircleOutlined,
  RobotOutlined,
} from '@ant-design/icons'
import { useQuery } from '@tanstack/react-query'
import { statistiquesService } from '@services/statistiques.service'

const { Text, Paragraph } = Typography

export const RecommandationsHistoriques: React.FC = () => {
  // Récupérer les recommandations dynamiques depuis le backend
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['ai-recommendations'],
    queryFn: () => statistiquesService.getAIRecommendations(),
    refetchInterval: 300000, // Toutes les 5 minutes
  })

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />
      case 'warning':
        return <WarningOutlined style={{ color: '#faad14' }} />
      case 'error':
        return <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
      default:
        return <InfoCircleOutlined style={{ color: '#1890ff' }} />
    }
  }

  if (isLoading) return <div style={{ textAlign: 'center', padding: 20 }}><Spin tip="L'IA analyse vos données..." /></div>

  return (
    <div>
      {!recommendations || recommendations.length === 0 ? (
        <Empty description="Aucune recommandation pour le moment." />
      ) : (
        <List
          dataSource={recommendations}
          renderItem={(item: any) => (
            <List.Item>
              <Alert
                type={item.type === 'error' ? 'error' : item.type}
                message={
                  <Space>
                    {getIcon(item.type)}
                    <Text strong>{item.title}</Text>
                  </Space>
                }
                description={
                  <div>
                    <Paragraph style={{ marginBottom: 8, fontWeight: 500 }}>
                      {item.description}
                    </Paragraph>

                    <div style={{ marginTop: 8, paddingLeft: 12, borderLeft: '3px solid #eee' }}>
                      <Text type="secondary" strong>🔍 Cause identifiée :</Text>
                      <Paragraph style={{ marginBottom: 4 }}>{item.cause}</Paragraph>

                      <Text type="success" strong>💡 Action recommandée :</Text>
                      <Paragraph style={{ italic: true }}>{item.action}</Paragraph>
                    </div>
                  </div>
                }
                showIcon={false}
                style={{ width: '100%', borderRadius: 8 }}
              />
            </List.Item>
          )}
        />
      )}
      <div style={{ marginTop: 16, textAlign: 'right' }}>
        <Text type="secondary" style={{ fontSize: 11 }}>
          <RobotOutlined /> Analyses basées sur vos flux réels de caisse et logistique.
        </Text>
      </div>
    </div>
  )
}
