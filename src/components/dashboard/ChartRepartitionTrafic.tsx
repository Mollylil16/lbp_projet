import React, { useState } from 'react'
import { Card, Typography, Spin } from 'antd'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { ChartRepartitionTraficModal } from './ChartRepartitionTraficModal'
import './ChartRepartitionTrafic.css'

const { Title } = Typography

interface ChartData {
  name: string
  value: number
}

interface ChartRepartitionTraficProps {
  data: ChartData[]
  loading?: boolean
}

const COLORS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #10b981 0%, #059669 100%)',
  'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
  'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
  'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
]

const COLOR_HEX = ['#667eea', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0]
    return (
      <div className="chart-tooltip">
        <div className="tooltip-header">{data.name}</div>
        <div className="tooltip-item">
          <span className="tooltip-value">{data.value}%</span>
        </div>
      </div>
    )
  }
  return null
}

const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  if (percent < 0.05) return null

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={12}
      fontWeight={600}
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export const ChartRepartitionTrafic: React.FC<ChartRepartitionTraficProps> = ({ data, loading = false }) => {
  const [modalVisible, setModalVisible] = useState(false)

  return (
    <>
      <Card 
        className="modern-chart-card" 
        style={{ cursor: 'pointer' }}
        onClick={() => setModalVisible(true)}
        hoverable
      >
        <div className="chart-header">
          <Title level={4} className="chart-title">
            Répartition des Colis par Trafic
          </Title>
        </div>
        
        {loading ? (
          <div className="chart-loading">
            <Spin size="large" />
          </div>
        ) : (
          <div className="pie-chart-container">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={CustomLabel}
                  outerRadius={120}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="#ffffff"
                  strokeWidth={3}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLOR_HEX[index % COLOR_HEX.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            
            <div className="pie-legend">
              {data.map((entry, index) => (
                <div key={index} className="pie-legend-item">
                  <div
                    className="pie-legend-dot"
                    style={{
                      background: COLORS[index % COLORS.length],
                      boxShadow: `0 0 12px ${COLOR_HEX[index % COLOR_HEX.length]}40`,
                    }}
                  />
                  <span className="pie-legend-label">{entry.name}</span>
                  <span className="pie-legend-value">{entry.value}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      <ChartRepartitionTraficModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        data={data}
      />
    </>
  )
}
