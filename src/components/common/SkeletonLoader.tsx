/**
 * Composants de skeleton loaders réutilisables
 * Pour afficher des placeholders pendant le chargement
 */

import React from 'react'
import { Skeleton, Card, Table } from 'antd'
import './SkeletonLoader.css'

interface SkeletonLoaderProps {
  type?: 'card' | 'table' | 'form' | 'list' | 'custom'
  rows?: number
  columns?: number
  className?: string
}

/**
 * Skeleton pour une carte
 */
export const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <Card className={`skeleton-card ${className || ''}`}>
      <Skeleton active paragraph={{ rows: 3 }} />
    </Card>
  )
}

/**
 * Skeleton pour un tableau
 */
export const TableSkeleton: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 5,
}) => {
  return (
    <div className="table-skeleton-container">
      <Skeleton active paragraph={{ rows: 0 }} />
      <Table
        dataSource={Array.from({ length: rows }).map((_, i) => ({ key: i }))}
        columns={Array.from({ length: columns }).map((_, i) => ({
          title: <Skeleton.Input active size="small" style={{ width: 100 }} />,
          dataIndex: `col${i}`,
          key: `col${i}`,
          render: () => <Skeleton.Input active size="small" />,
        }))}
        pagination={false}
      />
    </div>
  )
}

/**
 * Skeleton pour un formulaire
 */
export const FormSkeleton: React.FC<{ fields?: number }> = ({ fields = 5 }) => {
  return (
    <div className="form-skeleton-container">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="form-skeleton-field">
          <Skeleton.Input active size="small" style={{ width: 100, marginBottom: 8 }} />
          <Skeleton.Input active block />
        </div>
      ))}
      <div className="form-skeleton-actions">
        <Skeleton.Button active size="large" style={{ width: 120 }} />
        <Skeleton.Button active size="large" style={{ width: 100 }} />
      </div>
    </div>
  )
}

/**
 * Skeleton pour une liste
 */
export const ListSkeleton: React.FC<{ items?: number }> = ({ items = 5 }) => {
  return (
    <div className="list-skeleton-container">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="list-skeleton-item">
          <Skeleton.Avatar active size="default" />
          <div className="list-skeleton-content">
            <Skeleton.Input active size="small" style={{ width: '60%', marginBottom: 8 }} />
            <Skeleton.Input active size="small" style={{ width: '40%' }} />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton générique
 */
export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type = 'card',
  rows = 3,
  columns = 5,
  className = '',
}) => {
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

/**
 * Skeleton pour le dashboard
 */
export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="dashboard-skeleton">
      <Skeleton active paragraph={{ rows: 1 }} style={{ marginBottom: 24 }} />
      
      {/* Stats cards */}
      <div className="dashboard-skeleton-stats">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>

      {/* Charts */}
      <div className="dashboard-skeleton-charts">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  )
}
