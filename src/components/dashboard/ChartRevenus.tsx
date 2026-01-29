import React, { useState } from 'react'
import { Card, Typography, Spin } from 'antd'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { ChartRevenusModal } from './ChartRevenusModal'
import './ChartRevenus.css'

const { Title } = Typography

interface ChartData {
  mois: string
  revenus: number
  objectif: number
}

interface ChartRevenusProps {
  data: ChartData[]
  loading?: boolean
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip">
        <div className="tooltip-header">{payload[0].payload.mois}</div>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="tooltip-item">
            <span className="tooltip-dot" style={{ background: entry.color }} />
            <span className="tooltip-label">{entry.name}:</span>
            <span className="tooltip-value">
              {typeof entry.value === 'number' ? entry.value.toLocaleString('fr-FR') : entry.value} FCFA
            </span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export const ChartRevenus: React.FC<ChartRevenusProps> = ({ data, loading = false }) => {
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedPoint, setSelectedPoint] = useState<{ mois: string; type: string; value: number } | undefined>()

  const handleChartClick = (e: any) => {
    if (e && e.activePayload && e.activePayload[0]) {
      const payload = e.activePayload[0].payload
      const dataKey = e.activePayload[0].dataKey
      setSelectedPoint({
        mois: payload.mois,
        type: dataKey,
        value: payload[dataKey],
      })
      setModalVisible(true)
    } else {
      setModalVisible(true)
    }
  }

  return (
    <>
      <Card 
        className="modern-chart-card" 
        style={{ cursor: 'pointer' }}
        onClick={handleChartClick}
        hoverable
      >
        <div className="chart-header">
          <Title level={4} className="chart-title">
            Évolution des Revenus par Mois
          </Title>
          <div className="chart-legend-inline">
            <div className="legend-item">
              <span className="legend-dot revenus" />
              <span>Revenus réels</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot objectif" />
              <span>Objectif</span>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="chart-loading">
            <Spin size="large" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart 
              data={data} 
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              onClick={handleChartClick}
            >
              <defs>
                <linearGradient id="colorRevenus" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.3} />
                </linearGradient>
                <linearGradient id="colorObjectif" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.3} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
              <XAxis 
                dataKey="mois" 
                stroke="#9ca3af"
                style={{ fontSize: 12, fontWeight: 500 }}
                tick={{ fill: '#6b7280' }}
              />
              <YAxis 
                stroke="#9ca3af"
                style={{ fontSize: 12, fontWeight: 500 }}
                tick={{ fill: '#6b7280' }}
                tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="revenus" 
                fill="url(#colorRevenus)" 
                name="Revenus réels"
                radius={[8, 8, 0, 0]}
                cursor="pointer"
              />
              <Bar 
                dataKey="objectif" 
                fill="url(#colorObjectif)" 
                name="Objectif"
                radius={[8, 8, 0, 0]}
                cursor="pointer"
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      <ChartRevenusModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false)
          setSelectedPoint(undefined)
        }}
        data={data}
        selectedPoint={selectedPoint}
      />
    </>
  )
}
