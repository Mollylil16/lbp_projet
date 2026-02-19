import React from 'react'
import { Table, Tag, Progress, Row, Col, Card, Statistic } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined, MinusOutlined } from '@ant-design/icons'
import { TendancesMensuelles } from '@services/statistiques.service'
import { formatMontantWithDevise } from '@utils/format'
import './AnalyseTendancesMensuelles.css'

interface AnalyseTendancesMensuellesProps {
  data: TendancesMensuelles[]
}

export const AnalyseTendancesMensuelles: React.FC<AnalyseTendancesMensuellesProps> = ({
  data
}) => {
  const moisReussis = data.filter(t => t.tendance === 'hausse')
  const moisChutes = data.filter(t => t.tendance === 'baisse')
  const moisStables = data.filter(t => t.tendance === 'stable')

  const columns = [
    {
      title: 'Mois',
      dataIndex: 'mois',
      key: 'mois',
      width: 100,
    },
    {
      title: 'Meilleure Performance',
      key: 'meilleure',
      render: (record: TendancesMensuelles) => (
        <div>
          <Tag color="green">{record.meilleureAnnee}</Tag>
          <span>{record.meilleureValeur.toLocaleString()} colis</span>
        </div>
      ),
    },
    {
      title: 'Pire Performance',
      key: 'pire',
      render: (record: TendancesMensuelles) => (
        <div>
          <Tag color="red">{record.pireAnnee}</Tag>
          <span>{record.pireValeur.toLocaleString()} colis</span>
        </div>
      ),
    },
    {
      title: 'Moyenne',
      dataIndex: 'moyenne',
      key: 'moyenne',
      render: (value: number) => value.toLocaleString(),
    },
    {
      title: 'Évolution',
      dataIndex: 'evolution',
      key: 'evolution',
      render: (evolution: number, record: TendancesMensuelles) => {
        const isPositive = evolution >= 0
        const Icon = isPositive ? ArrowUpOutlined : ArrowDownOutlined
        return (
          <Tag color={isPositive ? 'green' : 'red'} icon={<Icon />}>
            {Math.abs(evolution).toFixed(1)}%
          </Tag>
        )
      },
    },
    {
      title: 'Tendance',
      dataIndex: 'tendance',
      key: 'tendance',
      render: (tendance: string) => {
        const config: Record<string, { color: string; label: string; icon: any }> = {
          hausse: { color: 'green', label: 'Hausse', icon: <ArrowUpOutlined /> },
          baisse: { color: 'red', label: 'Baisse', icon: <ArrowDownOutlined /> },
          stable: { color: 'default', label: 'Stable', icon: <MinusOutlined /> },
        }
        const conf = config[tendance] || config.stable
        return (
          <Tag color={conf.color} icon={conf.icon}>
            {conf.label}
          </Tag>
        )
      },
    },
  ]

  return (
    <div>
      {/* Résumé */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Mois en Hausse"
              value={moisReussis.length}
              prefix={<ArrowUpOutlined />}
              valueStyle={{ color: '#52c41a' }}
              suffix={`/ ${data.length}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Mois en Baisse"
              value={moisChutes.length}
              prefix={<ArrowDownOutlined />}
              valueStyle={{ color: '#ff4d4f' }}
              suffix={`/ ${data.length}`}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Mois Stables"
              value={moisStables.length}
              prefix={<MinusOutlined />}
              valueStyle={{ color: '#8c8c8c' }}
              suffix={`/ ${data.length}`}
            />
          </Card>
        </Col>
      </Row>

      {/* Tableau détaillé */}
      <Table
        dataSource={data}
        columns={columns}
        rowKey="mois"
        pagination={false}
        size="small"
        rowClassName={(record: TendancesMensuelles) => {
          if (record.tendance === 'hausse') return 'row-success'
          if (record.tendance === 'baisse') return 'row-danger'
          return ''
        }}
      />
    </div>
  )
}
