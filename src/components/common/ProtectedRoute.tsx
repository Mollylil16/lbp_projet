import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@contexts/AuthContext'
import { Spin } from 'antd'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredPermission?: string | string[]
  requireAll?: boolean
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
  requireAll = false,
}) => {
  const { isAuthenticated, isLoading } = useAuth()

  // Afficher un loader pendant la vérification de l'authentification
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}>
        <Spin size="large" tip="Chargement..." />
      </div>
    )
  }

  // Rediriger vers login si non authentifié
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Vérifier les permissions si nécessaire
  // Note: La vérification des permissions sera implémentée avec usePermissions
  // quand le backend sera prêt

  return <>{children}</>
}
