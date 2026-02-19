/**
 * Skeleton Loaders - LBP Transit
 * Composants de chargement pour toutes les sections de l'application
 */

import React from 'react'
import { Card, Row, Col, Space, Skeleton } from 'antd'
import './SkeletonLoader.css'

/* ═══════════════════════════════════════
   PRIMITIVES
═══════════════════════════════════════ */

const SkeletonLine: React.FC<{
  width?: string | number
  height?: number
  style?: React.CSSProperties
}> = ({ width = '100%', height = 14, style }) => (
  <div
    style={{
      width,
      height,
      borderRadius: 4,
      background: 'linear-gradient(90deg, var(--lbp-skeleton-from, #f2f2f2) 25%, var(--lbp-skeleton-to, #e8e8e8) 50%, var(--lbp-skeleton-from, #f2f2f2) 75%)',
      backgroundSize: '400% 100%',
      animation: 'skeleton-wave 1.4s ease infinite',
      ...style,
    }}
  />
)

const SkeletonBlock: React.FC<{
  width?: string | number
  height?: string | number
  borderRadius?: number
  style?: React.CSSProperties
}> = ({ width = '100%', height = 120, borderRadius = 8, style }) => (
  <div
    style={{
      width,
      height,
      borderRadius,
      background: 'linear-gradient(90deg, var(--lbp-skeleton-from, #f2f2f2) 25%, var(--lbp-skeleton-to, #e8e8e8) 50%, var(--lbp-skeleton-from, #f2f2f2) 75%)',
      backgroundSize: '400% 100%',
      animation: 'skeleton-wave 1.4s ease infinite',
      ...style,
    }}
  />
)

/* ═══════════════════════════════════════
   STAT CARD SKELETON
═══════════════════════════════════════ */
const StatCardSkeleton: React.FC = () => (
  <Card style={{ borderRadius: 12 }}>
    <Space direction="vertical" style={{ width: '100%' }} size={12}>
      <SkeletonLine width="60%" height={13} />
      <SkeletonLine width="40%" height={28} />
      <SkeletonLine width="80%" height={12} />
    </Space>
  </Card>
)

/* ═══════════════════════════════════════
   EXPORTS - COMPOSANTS INDIVIDUELS
═══════════════════════════════════════ */

/** Skeleton carte générique */
export const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <Card className={`skeleton-card ${className || ''}`}>
    <Skeleton active paragraph={{ rows: 3 }} />
  </Card>
)

/** Skeleton tableau avec vraies colonnes simulées */
export const TableSkeleton: React.FC<{
  rows?: number
  columns?: number
  showHeader?: boolean
}> = ({ rows = 6, columns = 5, showHeader = false }) => (
  <Card style={{ borderRadius: 12, padding: 0 }}>
    {showHeader && (
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--lbp-border, #f0f0f0)' }}>
        <SkeletonLine width="30%" height={16} />
      </div>
    )}
    <div style={{ padding: '8px 0' }}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: 12,
          padding: '10px 20px',
          borderBottom: '1px solid var(--lbp-border, #f0f0f0)',
        }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <SkeletonLine key={i} width="60%" height={12} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, row) => (
        <div
          key={row}
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gap: 12,
            padding: '14px 20px',
            borderBottom: row < rows - 1 ? '1px solid var(--lbp-border, #f0f0f0)' : 'none',
          }}
        >
          {Array.from({ length: columns }).map((_, col) => (
            <SkeletonLine
              key={col}
              width={col === 0 ? '80%' : col === columns - 1 ? '40%' : '65%'}
              height={13}
            />
          ))}
        </div>
      ))}
    </div>
  </Card>
)

/** Skeleton formulaire */
export const FormSkeleton: React.FC<{ fields?: number }> = ({ fields = 6 }) => (
  <Card>
    <Row gutter={[16, 24]}>
      {Array.from({ length: fields }).map((_, i) => (
        <Col key={i} xs={24} md={12}>
          <Space direction="vertical" style={{ width: '100%' }} size={6}>
            <SkeletonLine width="40%" height={12} />
            <SkeletonBlock height={32} borderRadius={6} />
          </Space>
        </Col>
      ))}
      <Col xs={24}>
        <SkeletonBlock width={120} height={36} borderRadius={6} />
      </Col>
    </Row>
  </Card>
)

