import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { DonneesAnnuelles } from '@services/statistiques.service'

interface ComparaisonAnneesChartProps {
  data: DonneesAnnuelles[]
  type: 'colis' | 'revenus'
}

const COLORS = ['#667eea', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']

export const ComparaisonAnneesChart: React.FC<ComparaisonAnneesChartProps> = ({ 
  data, 
  type 
}) => {
  // Transformer les données pour le graphique
  const chartData = React.useMemo(() => {
    const mois = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
    
    return mois.map(moisNom => {
      const point: any = { mois: moisNom }
      
      data.forEach((yearData, index) => {
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

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
          formatter={(value: number) => {
            if (type === 'revenus') {
              return `${value.toLocaleString()} FCFA`
            }
            return value
          }}
        />
        <Legend />
        {data.map((yearData, index) => (
          <Line
            key={yearData.annee}
            type="monotone"
            dataKey={yearData.annee.toString()}
            stroke={COLORS[index % COLORS.length]}
            strokeWidth={3}
            dot={{ r: 5 }}
            activeDot={{ r: 8 }}
            name={`${yearData.annee}`}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
