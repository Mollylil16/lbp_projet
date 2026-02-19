import { useContext } from 'react'
import { PermissionsContext } from '@contexts/PermissionsContext'

/**
 * Custom hook pour accéder au contexte des permissions
 */
export const usePermissions = () => {
    const context = useContext(PermissionsContext)
    if (!context) {
        throw new Error('usePermissions must be used within a PermissionsProvider')
    }
    return context
}
