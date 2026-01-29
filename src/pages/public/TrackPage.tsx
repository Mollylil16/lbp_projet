import React, { useState } from 'react'
import { Card, Input, Button, Typography, Space, Timeline, Empty } from 'antd'
import { SearchOutlined } from '@ant-design/icons'

const { Title, Text } = Typography
const { Search } = Input

export const TrackPage: React.FC = () => {
  const [trackingCode, setTrackingCode] = useState('')
  const [trackingData, setTrackingData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleSearch = async (value: string) => {
    if (!value) {
      return
    }

    setLoading(true)
    try {
      // TODO: Appel API pour rechercher le colis
      // const data = await colisService.trackColis(value)
      // setTrackingData(data)
      
      // Simulation pour le moment
      setTimeout(() => {
        setTrackingData({
          ref_colis: value,
          status: 'En transit',
          steps: [
            { title: 'Colis créé', date: '2024-01-15 10:00' },
            { title: 'En transit', date: '2024-01-16 14:30' },
          ],
        })
        setLoading(false)
      }, 1000)
    } catch (error) {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', padding: '40px 20px', background: '#f0f2f5' }}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Title level={1} style={{ color: '#1890ff' }}>
            Suivi de Colis
          </Title>
          <Text type="secondary">
            Entrez votre numéro de référence pour suivre votre colis
          </Text>
        </div>

        <Card style={{ marginBottom: 24 }}>
          <Space.Compact style={{ width: '100%' }}>
            <Search
              placeholder="Ex: ECO-0124-001"
              size="large"
              enterButton={
                <Button type="primary" icon={<SearchOutlined />} loading={loading}>
                  Suivre
                </Button>
              }
              onSearch={handleSearch}
              onChange={(e) => setTrackingCode(e.target.value)}
            />
          </Space.Compact>
        </Card>

        {trackingData ? (
          <Card>
            <Title level={4}>Référence: {trackingData.ref_colis}</Title>
            <Timeline
              items={trackingData.steps.map((step: any, index: number) => ({
                color: index === trackingData.steps.length - 1 ? 'blue' : 'green',
                children: (
                  <div>
                    <Text strong>{step.title}</Text>
                    <br />
                    <Text type="secondary">{step.date}</Text>
                  </div>
                ),
              }))}
            />
          </Card>
        ) : (
          <Card>
            <Empty
              description="Aucun résultat. Entrez un numéro de référence pour commencer."
            />
          </Card>
        )}
      </div>
    </div>
  )
}
