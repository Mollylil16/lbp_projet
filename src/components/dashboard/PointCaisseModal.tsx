import React, { useState } from 'react'
import { Modal, Typography, Table, Tag, Card, Row, Col, Statistic, Timeline, Alert, Button, Space, message } from 'antd'
import {
  ArrowUpOutlined, ArrowDownOutlined, DollarOutlined,
  CheckCircleOutlined, WarningOutlined, InfoCircleOutlined, FilePdfOutlined, FileExcelOutlined
} from '@ant-design/icons'
import { PointCaisse as PointCaisseType } from '@types'
import { formatMontantWithDevise, formatDate } from '@utils/format'
import { exportTableToPDF, exportTableToExcel } from '@utils/export'

const { Title, Text } = Typography

interface MouvementDetail {
  id: number
  type: string
  libelle: string
  montant: number
  date: string
  soldeApres: number
}

interface PointCaisseModalProps {
  visible: boolean
  onClose: () => void
  data: PointCaisseType
  mouvements?: MouvementDetail[]
}

export const PointCaisseModal: React.FC<PointCaisseModalProps> = ({
  visible,
  onClose,
  data,
  mouvements = [],
}) => {
  const [exporting, setExporting] = useState(false)
  const solde = data.entrees - data.sorties
  const ratio = data.entrees > 0 ? (data.sorties / data.entrees) * 100 : 0

  const handleExportPDF = () => {
    try {
      setExporting(true)
      const exportData = {
        headers: ['Date', 'Type', 'Libellé', 'Montant', 'Solde Après'],
        rows: mouvements.map(m => [
          formatDate(m.date),
          m.type,
          m.libelle,
          formatMontantWithDevise(m.montant),
          formatMontantWithDevise(m.soldeApres),
        ]),
      }
      exportTableToPDF(exportData, 'point_caisse', {
        title: 'Point Caisse du Jour',
      })
      message.success('Export PDF réussi')
    } catch (error) {
      message.error('Erreur lors de l\'export PDF')
      console.error(error)
    } finally {
      setExporting(false)
    }
  }

  const handleExportExcel = async () => {
    try {
      setExporting(true)
      const exportData = {
        headers: ['Date', 'Type', 'Libellé', 'Montant', 'Solde Après'],
        rows: mouvements.map(m => [
          formatDate(m.date),
          m.type,
          m.libelle,
          formatMontantWithDevise(m.montant),
          formatMontantWithDevise(m.soldeApres),
        ]),
      }
      await exportTableToExcel(exportData, 'point_caisse', {
        title: 'Point Caisse du Jour',
      })
      message.success('Export Excel réussi')
    } catch (error) {
      message.error('Erreur lors de l\'export Excel')
      console.error(error)
    } finally {
      setExporting(false)
    }
  }

  // Analyser les problèmes potentiels
  const problems: string[] = []
  if (solde < 0) {
    problems.push('Solde négatif détecté - Situation critique nécessitant une intervention immédiate')
  }
  if (ratio > 90) {
    problems.push('Taux de sortie très élevé (>90%) - Risque de trésorerie')
  }
  if (data.sorties > data.entrees * 0.8) {
    problems.push('Sorties importantes par rapport aux entrées - Surveiller les dépenses')
  }

  const mouvementColumns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      width: 120,
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 150,
      render: (type: string) => {
        const isEntree = type.includes('ENTREE') || type === 'APPRO'
        return (
          <Tag color={isEntree ? 'green' : 'red'}>
            {isEntree ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {type}
          </Tag>
        )
      },
    },
    {
      title: 'Libellé',
      dataIndex: 'libelle',
      key: 'libelle',
      ellipsis: true,
    },
    {
      title: 'Montant',
      dataIndex: 'montant',
      key: 'montant',
      width: 150,
      align: 'right' as const,
      render: (montant: number, record: MouvementDetail) => {
        const isEntree = record.type.includes('ENTREE') || record.type === 'APPRO'
        return (
          <Text strong style={{ color: isEntree ? '#52c41a' : '#ff4d4f' }}>
            {isEntree ? '+' : '-'} {formatMontantWithDevise(montant)}
          </Text>
        )
      },
    },
    {
      title: 'Solde Après',
      dataIndex: 'soldeApres',
      key: 'soldeApres',
      width: 150,
      align: 'right' as const,
      render: (solde: number) => (
        <Text strong style={{ color: solde < 0 ? '#ff4d4f' : '#52c41a' }}>
          {formatMontantWithDevise(solde)}
        </Text>
      ),
    },
  ]

  return (
    <Modal
      title={
        <Title level={4} style={{ margin: 0 }}>
          Détails - Point Caisse du Jour
        </Title>
      }
      open={visible}
      onCancel={onClose}
      width={1200}
      footer={
        <Space>
          <Button onClick={onClose}>Fermer</Button>
          <Button
            icon={<FilePdfOutlined />}
            onClick={handleExportPDF}
            loading={exporting}
          >
            Exporter PDF
          </Button>
          <Button
            type="primary"
            icon={<FileExcelOutlined />}
            onClick={handleExportExcel}
            loading={exporting}
          >
            Exporter Excel
          </Button>
        </Space>
      }
      style={{ top: 20 }}
    >
      <div style={{ maxHeight: '80vh', overflowY: 'auto' }}>
        {/* Résumé */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Total Entrées"
                value={data.entrees}
                prefix={<ArrowUpOutlined />}
                valueStyle={{ color: '#52c41a' }}
                formatter={(value: any) => formatMontantWithDevise(Number(value))}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Total Sorties"
                value={data.sorties}
                prefix={<ArrowDownOutlined />}
                valueStyle={{ color: '#ff4d4f' }}
                formatter={(value: any) => formatMontantWithDevise(Number(value))}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Solde Final"
                value={solde}
                prefix={<DollarOutlined />}
                valueStyle={{ color: solde < 0 ? '#ff4d4f' : '#1890ff', fontSize: 24 }}
                formatter={(value: any) => formatMontantWithDevise(Number(value))}
              />
            </Card>
          </Col>
        </Row>

        {/* Alertes de problèmes */}
        {problems.length > 0 && (
          <Card title={<><WarningOutlined style={{ color: '#ff4d4f' }} /> Alertes</>} style={{ marginBottom: 24 }}>
            {problems.map((problem, index) => (
              <Alert
                key={index}
                message={problem}
                type="warning"
                showIcon
                style={{ marginBottom: 8 }}
              />
            ))}
          </Card>
        )}

        {/* Indicateurs */}
        <Card title="Indicateurs Clés" style={{ marginBottom: 24 }}>
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Statistic
                title="Taux de Sortie"
                value={ratio}
                suffix="%"
                valueStyle={{ color: ratio > 90 ? '#ff4d4f' : ratio > 70 ? '#faad14' : '#52c41a' }}
              />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {ratio > 90
                  ? 'Très élevé - Attention requise'
                  : ratio > 70
                    ? 'Élevé - Surveiller'
                    : 'Normal'}
              </Text>
            </Col>
            <Col xs={24} sm={12}>
              <Statistic
                title="Ratio Entrées/Sorties"
                value={data.entrees > 0 ? (data.sorties / data.entrees).toFixed(2) : 0}
                prefix="1:"
                valueStyle={{ color: data.sorties > data.entrees ? '#ff4d4f' : '#52c41a' }}
              />
            </Col>
          </Row>
        </Card>

        {/* Mouvements détaillés */}
        {mouvements.length > 0 ? (
          <Card title="Mouvements Détaillés">
            <Table
              dataSource={mouvements}
              columns={mouvementColumns}
              pagination={{ pageSize: 10 }}
              size="small"
              rowKey="id"
            />
          </Card>
        ) : (
          <Card title="Mouvements Détaillés">
            <Alert
              message="Aucun mouvement disponible"
              description="Les détails des mouvements ne sont pas disponibles pour le moment."
              type="info"
              showIcon
            />
          </Card>
        )}

        {/* Recommandations */}
        <Card title="Recommandations" style={{ marginTop: 24 }}>
          <Timeline>
            {solde < 0 && (
              <Timeline.Item color="red" dot={<WarningOutlined />}>
                <Text strong>Action Urgente Requise</Text>
                <br />
                <Text type="secondary">
                  Le solde est négatif. Il est recommandé de procéder à un approvisionnement
                  immédiat de la caisse.
                </Text>
              </Timeline.Item>
            )}
            {ratio > 90 && (
              <Timeline.Item color="orange" dot={<InfoCircleOutlined />}>
                <Text strong>Surveillance des Sorties</Text>
                <br />
                <Text type="secondary">
                  Le taux de sortie est très élevé. Analyser les dépenses pour identifier
                  les opportunités d'optimisation.
                </Text>
              </Timeline.Item>
            )}
            {data.entrees > 0 && (
              <Timeline.Item color="green" dot={<CheckCircleOutlined />}>
                <Text strong>Performance Positive</Text>
                <br />
                <Text type="secondary">
                  Les entrées sont positives. Continuer à maintenir cette performance.
                </Text>
              </Timeline.Item>
            )}
          </Timeline>
        </Card>
      </div>
    </Modal>
  )
}
