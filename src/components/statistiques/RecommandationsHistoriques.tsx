import React from 'react'
import { Alert, List, Typography, Tag, Space } from 'antd'
import { 
  CheckCircleOutlined, 
  WarningOutlined, 
  InfoCircleOutlined,
  TrophyOutlined,
  CalendarOutlined 
} from '@ant-design/icons'
import { DonneesAnnuelles, TendancesMensuelles } from '@services/statistiques.service'

interface RecommandationsHistoriquesProps {
  historiqueData: DonneesAnnuelles[]
  tendancesData?: TendancesMensuelles[]
}

const { Title, Text, Paragraph } = Typography

export const RecommandationsHistoriques: React.FC<RecommandationsHistoriquesProps> = ({
  historiqueData,
  tendancesData,
}) => {
  const recommendations: Array<{
    type: 'success' | 'warning' | 'info'
    title: string
    description: string
    action?: string
  }> = []

  // Analyser les données pour générer des recommandations
  if (historiqueData.length >= 2) {
    const currentYear = historiqueData[historiqueData.length - 1]
    const previousYear = historiqueData[historiqueData.length - 2]

    const evolutionColis = ((currentYear.totalColis - previousYear.totalColis) / previousYear.totalColis) * 100

    // Recommandation basée sur l'évolution
    if (evolutionColis > 10) {
      recommendations.push({
        type: 'success',
        title: 'Croissance positive détectée',
        description: `Votre activité a augmenté de ${evolutionColis.toFixed(1)}% par rapport à l'année précédente. Continuez sur cette lancée !`,
        action: 'Maintenir les stratégies qui fonctionnent et investir dans les secteurs en croissance.',
      })
    } else if (evolutionColis < -10) {
      recommendations.push({
        type: 'warning',
        title: 'Baisse significative détectée',
        description: `Votre activité a diminué de ${Math.abs(evolutionColis).toFixed(1)}% par rapport à l'année précédente.`,
        action: 'Analyser les causes de la baisse et mettre en place des actions correctives.',
      })
    }

    // Identifier les meilleurs et pires mois
    if (tendancesData) {
      const meilleursMois = tendancesData
        .filter(t => t.tendance === 'hausse')
        .sort((a, b) => b.evolution - a.evolution)
        .slice(0, 3)

      const piresMois = tendancesData
        .filter(t => t.tendance === 'baisse')
        .sort((a, b) => a.evolution - b.evolution)
        .slice(0, 3)

      if (meilleursMois.length > 0) {
        recommendations.push({
          type: 'info',
          title: 'Mois les plus performants',
          description: `Les mois ${meilleursMois.map(m => m.mois).join(', ')} montrent une tendance à la hausse.`,
          action: `Renforcer les actions marketing et opérationnelles pendant ces périodes pour maximiser les résultats.`,
        })
      }

      if (piresMois.length > 0) {
        recommendations.push({
          type: 'warning',
          title: 'Mois à surveiller',
          description: `Les mois ${piresMois.map(m => m.mois).join(', ')} montrent une tendance à la baisse.`,
          action: `Développer des stratégies spécifiques pour ces périodes (promotions, campagnes ciblées, etc.).`,
        })
      }
    }

    // Recommandation sur la moyenne mensuelle
    const moyenneActuelle = currentYear.moyenneMensuelle
    const moyennePrecedente = previousYear.moyenneMensuelle
    const evolutionMoyenne = ((moyenneActuelle - moyennePrecedente) / moyennePrecedente) * 100

    if (evolutionMoyenne > 5) {
      recommendations.push({
        type: 'success',
        title: 'Performance mensuelle en amélioration',
        description: `La moyenne mensuelle a augmenté de ${evolutionMoyenne.toFixed(1)}%.`,
        action: 'Cette amélioration constante est un bon signe. Maintenez cette dynamique.',
      })
    }
  }

  // Recommandations générales
  recommendations.push({
    type: 'info',
    title: 'Planification stratégique',
    description: 'Utilisez ces données pour planifier vos ressources et vos objectifs pour l\'année à venir.',
    action: 'Établir des objectifs réalistes basés sur les tendances historiques et prévoir des actions correctives pour les mois difficiles.',
  })

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleOutlined />
      case 'warning':
        return <WarningOutlined />
      default:
        return <InfoCircleOutlined />
    }
  }

  return (
    <div>
      {recommendations.length > 0 ? (
        <List
          dataSource={recommendations}
          renderItem={(item) => (
            <List.Item>
              <Alert
                type={item.type}
                message={
                  <Space>
                    {getIcon(item.type)}
                    <Text strong>{item.title}</Text>
                  </Space>
                }
                description={
                  <div>
                    <Paragraph style={{ marginBottom: 8 }}>{item.description}</Paragraph>
                    {item.action && (
                      <div style={{ marginTop: 8, paddingLeft: 24 }}>
                        <Text type="secondary" italic>
                          💡 {item.action}
                        </Text>
                      </div>
                    )}
                  </div>
                }
                showIcon={false}
                style={{ width: '100%' }}
              />
            </List.Item>
          )}
        />
      ) : (
        <Alert
          message="Aucune recommandation disponible"
          description="Sélectionnez au moins deux années pour obtenir des recommandations basées sur la comparaison."
          type="info"
          showIcon
        />
      )}
    </div>
  )
}
