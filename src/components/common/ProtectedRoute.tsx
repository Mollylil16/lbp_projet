import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@contexts/AuthContext'
import { usePermissions } from '@contexts/PermissionsContext'
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
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth()
  const { isLoading: isPermsLoading } = usePermissions()

  // Debug logs
  if (process.env.NODE_ENV === 'development') {
    console.log('[ProtectedRoute]', { isAuthenticated, isLoading: isAuthLoading, hasUser: !!user, path: window.location.pathname })
  }

  const isLoading = isAuthLoading || isPermsLoading

  // Afficher un loader pendant la vérification de l'authentification et des permissions
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}>
        <Spin size="large" tip="Chargement...">
          <div style={{ padding: 50 }} />
        </Spin>
      </div>
    )
  }

  // Vérifier aussi le token dans localStorage comme fallback
  const hasToken = !!localStorage.getItem('lbp_token');
  
  // Si on a un token, on considère qu'on est authentifié même si user n'est pas encore défini
  // (cela peut arriver juste après le login avant que React ne mette à jour l'état)
  const shouldBeAuthenticated = isAuthenticated || hasToken;

  // Rediriger vers login UNIQUEMENT si on n'a ni utilisateur ni token ET qu'on n'est pas en train de charger
  if (!shouldBeAuthenticated && !hasToken && !isLoading) {
    console.warn('[ProtectedRoute] Not authenticated and no token, redirecting to login')
    return <Navigate to="/login" replace />
  }

  // Si on a un token mais pas d'utilisateur encore, attendre (cela peut arriver juste après le login)
  if (hasToken && !user && !isLoading) {
    console.log('[ProtectedRoute] Has token but no user yet, showing loader (might be just after login)')
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

  // Vérifier les permissions si nécessaire
  // Note: La vérification des permissions sera implémentée avec usePermissions
  // quand le backend sera prêt

  return <>{children}</>
}
