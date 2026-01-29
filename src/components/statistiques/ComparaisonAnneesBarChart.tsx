import React, { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { DonneesAnnuelles } from '@services/statistiques.service'
import { ComparaisonMoisModal } from './ComparaisonMoisModal'

interface ComparaisonAnneesBarChartProps {
  data: DonneesAnnuelles[]
  type: 'colis' | 'revenus'
}

const COLORS = ['#667eea', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export const ComparaisonAnneesBarChart: React.FC<ComparaisonAnneesBarChartProps> = ({ 
  data, 
  type 
}) => {
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedMois, setSelectedMois] = useState<string | null>(null)

  // Transformer les données pour le graphique en barres groupées
  const chartData = React.useMemo(() => {
    const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
    
    return mois.map(moisNom => {
      const point: any = { mois: moisNom }
      
      data.forEach((yearData) => {
        const moisData = yearData.mois.find(m => m.mois === moisNom)
        if (type === 'colis') {
          point[`${yearData.annee}`] = moisData?.total || 0
        } else {
          point[`${yearData.annee}`] = moisData?.revenus || 0
        }
      })
      
      return point
    })
  }, [data, type])

  const formatValue = (value: number) => {
    if (type === 'revenus') {
      return `${(value / 1000000).toFixed(1)}M`
    }
    return value.toString()
  }

  const handleBarClick = (data: any, index: number) => {
    if (data && data.mois) {
      setSelectedMois(data.mois)
      setModalVisible(true)
    }
  }

  return (
    <>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart 
          data={chartData} 
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          onClick={handleBarClick}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
          <XAxis 
            dataKey="mois" 
            stroke="#9ca3af"
            style={{ fontSize: 12 }}
          />
          <YAxis 
            stroke="#9ca3af"
            style={{ fontSize: 12 }}
            tickFormatter={formatValue}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(102, 126, 234, 0.1)' }}
            formatter={(value: number) => {
              if (type === 'revenus') {
                return `${value.toLocaleString()} FCFA`
              }
              return value.toLocaleString()
            }}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '12px',
            }}
          />
          <Legend />
          {data.map((yearData, index) => (
            <Bar
              key={yearData.annee}
              dataKey={yearData.annee.toString()}
              fill={COLORS[index % COLORS.length]}
              radius={[8, 8, 0, 0]}
              onClick={handleBarClick}
              cursor="pointer"
            >
              {chartData.map((entry, idx) => (
                <Cell 
                  key={`cell-${idx}`} 
                  fill={COLORS[index % COLORS.length]}
                  style={{ cursor: 'pointer' }}
                />
              ))}
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>

      <ComparaisonMoisModal
        visible={modalVisible}
        onClose={() => {
          setModalVisible(false)
          setSelectedMois(null)
        }}
        mois={selectedMois}
        data={data}
        type={type}
      />
    </>
  )
}