/** Skeleton liste avec avatars */
export const ListSkeleton: React.FC<{ items?: number }> = ({ items = 5 }) => (
  <div style={{ padding: '8px 0' }}>
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '12px 16px' }}>
        <SkeletonBlock width={40} height={40} borderRadius={20} />
        <Space direction="vertical" style={{ flex: 1 }} size={6}>
          <SkeletonLine width="60%" height={13} />
          <SkeletonLine width="40%" height={11} />
        </Space>
      </div>
    ))}
  </div>
)

/** Skeleton graphique */
export const ChartSkeleton: React.FC<{ height?: number; title?: boolean }> = ({
  height = 220,
  title = true,
}) => (
  <Card style={{ borderRadius: 12 }}>
    {title && (
      <div style={{ marginBottom: 16 }}>
        <SkeletonLine width="45%" height={16} />
      </div>
    )}
    <SkeletonBlock height={height} borderRadius={8} />
  </Card>
)

/** Skeleton stats cards dashboard */
export const DashboardStatsSkeleton: React.FC = () => (
  <Row gutter={[16, 16]}>
    {Array.from({ length: 4 }).map((_, i) => (
      <Col key={i} xs={24} sm={12} lg={6}>
        <StatCardSkeleton />
      </Col>
    ))}
  </Row>
)

/** Skeleton détail avec avatar */
export const DetailsSkeleton: React.FC = () => (
  <Space direction="vertical" style={{ width: '100%' }} size={16}>
    <Card>
      <Row gutter={16} align="middle">
        <Col>
          <SkeletonBlock width={64} height={64} borderRadius={32} />
        </Col>
        <Col flex="auto">
          <Space direction="vertical" size={8}>
            <SkeletonLine width={200} height={20} />
            <SkeletonLine width={150} height={14} />
          </Space>
        </Col>
      </Row>
    </Card>
    <Card>
      <Row gutter={[16, 20]}>
        {Array.from({ length: 8 }).map((_, i) => (
          <Col key={i} xs={24} sm={12}>
            <Space direction="vertical" size={6} style={{ width: '100%' }}>
              <SkeletonLine width="35%" height={12} />
              <SkeletonLine width="70%" height={14} />
            </Space>
          </Col>
        ))}
      </Row>
    </Card>
  </Space>
)

/** Skeleton page colis */
export const ColisListSkeleton: React.FC = () => (
  <Space direction="vertical" style={{ width: '100%' }} size={16}>
    <Card size="small">
      <Row gutter={12}>
        <Col flex="auto"><SkeletonBlock height={32} borderRadius={6} /></Col>
        <Col><SkeletonBlock width={110} height={32} borderRadius={6} /></Col>
        <Col><SkeletonBlock width={110} height={32} borderRadius={6} /></Col>
      </Row>
    </Card>
    <TableSkeleton rows={8} columns={6} />
  </Space>
)

/** Skeleton page factures */
export const FactureListSkeleton: React.FC = () => (
  <Space direction="vertical" style={{ width: '100%' }} size={16}>
    <Card size="small">
      <Row gutter={12}>
        <Col flex="auto"><SkeletonBlock height={32} borderRadius={6} /></Col>
        <Col><SkeletonBlock width={120} height={32} borderRadius={6} /></Col>
      </Row>
    </Card>
    <TableSkeleton rows={7} columns={5} />
  </Space>
)

/** Skeleton page utilisateurs */
export const UsersListSkeleton: React.FC = () => (
  <Space direction="vertical" style={{ width: '100%' }} size={16}>
    <Row gutter={12} justify="end">
      <Col><SkeletonBlock width={130} height={32} borderRadius={6} /></Col>
    </Row>
    <TableSkeleton rows={6} columns={5} />
  </Space>
)

/** Skeleton page clients */
export const ClientsListSkeleton: React.FC = () => (
  <TableSkeleton rows={8} columns={5} />
)

