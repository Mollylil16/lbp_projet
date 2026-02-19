import React, { useState, useRef } from 'react'
import { Modal, Typography, Table, Tag, Card, Row, Col, Statistic, Progress, Button, Space, message } from 'antd'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { DollarOutlined, InboxOutlined, ArrowUpOutlined, FilePdfOutlined, FileExcelOutlined } from '@ant-design/icons'
import { formatMontantWithDevise } from '@utils/format'
import { exportChartToPDF, exportTableToExcel } from '@utils/export'
import { svgToPng } from '@utils/export/chart'

const { Title, Text } = Typography

interface ChartData {
  name: string
  value: number
}

interface ChartRepartitionTraficModalProps {
  visible: boolean
  onClose: () => void
  data: ChartData[]
}

const COLORS = ['#667eea', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

// Calculer les revenus estimés par type de trafic
const calculateRevenus = (value: number, total: number): number => {
  // Estimation : revenus totaux mensuels de 50 000 000 FCFA
  const revenusTotaux = 50000000
  return (value / 100) * revenusTotaux
}

export const ChartRepartitionTraficModal: React.FC<ChartRepartitionTraficModalProps> = ({
  visible,
  onClose,
  data,
}) => {
  const [exporting, setExporting] = useState(false)
  const chartRef = useRef<HTMLDivElement>(null)
  const total = data.reduce((sum, item) => sum + item.value, 0)

  const tableData = data.map((item, index) => ({
    key: index,
    ...item,
    revenusEstimes: calculateRevenus(item.value, total),
    colisEstimes: Math.round((item.value / 100) * 1000), // Estimation basée sur 1000 colis total
  }))

  const handleExportPDF = async () => {
    try {
      setExporting(true)
      if (chartRef.current) {
        const svgElement = chartRef.current.querySelector('svg') as SVGElement
        if (svgElement) {
          const imageData = await svgToPng(svgElement)
          exportChartToPDF(imageData, 'repartition_trafic', 'Répartition des Colis par Trafic')
          message.success('Export PDF réussi')
        }
      }
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
        headers: ['Type de Trafic', 'Pourcentage', 'Colis Estimés', 'Revenus Estimés'],
        rows: tableData.map(item => [
          item.name,
          `${item.value}%`,
          item.colisEstimes,
          formatMontantWithDevise(item.revenusEstimes),
        ]),
      }
      await exportTableToExcel(exportData, 'repartition_trafic', {
        title: 'Répartition des Colis par Trafic',
      })
      message.success('Export Excel réussi')
    } catch (error) {
      message.error('Erreur lors de l\'export Excel')
      console.error(error)
    } finally {
      setExporting(false)
    }
  }

  const columns = [
    {
      title: 'Type de Trafic',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: any) => (
        <div>
          <Tag color={COLORS[record.key % COLORS.length]} style={{ marginRight: 8 }}>
            {name}
          </Tag>
        </div>
      ),
    },
    {
      title: 'Pourcentage',
      dataIndex: 'value',
      key: 'value',
      width: 150,
      render: (value: number) => (
        <div>
          <Progress
            percent={value}
            strokeColor={COLORS[tableData.findIndex(d => d.value === value) % COLORS.length]}
            size="small"
            format={() => `${value}%`}
          />
        </div>
      ),
    },
    {
      title: 'Colis Estimés',
      dataIndex: 'colisEstimes',
      key: 'colisEstimes',
      width: 120,
      align: 'right' as const,
      render: (colis: number) => (
        <Text>
          <InboxOutlined /> {colis}
        </Text>
      ),
    },
    {
      title: 'Revenus Estimés',
      dataIndex: 'revenusEstimes',
      key: 'revenusEstimes',
      width: 150,
      align: 'right' as const,
      render: (revenus: number) => (
        <Text strong>
          <DollarOutlined /> {formatMontantWithDevise(revenus)}
        </Text>
      ),
    },
  ]

  return (
    <Modal
      title={
        <Title level={4} style={{ margin: 0 }}>
          Détails - Répartition des Colis par Trafic
        </Title>
      }
      open={visible}
      onCancel={onClose}
      width={1000}
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
        {/* Graphique détaillé */}
        <Card title="Graphique Détaillé" style={{ marginBottom: 24 }}>
          <div ref={chartRef}>
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={150}
                  innerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="#ffffff"
                  strokeWidth={3}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Tableau détaillé */}
        <Card title="Analyse Détaillée par Type de Trafic">
          <Table
            dataSource={tableData}
            columns={columns}
            pagination={false}
            size="small"
          />

          <Row gutter={16} style={{ marginTop: 24 }}>
            <Col xs={24} sm={12}>
              <Card>
                <Statistic
                  title="Total Colis Estimés"
                  value={tableData.reduce((sum, item) => sum + item.colisEstimes, 0)}
                  prefix={<InboxOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card>
                <Statistic
                  title="Revenus Totaux Estimés"
                  value={tableData.reduce((sum, item) => sum + item.revenusEstimes, 0)}
                  prefix={<DollarOutlined />}
                  formatter={(value: any) => formatMontantWithDevise(Number(value))}
                />
              </Card>
            </Col>
          </Row>
        </Card>

        {/* Recommandations */}
        <Card title="Recommandations" style={{ marginTop: 24 }}>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {data.map((item, index) => {
              if (item.value < 10) {
                return (
                  <li key={index} style={{ marginBottom: 8 }}>
                    <Text>
                      <Tag color="orange">Faible</Tag> Le trafic <strong>{item.name}</strong> représente
                      seulement {item.value}%. Considérer des actions marketing ciblées pour augmenter
                      ce segment.
                    </Text>
                  </li>
                )
              }
              if (item.value > 40) {
                return (
                  <li key={index} style={{ marginBottom: 8 }}>
                    <Text>
                      <Tag color="green">Dominant</Tag> Le trafic <strong>{item.name}</strong> est
                      le segment principal ({item.value}%). Maintenir la qualité de service pour
                      conserver cette position.
                    </Text>
                  </li>
                )
              }
              return null
            })}
          </ul>
        </Card>
      </div>
    </Modal>
  )
}
