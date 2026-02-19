import React from 'react'
import { usePermissions } from '@hooks/usePermissions'

interface WithPermissionProps {
  permission: string | string[]
  fallback?: React.ReactNode
  requireAll?: boolean
  children: React.ReactNode
}

export const WithPermission: React.FC<WithPermissionProps> = ({
  permission,
  fallback = null,
  requireAll = false,
  children,
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions()

  let hasAccess = false

  if (Array.isArray(permission)) {
    hasAccess = requireAll
      ? hasAllPermissions(permission)
      : hasAnyPermission(permission)
  } else {
    hasAccess = hasPermission(permission)
  }

  return <>{hasAccess ? children : fallback}</>
}
