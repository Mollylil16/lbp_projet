import React from 'react'
import { Row, Col, Card, Statistic, Typography } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined, InboxOutlined, DollarOutlined } from '@ant-design/icons'
import { DonneesAnnuelles } from '@services/statistiques.service'
import { formatMontantWithDevise } from '@utils/format'

interface ResumeComparaisonProps {
  data: DonneesAnnuelles[]
}

const { Title, Text } = Typography

export const ResumeComparaison: React.FC<ResumeComparaisonProps> = ({ data }) => {
  // Calculer les totaux et évolutions
  const currentYear = data[data.length - 1]
  const previousYear = data[data.length - 2]

  const evolutionColis = previousYear
    ? ((currentYear.totalColis - previousYear.totalColis) / previousYear.totalColis) * 100
    : 0

  const evolutionRevenus = previousYear
    ? ((currentYear.totalRevenus - previousYear.totalRevenus) / previousYear.totalRevenus) * 100
    : 0

  return (
    <Card>
      <Title level={4} style={{ marginBottom: 24 }}>
        Résumé de la Comparaison
      </Title>
      <Row gutter={16}>
        {data.map((yearData, index) => (
          <Col xs={24} sm={12} md={6} key={yearData.annee}>
            <Card>
              <Statistic
                title={`Année ${yearData.annee}`}
                value={yearData.totalColis}
                prefix={<InboxOutlined />}
                suffix="colis"
                valueStyle={{ fontSize: 20 }}
              />
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">
                  Revenus: {formatMontantWithDevise(yearData.totalRevenus)}
                </Text>
              </div>
              <div style={{ marginTop: 4 }}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Moyenne: {yearData.moyenneMensuelle.toFixed(0)} colis/mois
                </Text>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {previousYear && (
        <Row gutter={16} style={{ marginTop: 24 }}>
          <Col xs={24} sm={12}>
            <Card>
              <Statistic
                title="Évolution des Colis"
                value={Math.abs(evolutionColis)}
                prefix={evolutionColis >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                suffix="%"
                valueStyle={{ 
                  color: evolutionColis >= 0 ? '#52c41a' : '#ff4d4f',
                  fontSize: 24 
                }}
              />
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">
                  {currentYear.totalColis.toLocaleString()} vs {previousYear.totalColis.toLocaleString()} colis
                </Text>
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12}>
            <Card>
              <Statistic
                title="Évolution des Revenus"
                value={Math.abs(evolutionRevenus)}
                prefix={evolutionRevenus >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                suffix="%"
                valueStyle={{ 
                  color: evolutionRevenus >= 0 ? '#52c41a' : '#ff4d4f',
                  fontSize: 24 
                }}
              />
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">
                  {formatMontantWithDevise(currentYear.totalRevenus)} vs {formatMontantWithDevise(previousYear.totalRevenus)}
                </Text>
              </div>
            </Card>
          </Col>
        </Row>
      )}
    </Card>
  )
}
