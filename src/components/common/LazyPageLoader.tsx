/**
 * Composant de chargement pour les pages lazy loaded
 * Affiche un skeleton pendant le chargement
 */

import React, { Suspense, ComponentType } from 'react'
import { Spin } from 'antd'
import { DashboardSkeleton } from './SkeletonLoader'
import './LazyPageLoader.css'

interface LazyPageLoaderProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Composant pour wrapper les pages lazy loaded avec un suspense
 */
export const LazyPageLoader: React.FC<LazyPageLoaderProps> = ({
  children,
  fallback,
}) => {
  const defaultFallback = (
    <div className="lazy-page-loader">
      <Spin size="large" tip="Chargement...">
        <div style={{ padding: 50 }} />
      </Spin>
    </div>
  )

  return (
    <Suspense fallback={fallback || defaultFallback}>{children}</Suspense>
  )
}

/**
 * Helper pour créer un composant lazy avec loader personnalisé
 */
export function createLazyPage<T extends ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = React.lazy(importFn)

  const WrappedComponent: React.FC<React.ComponentProps<T>> = (props) => {
    return (
      <LazyPageLoader fallback={fallback}>
        <LazyComponent {...props} />
      </LazyPageLoader>
    )
  }

  WrappedComponent.displayName = `Lazy(${(LazyComponent as any).displayName || 'Component'})`

  return WrappedComponent
}
