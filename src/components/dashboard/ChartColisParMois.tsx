import React, { useState } from 'react'
import { Card, Typography, Spin } from 'antd'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { ChartColisParMoisModal } from './ChartColisParMoisModal'
import './ChartColisParMois.css'

const { Title } = Typography

interface ChartData {
  mois: string
  groupage: number
  autresEnvois: number
  total: number
}

interface ChartColisParMoisProps {
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
            <span className="tooltip-value">{entry.value}</span>
          </div>
        ))}
      </div>
    )
  }
  return null
}

export const ChartColisParMois: React.FC<ChartColisParMoisProps> = ({ data, loading = false }) => {
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
            Évolution des Colis par Mois
          </Title>
          <div className="chart-legend-inline">
            <div className="legend-item">
              <span className="legend-dot groupage" />
              <span>Groupage</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot autres" />
              <span>Autres Envois</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot total" />
              <span>Total</span>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="chart-loading">
            <Spin size="large" />
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart 
              data={data} 
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              onClick={handleChartClick}
            >
              <defs>
                <linearGradient id="colorGroupage" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#667eea" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#667eea" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorAutres" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
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
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="groupage"
                stroke="#667eea"
                strokeWidth={3}
                fill="url(#colorGroupage)"
                name="Groupage"
                dot={{ fill: '#667eea', strokeWidth: 2, r: 4, cursor: 'pointer' }}
                activeDot={{ r: 8, cursor: 'pointer' }}
              />
              <Area
                type="monotone"
                dataKey="autresEnvois"
                stroke="#10b981"
                strokeWidth={3}
                fill="url(#colorAutres)"
                name="Autres Envois"
                dot={{ fill: '#10b981', strokeWidth: 2, r: 4, cursor: 'pointer' }}
                activeDot={{ r: 8, cursor: 'pointer' }}
              />
              <Area
                type="monotone"
                dataKey="total"
                stroke="#f59e0b"
                strokeWidth={3}
                fill="url(#colorTotal)"
                name="Total"
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4, cursor: 'pointer' }}
                activeDot={{ r: 8, cursor: 'pointer' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </Card>

      <ChartColisParMoisModal
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
