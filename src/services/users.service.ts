import { User } from '@types'
import { apiService } from './api.service'

class UsersService {
  async getAll(): Promise<User[]> {
    const users = await apiService.get<any[]>('/users')
    
    // Transformer les données du backend au format attendu par le frontend
    return users.map((user) => ({
      id: user.id,
      code_user: `USER${user.id.toString().padStart(3, '0')}`,
      username: user.username,
      full_name: user.fullname,
      email: null, // Peut être ajouté plus tard dans l'entité
      phone: null, // Peut être ajouté plus tard dans l'entité
      role: {
        id: this.getRoleId(user.role),
        code: user.role,
        name: this.getRoleName(user.role),
      },
      agency_id: user.id_agence || null,
      filter_mode: this.getFilterMode(user.code_acces),
      can_delete: user.code_acces === 2,
      can_modify: user.code_acces !== 2,
      status: user.isActive ? 'active' : 'inactive' as 'active' | 'inactive',
      created_at: user.created_at ? new Date(user.created_at).toISOString() : new Date().toISOString(),
    }))
  }

  private getRoleId(role: string): number {
    const roleMap: Record<string, number> = {
      'SUPER_ADMIN': 1,
      'ADMIN': 2,
      'OPERATEUR_COLIS': 3,
      'VALIDATEUR': 4,
      'CAISSIER': 5,
      'AGENCE_MANAGER': 6,
      'LECTURE_SEULE': 7,
    }
    return roleMap[role] || 3
  }

  private getRoleName(role: string): string {
    const nameMap: Record<string, string> = {
      'SUPER_ADMIN': 'Super Administrateur',
      'ADMIN': 'Administrateur',
      'OPERATEUR_COLIS': 'Opérateur Colis',
      'VALIDATEUR': 'Validateur',
      'CAISSIER': 'Caissier',
      'AGENCE_MANAGER': 'Gestionnaire Agence',
      'LECTURE_SEULE': 'Lecture Seule',
    }
    return nameMap[role] || 'Opérateur Colis'
  }

  private getFilterMode(code_acces: number): 'individual' | 'agency' | 'all' {
    if (code_acces === 2 || code_acces === 1) {
      return 'all'
    }
    return 'all'
  }
}

export const usersService = new UsersService()
