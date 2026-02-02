import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findByUsername(username);
        if (!user) {
            console.log(`[Auth] User not found: ${username}`);
            return null;
        }
        
        if (!user.isActive) {
            console.log(`[Auth] User is inactive: ${username}`);
            return null;
        }
        
        const isPasswordValid = await bcrypt.compare(pass, user.password);
        if (!isPasswordValid) {
            console.log(`[Auth] Invalid password for user: ${username}`);
            return null;
        }
        
        const { password, ...result } = user;
        return result;
    }

    async login(user: any) {
        const payload = {
            username: user.username,
            sub: user.id,
            role: user.role,
            code_acces: user.code_acces,
            id_agence: user.id_agence
        };
        
        // Formater l'utilisateur selon le format attendu par le frontend
        const formattedUser = {
            id: user.id,
            code_user: `USER${user.id.toString().padStart(3, '0')}`, // Générer un code_user
            username: user.username,
            full_name: user.fullname,
            email: null, // Peut être ajouté plus tard
            phone: null, // Peut être ajouté plus tard
            role: {
                id: this.getRoleId(user.role),
                code: user.role,
                name: this.getRoleName(user.role),
            },
            agency_id: user.id_agence || null,
            filter_mode: this.getFilterMode(user.code_acces),
            can_delete: user.code_acces === 2, // Seulement Super Admin
            can_modify: user.code_acces !== 2, // Super Admin ne peut pas modifier
            status: user.isActive ? 'active' : 'inactive' as 'active' | 'inactive',
            created_at: user.created_at ? new Date(user.created_at).toISOString() : new Date().toISOString(),
        };
        
        return {
            token: this.jwtService.sign(payload),
            refresh_token: this.jwtService.sign(payload, { expiresIn: '7d' }),
            user: formattedUser,
            permissions: this.getPermissionsForUser(user),
        };
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
        };
        return roleMap[role] || 3;
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
        };
        return nameMap[role] || 'Opérateur Colis';
    }
    
    private getFilterMode(code_acces: number): 'individual' | 'agency' | 'all' {
        // CODEACCES 2 = Super Admin (all)
        // CODEACCES 1 = Admin/Manager (all)
        // CODEACCES 8 = Individual
        // CODEACCES 9 = Agency
        if (code_acces === 2 || code_acces === 1) {
            return 'all';
        }
        // Pour l'instant, on retourne 'all' par défaut
        // TODO: Implémenter la logique complète selon CODEACCES
        return 'all';
    }

    getPermissionsForUser(user: any): string[] {
        // Dans lbp-frontend/src/constants/permissions.ts, CODEACCES 2 est Super Admin (*)
        if (user.code_acces === 2 || user.role === 'SUPER_ADMIN') {
            return ['*'];
        }
        // TODO: Implémenter une logique de mapping plus fine si nécessaire
        return [user.role.toLowerCase()];
    }
}
