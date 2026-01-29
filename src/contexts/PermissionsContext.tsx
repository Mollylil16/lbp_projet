import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from './AuthContext'
import { authService } from '@services/auth.service'

interface PermissionsContextType {
  permissions: string[]
  hasPermission: (permission: string) => boolean
  hasAnyPermission: (permissions: string[]) => boolean
  hasAllPermissions: (permissions: string[]) => boolean
  isLoading: boolean
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined)

export const PermissionsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthenticated } = useAuth()
  const [permissions, setPermissions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadPermissions = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Vérifier d'abord le cache localStorage
      const cachedPermissions = localStorage.getItem('lbp_permissions')
      if (cachedPermissions) {
        try {
          const parsed = JSON.parse(cachedPermissions)
          setPermissions(parsed)
          setIsLoading(false)
        } catch (e) {
          // Cache invalide, charger depuis l'API
        }
      }

      // Charger depuis l'API
      const userPermissions = await authService.getPermissions()
      setPermissions(userPermissions)
      
      // Mettre à jour le cache
      localStorage.setItem('lbp_permissions', JSON.stringify(userPermissions))
    } catch (error) {
      console.error('Error loading permissions:', error)
      setPermissions([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated && user) {
      loadPermissions()
    } else {
      setPermissions([])
      setIsLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.id]) // Utiliser user?.id au lieu de user pour éviter les re-renders

  const hasPermission = (permission: string): boolean => {
    // Super admin a toutes les permissions
    if (user?.role?.code === 'SUPER_ADMIN') {
      return true
    }
    
    // Vérifier la permission spécifique
    return permissions.includes(permission)
  }

  const hasAnyPermission = (permissionList: string[]): boolean => {
    if (user?.role?.code === 'SUPER_ADMIN') {
      return true
    }
    
    return permissionList.some((p) => permissions.includes(p))
  }

  const hasAllPermissions = (permissionList: string[]): boolean => {
    if (user?.role?.code === 'SUPER_ADMIN') {
      return true
    }
    
    return permissionList.every((p) => permissions.includes(p))
  }

  const value: PermissionsContextType = {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isLoading,
  }

  return (
    <PermissionsContext.Provider value={value}>
      {children}
    </PermissionsContext.Provider>
  )
}

export const usePermissions = () => {
  const context = useContext(PermissionsContext)
  if (!context) {
    throw new Error('usePermissions must be used within a PermissionsProvider')
  }
  return context
}
