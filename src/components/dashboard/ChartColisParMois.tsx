import React, { useState } from 'react'
import { Card, Typography, Spin } from 'antd'
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
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
            Évolution des Colis
          </Title>
          <div className="chart-legend-inline">
            <div className="legend-item">
              <span className="legend-dot groupage" />
              <span>Groupage</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot autres" />
              <span>Autres</span>
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
                  <stop offset="5%" stopColor="var(--premium-accent)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--premium-accent)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorAutres" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--premium-teal)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--premium-teal)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--premium-warning)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--premium-warning)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis
                dataKey="mois"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 500 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 12, fontWeight: 500 }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#E2E8F0', strokeWidth: 2 }} />
              <Area
                type="monotone"
                dataKey="groupage"
                stroke="var(--premium-accent)"
                strokeWidth={3}
                fill="url(#colorGroupage)"
                name="Groupage"
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--premium-accent)' }}
              />
              <Area
                type="monotone"
                dataKey="autresEnvois"
                stroke="var(--premium-teal)"
                strokeWidth={3}
                fill="url(#colorAutres)"
                name="Autres"
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--premium-teal)' }}
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