/** Skeleton page expéditions */
export const ExpeditionsSkeleton: React.FC = () => (
  <Space direction="vertical" style={{ width: '100%' }} size={16}>
    <Row gutter={12} justify="end">
      <Col><SkeletonBlock width={150} height={32} borderRadius={6} /></Col>
    </Row>
    <TableSkeleton rows={5} columns={6} />
  </Space>
)

/** Skeleton page paiements */
export const PaiementsListSkeleton: React.FC = () => (
  <Space direction="vertical" style={{ width: '100%' }} size={16}>
    <Row gutter={[16, 16]}>
      {[1, 2, 3].map((i) => (
        <Col key={i} xs={24} sm={8}>
          <StatCardSkeleton />
        </Col>
      ))}
    </Row>
    <TableSkeleton rows={7} columns={5} />
  </Space>
)

/** Skeleton caisse */
export const CaisseSkeleton: React.FC = () => (
  <Space direction="vertical" style={{ width: '100%' }} size={24}>
    <Row gutter={[16, 16]}>
      {[1, 2].map((i) => (
        <Col key={i} xs={24} md={12}>
          <StatCardSkeleton />
        </Col>
      ))}
    </Row>
    <Card>
      <Space direction="vertical" style={{ width: '100%' }} size={12}>
        <SkeletonLine width="40%" height={16} />
        <SkeletonBlock height={200} />
      </Space>
    </Card>
  </Space>
)

/** Skeleton statistiques */
export const StatistiquesPageSkeleton: React.FC = () => (
  <Space direction="vertical" style={{ width: '100%' }} size={24}>
    <Row gutter={[16, 16]}>
      {[1, 2, 3, 4].map((i) => (
        <Col key={i} xs={24} sm={12} lg={6}><StatCardSkeleton /></Col>
      ))}
    </Row>
    <Row gutter={[16, 16]}>
      <Col xs={24} lg={16}><ChartSkeleton height={300} /></Col>
      <Col xs={24} lg={8}><ChartSkeleton height={300} /></Col>
    </Row>
    <ChartSkeleton height={250} />
  </Space>
)

/** Skeleton dashboard complet */
export const DashboardSkeleton: React.FC = () => (
  <Space direction="vertical" style={{ width: '100%' }} size={24}>
    <DashboardStatsSkeleton />
    <Card>
      <Row gutter={[16, 16]}>
        {[1, 2, 3].map((i) => (
          <Col key={i} xs={24} sm={8}><StatCardSkeleton /></Col>
        ))}
      </Row>
    </Card>
    <Row gutter={[24, 24]}>
      <Col xs={24} lg={8}><ChartSkeleton height={180} /></Col>
      <Col xs={24} lg={16}><ChartSkeleton height={180} /></Col>
    </Row>
    <Row gutter={[24, 24]}>
      <Col xs={24} lg={12}><ChartSkeleton height={200} /></Col>
      <Col xs={24} lg={12}><ChartSkeleton height={200} /></Col>
    </Row>
    <Row gutter={[24, 24]}>
      <Col xs={24} xl={16}><TableSkeleton rows={5} columns={4} /></Col>
      <Col xs={24} xl={8}>
        <Card>
          <Space direction="vertical" style={{ width: '100%' }} size={14}>
            <SkeletonLine width="70%" height={16} />
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  padding: 12,
                  background: 'var(--lbp-bg-tertiary, #fafafa)',
                  borderRadius: 8,
                }}
              >
                <Space direction="vertical" style={{ width: '100%' }} size={8}>
                  <SkeletonLine width="50%" height={13} />
                  <SkeletonLine width="90%" height={12} />
                </Space>
              </div>
            ))}
          </Space>
        </Card>
      </Col>
    </Row>
  </Space>
)

/** Skeleton générique (compatibilité ascendante) */
export const SkeletonLoader: React.FC<{
  type?: 'card' | 'table' | 'form' | 'list' | 'custom'
  rows?: number
  columns?: number
  className?: string
}> = ({ type = 'card', rows = 3, columns = 5, className = '' }) => {
  switch (type) {
    case 'table':
      return <TableSkeleton rows={rows} columns={columns} />
    case 'form':
      return <FormSkeleton fields={rows} />
    case 'list':
      return <ListSkeleton items={rows} />
    case 'card':
    default:
      return <CardSkeleton className={className} />
  }
}
