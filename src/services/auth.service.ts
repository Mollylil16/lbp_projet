import { User, LoginCredentials, AuthResponse } from '@types'
import { apiService } from './api.service'
import { validateMockUser } from '@config/mockUsers'

// Mode développement : utiliser les utilisateurs mock si le backend n'est pas disponible
// Désactiver le mode mock pour utiliser le vrai backend
const USE_MOCK_AUTH = false // import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_AUTH !== 'false'

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Mode mock pour le développement
    if (USE_MOCK_AUTH) {
      const mockResult = validateMockUser(credentials.username, credentials.password)
      
      if (!mockResult.valid) {
        throw new Error('Nom d\'utilisateur ou mot de passe incorrect')
      }

      // Simuler un délai de réponse
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Générer un token mock
      const mockToken = `mock_token_${credentials.username}_${Date.now()}`

      return {
        user: mockResult.user!,
        token: mockToken,
        refresh_token: `mock_refresh_${mockToken}`,
        permissions: mockResult.permissions || [],
      }
    }

    // Mode production : appel API réel
    return apiService.post<AuthResponse>('/auth/login', credentials)
  }

  async getCurrentUser(): Promise<User> {
    // Mode mock : récupérer depuis localStorage
    if (USE_MOCK_AUTH) {
      const userStr = localStorage.getItem('lbp_mock_user')
      if (userStr) {
        return JSON.parse(userStr)
      }
      throw new Error('Utilisateur non connecté')
    }

    return apiService.get<User>('/auth/me')
  }

  async getPermissions(): Promise<string[]> {
    // Mode mock : récupérer depuis localStorage
    if (USE_MOCK_AUTH) {
      const permissionsStr = localStorage.getItem('lbp_permissions')
      if (permissionsStr) {
        return JSON.parse(permissionsStr)
      }
      return []
    }

    return apiService.get<string[]>('/auth/permissions')
  }

  async logout(): Promise<void> {
    try {
      await apiService.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  async refreshToken(): Promise<{ token: string; refresh_token?: string }> {
    const refreshToken = localStorage.getItem('lbp_refresh_token')
    return apiService.post('/auth/refresh', { refresh_token: refreshToken })
  }
}

export const authService = new AuthService()
